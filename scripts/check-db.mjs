/**
 * Connectivity and readiness check against Supabase.
 * Reads .env directly so it works without a dev server running.
 *
 *   node scripts/check-db.mjs
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(import.meta.dirname, '..');

function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(path.join(ROOT, '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (match) env[match[1]] = match[2].trim();
    }
  } catch {
    console.error('No .env file found.');
    process.exit(1);
  }
  return env;
}

const env = loadEnv();
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

if (!url || !serviceKey || !anonKey) {
  console.error('Missing SUPABASE_URL / keys in .env');
  process.exit(1);
}

console.log(`Project: ${url}\n`);

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const anon = createClient(url, anonKey, { auth: { persistSession: false } });

const results = [];
async function check(label, fn) {
  try {
    const message = await fn();
    console.log(`  PASS  ${label} - ${message}`);
    results.push(true);
  } catch (error) {
    console.log(`  FAIL  ${label} - ${error.message}`);
    results.push(false);
  }
}

async function countRows(client, table) {
  const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  if (count === null || count === undefined) {
    throw new Error('table did not report a row count (it probably does not exist)');
  }
  return count;
}

console.log('Tables');
await check('products exists', async () => `${await countRows(admin, 'products')} rows`);
await check('orders exists', async () => `${await countRows(admin, 'orders')} rows`);
await check('order_items exists', async () => `${await countRows(admin, 'order_items')} rows`);

console.log('\nFunctions');
await check('create_order callable', async () => {
  const { error } = await admin.rpc('create_order', { payload: {} });
  if (error && /could not find|does not exist|schema cache/i.test(error.message)) {
    throw new Error(error.message);
  }
  return 'present';
});
await check('next_order_number callable', async () => {
  const { data, error } = await admin.rpc('next_order_number');
  if (error) throw new Error(error.message);
  return `would issue ${data}`;
});

console.log('\nRow Level Security');
await check('anon CAN read active products', async () => {
  const { data, error } = await anon.from('products').select('slug').limit(3);
  if (error) throw new Error(error.message);
  if (!data.length) throw new Error('no products visible - has seed.sql been run?');
  return `${data.length} visible`;
});
await check('anon CANNOT read orders', async () => {
  const { data, error } = await anon.from('orders').select('id').limit(1);
  if (error) return `blocked (${error.message.slice(0, 50)})`;
  if (!data || data.length === 0) return 'blocked (returns nothing)';
  throw new Error('SECURITY PROBLEM: anonymous users can read orders');
});
await check('anon CANNOT insert an order', async () => {
  const { error } = await anon.from('orders').insert({
    order_number: 'ORD-TEST-9999',
    customer_name: 'x',
    customer_email: 'x@example.com',
    customer_phone: '0000000000',
    shipping_address: 'x',
    shipping_city: 'x',
    shipping_state: 'x',
    shipping_postal_code: '000000',
    subtotal: 0,
    total_amount: 0,
  });
  if (!error) throw new Error('SECURITY PROBLEM: anonymous users can insert orders');
  return `blocked (${error.message.slice(0, 50)})`;
});

const ok = results.every(Boolean);
console.log(
  ok
    ? '\nDatabase is ready.'
    : '\nDatabase is NOT ready - run supabase/schema.sql then supabase/seed.sql in the Supabase SQL Editor.',
);
process.exit(ok ? 0 : 1);
