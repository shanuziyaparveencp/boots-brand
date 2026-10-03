/**
 * Read-only inspection of the live Supabase schema, policies and storage.
 * Used to check what already exists before adding anything.
 *
 *   node scripts/inspect-db.mjs
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(import.meta.dirname, '..');

function loadEnv() {
  const env = {};
  const raw = readFileSync(path.join(ROOT, '.env'), 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
const client = new pg.Client({
  connectionString: env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const q = async (label, sql) => {
  const { rows } = await client.query(sql);
  console.log(`\n=== ${label} ===`);
  console.table(rows);
  return rows;
};

await q(
  'products columns',
  `select column_name, data_type, is_nullable, column_default
     from information_schema.columns
    where table_schema='public' and table_name='products'
    order by ordinal_position`,
);

await q(
  'orders columns (status-related)',
  `select column_name, data_type, column_default
     from information_schema.columns
    where table_schema='public' and table_name='orders'
      and column_name in ('order_status','payment_status','updated_at')`,
);

await q(
  'enum types',
  `select t.typname, string_agg(e.enumlabel, ', ' order by e.enumsortorder) as values
     from pg_type t join pg_enum e on e.enumtypid = t.oid
     join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
    group by t.typname`,
);

await q(
  'RLS policies',
  `select tablename, policyname, cmd, roles::text
     from pg_policies where schemaname='public' order by tablename, policyname`,
);

await q(
  'how order_items references products',
  `select conname, pg_get_constraintdef(oid) as definition
     from pg_constraint
    where conrelid = 'public.order_items'::regclass and contype = 'f'`,
);

await q('row counts', `select
  (select count(*) from public.products) as products,
  (select count(*) from public.orders) as orders,
  (select count(*) from public.order_items) as order_items`);

await client.end();

// Storage buckets go through the API rather than SQL.
const supa = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const { data: buckets, error } = await supa.storage.listBuckets();
console.log('\n=== storage buckets ===');
if (error) console.log('error:', error.message);
else if (!buckets.length) console.log('(none)');
else console.table(buckets.map((b) => ({ name: b.name, public: b.public })));
