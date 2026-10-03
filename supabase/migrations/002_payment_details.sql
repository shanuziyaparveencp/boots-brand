-- Transaction details captured when an order is marked as paid, plus the
-- customer-facing order lookup. Additive and safe to re-run.

alter table public.orders
  add column if not exists payment_reference text,
  add column if not exists payment_method    text,
  add column if not exists payment_note      text,
  add column if not exists paid_at           timestamptz;

comment on column public.orders.payment_reference is
  'UPI reference / bank transaction id / receipt number entered by staff.';
comment on column public.orders.payment_method is
  'How the customer paid: UPI, Cash, Card, Bank Transfer, Other.';
comment on column public.orders.paid_at is
  'When payment was recorded. Set the moment payment_status becomes PAID.';

-- Stamp paid_at automatically so staff never have to think about it, and clear
-- it again if an order is moved back out of PAID.
create or replace function public.stamp_paid_at()
returns trigger language plpgsql as $$
begin
  if new.payment_status = 'PAID' and (old.payment_status is distinct from 'PAID') then
    new.paid_at := coalesce(new.paid_at, now());
  elsif new.payment_status <> 'PAID' then
    new.paid_at := null;
  end if;
  return new;
end $$;

drop trigger if exists orders_stamp_paid_at on public.orders;
create trigger orders_stamp_paid_at
  before update on public.orders
  for each row execute function public.stamp_paid_at();

-- Index for the customer order-lookup endpoint, which matches on the order
-- number and the email together.
create index if not exists orders_lookup_idx
  on public.orders (order_number, customer_email);

-- Orders stay closed to anonymous users. The lookup runs inside a Vercel
-- function with the service-role key and only returns a row when the order
-- number and email both match, so no new RLS policy is added here.
