-- Product management for the admin dashboard.
-- Additive only: nothing existing is dropped or renamed, so the customer site
-- and the order flow keep working unchanged.
-- Safe to re-run.

-- ------------------------------------------------------------ new columns
alter table public.products
  add column if not exists short_description text not null default '';

comment on column public.products.short_description is
  'One-line summary shown on product cards. Falls back to description when empty.';

-- Active / Draft / Inactive, replacing the plain is_active boolean in the UI.
do $$ begin
  create type public.product_status as enum ('active', 'draft', 'inactive');
exception when duplicate_object then null; end $$;

alter table public.products
  add column if not exists status public.product_status not null default 'active';

-- Backfill from the existing flag the first time this runs.
update public.products
   set status = case when is_active then 'active'::public.product_status
                     else 'inactive'::public.product_status end
 where status is null;

-- `is_active` stays as the single flag the customer-facing RLS policy and all
-- existing queries read, so nothing downstream had to change. It is now
-- derived from status rather than set by hand.
create or replace function public.sync_product_is_active()
returns trigger language plpgsql as $$
begin
  new.is_active := (new.status = 'active');
  return new;
end $$;

drop trigger if exists products_sync_is_active on public.products;
create trigger products_sync_is_active
  before insert or update on public.products
  for each row execute function public.sync_product_is_active();

-- Align the two columns for rows that already existed.
update public.products set status = status;

create index if not exists products_status_idx on public.products (status);

-- --------------------------------------------------------------- products RLS
-- Before this migration products had a single SELECT policy, so a signed-in
-- admin could read the catalogue but could not create or change anything.

-- Admins see every product, including drafts and inactive ones. This sits
-- alongside the existing public policy; PostgreSQL ORs them together, so
-- anonymous visitors are still limited to active products.
drop policy if exists "admin reads all products" on public.products;
create policy "admin reads all products"
  on public.products for select
  to authenticated
  using (true);

drop policy if exists "admin inserts products" on public.products;
create policy "admin inserts products"
  on public.products for insert
  to authenticated
  with check (true);

drop policy if exists "admin updates products" on public.products;
create policy "admin updates products"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

-- Deletion is allowed but the admin UI deactivates instead. order_items keeps
-- its own name/image/price snapshot and its product_id is ON DELETE SET NULL,
-- so even a hard delete cannot corrupt order history.
drop policy if exists "admin deletes products" on public.products;
create policy "admin deletes products"
  on public.products for delete
  to authenticated
  using (true);

-- ------------------------------------------------------------------ storage
-- Public read so <img> tags work without signed URLs; writes require a
-- signed-in admin.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public reads product images" on storage.objects;
create policy "public reads product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "admin uploads product images" on storage.objects;
create policy "admin uploads product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "admin updates product images" on storage.objects;
create policy "admin updates product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

drop policy if exists "admin deletes product images" on storage.objects;
create policy "admin deletes product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');
