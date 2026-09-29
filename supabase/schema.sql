-- Boots Hyper Market - database schema
-- Run this once in the Supabase SQL Editor (Dashboard > SQL Editor > New query).
-- Safe to re-run: every statement is guarded.

-- ---------------------------------------------------------------- extensions
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------- products
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  name              text        not null,
  slug              text        not null unique,
  description       text        not null default '',
  price             numeric(10,2) not null check (price >= 0),
  compare_at_price  numeric(10,2) check (compare_at_price is null or compare_at_price >= 0),
  images            text[]      not null default '{}',
  sizes             text[]      not null default '{}',
  category          text        not null default '',
  brand             text        not null default 'Boots Hyper Market',
  stock             integer     not null default 0 check (stock >= 0),
  is_active         boolean     not null default true,

  -- Extra columns the existing storefront already renders. Keeping them here
  -- means the shop reads everything it needs from one table.
  department        text        not null default 'footwear',
  gender            text        not null default 'unisex',
  colors            jsonb       not null default '[]'::jsonb,
  material          text        not null default '',
  care              text        not null default '',
  featured          boolean     not null default false,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists products_slug_idx       on public.products (slug);
create index if not exists products_active_idx     on public.products (is_active);
create index if not exists products_category_idx   on public.products (category);
create index if not exists products_department_idx on public.products (department);

-- ------------------------------------------------------------------- orders
do $$ begin
  create type public.order_status as enum
    ('NEW','CONFIRMED','PACKED','SHIPPED','DELIVERED','CANCELLED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('PENDING','PAID','FAILED','REFUNDED');
exception when duplicate_object then null; end $$;

create table if not exists public.orders (
  id                   uuid primary key default gen_random_uuid(),
  order_number         text not null unique,

  customer_name        text not null,
  customer_email       text not null,
  customer_phone       text not null,

  shipping_address     text not null,
  shipping_city        text not null,
  shipping_state       text not null,
  shipping_postal_code text not null,
  shipping_country     text not null default 'India',

  subtotal             numeric(10,2) not null check (subtotal >= 0),
  shipping_fee         numeric(10,2) not null default 0 check (shipping_fee >= 0),
  discount             numeric(10,2) not null default 0 check (discount >= 0),
  total_amount         numeric(10,2) not null check (total_amount >= 0),

  payment_status       public.payment_status not null default 'PENDING',
  order_status         public.order_status   not null default 'NEW',

  -- Guards against a double-submitted checkout creating two orders.
  idempotency_key      text unique,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists orders_created_idx  on public.orders (created_at desc);
create index if not exists orders_number_idx   on public.orders (order_number);
create index if not exists orders_status_idx   on public.orders (order_status);
create index if not exists orders_payment_idx  on public.orders (payment_status);
create index if not exists orders_phone_idx    on public.orders (customer_phone);
create index if not exists orders_email_idx    on public.orders (customer_email);

-- -------------------------------------------------------------- order_items
-- product_name / product_image / unit_price are deliberate snapshots so that
-- historical orders stay accurate when the catalogue changes later.
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,

  product_name  text not null,
  product_image text not null default '',
  size          text not null,
  quantity      integer not null check (quantity > 0),
  unit_price    numeric(10,2) not null check (unit_price >= 0),
  total_price   numeric(10,2) not null check (total_price >= 0),

  created_at    timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ------------------------------------------------------- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------- order number series
-- One counter row per day. The upsert is atomic, so concurrent checkouts can
-- never be handed the same sequence number.
create table if not exists public.order_counters (
  day        date primary key,
  last_value integer not null default 0
);

create or replace function public.next_order_number()
returns text language plpgsql security definer set search_path = public as $$
declare
  today date := (now() at time zone 'Asia/Kolkata')::date;
  seq   integer;
begin
  insert into public.order_counters as c (day, last_value)
  values (today, 1)
  on conflict (day) do update set last_value = c.last_value + 1
  returning last_value into seq;

  return 'ORD-' || to_char(today, 'YYYYMMDD') || '-' || lpad(seq::text, 4, '0');
end $$;

-- ------------------------------------------------------------ create_order
-- Creates the order and its items in a single transaction. Totals are passed
-- in already validated and recalculated by the API function; this exists so a
-- failure part-way through can never leave an order without its items.
create or replace function public.create_order(payload jsonb)
returns public.orders
language plpgsql security definer set search_path = public as $$
declare
  new_order public.orders;
  item      jsonb;
  existing  public.orders;
  idem      text := nullif(payload->>'idempotency_key', '');
begin
  if idem is not null then
    select * into existing from public.orders where idempotency_key = idem;
    if found then
      return existing;
    end if;
  end if;

  insert into public.orders (
    order_number, customer_name, customer_email, customer_phone,
    shipping_address, shipping_city, shipping_state, shipping_postal_code, shipping_country,
    subtotal, shipping_fee, discount, total_amount, idempotency_key
  ) values (
    public.next_order_number(),
    payload->>'customer_name',
    payload->>'customer_email',
    payload->>'customer_phone',
    payload->>'shipping_address',
    payload->>'shipping_city',
    payload->>'shipping_state',
    payload->>'shipping_postal_code',
    coalesce(payload->>'shipping_country', 'India'),
    (payload->>'subtotal')::numeric,
    (payload->>'shipping_fee')::numeric,
    coalesce((payload->>'discount')::numeric, 0),
    (payload->>'total_amount')::numeric,
    idem
  )
  returning * into new_order;

  for item in select * from jsonb_array_elements(payload->'items') loop
    insert into public.order_items (
      order_id, product_id, product_name, product_image,
      size, quantity, unit_price, total_price
    ) values (
      new_order.id,
      nullif(item->>'product_id','')::uuid,
      item->>'product_name',
      coalesce(item->>'product_image',''),
      item->>'size',
      (item->>'quantity')::integer,
      (item->>'unit_price')::numeric,
      (item->>'total_price')::numeric
    );

    -- Decrement stock, never below zero.
    update public.products
       set stock = greatest(stock - (item->>'quantity')::integer, 0)
     where id = nullif(item->>'product_id','')::uuid;
  end loop;

  return new_order;
end $$;

-- ------------------------------------------------------------------- RLS
alter table public.products       enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.order_counters enable row level security;

-- Anyone (including anonymous visitors) may read products that are on sale.
drop policy if exists "public reads active products" on public.products;
create policy "public reads active products"
  on public.products for select
  to anon, authenticated
  using (is_active = true);

-- Orders are never readable by the public. Only a signed-in admin can see them.
drop policy if exists "admin reads orders" on public.orders;
create policy "admin reads orders"
  on public.orders for select
  to authenticated
  using (true);

drop policy if exists "admin updates orders" on public.orders;
create policy "admin updates orders"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "admin reads order items" on public.order_items;
create policy "admin reads order items"
  on public.order_items for select
  to authenticated
  using (true);

-- No policies are defined for anon on orders/order_items/order_counters, so
-- with RLS enabled those tables are completely closed to the browser.
-- Order creation happens through the service-role key inside the Vercel
-- function, which bypasses RLS.
