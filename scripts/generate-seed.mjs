/**
 * Generates supabase/seed.sql from the existing catalogue in
 * src/data/products.ts, so the shop's product data is authored in one place.
 *
 *   node scripts/generate-seed.mjs
 */
import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '..');
const DEFAULT_STOCK = 25;

/** Escapes a value for a single-quoted SQL literal. */
const q = (value) => `'${String(value).replace(/'/g, "''")}'`;

/** Renders a JS string array as a Postgres text[] literal. */
const textArray = (values) =>
  `ARRAY[${values.map((v) => q(v)).join(', ')}]::text[]`;

async function loadProducts() {
  const dir = await mkdtemp(path.join(tmpdir(), 'bhm-seed-'));
  const outfile = path.join(dir, 'products.mjs');
  try {
    await build({
      entryPoints: [path.join(ROOT, 'src/data/products.ts')],
      outfile,
      bundle: true,
      format: 'esm',
      platform: 'node',
      logLevel: 'silent',
    });
    const mod = await import(pathToFileURL(outfile).href);
    return mod.products;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const products = await loadProducts();

const rows = products.map((p) => {
  const columns = [
    q(p.name),
    q(p.slug),
    q(p.description),
    p.price,
    'NULL', // compare_at_price
    textArray(p.images),
    textArray(p.sizes),
    q(p.category),
    q('Boots Hyper Market'),
    DEFAULT_STOCK,
    'true',
    q(p.department),
    q(p.gender),
    `${q(JSON.stringify(p.colors))}::jsonb`,
    q(p.material),
    q(p.care),
    p.featured ? 'true' : 'false',
  ];
  return `  (${columns.join(', ')})`;
});

const sql = `-- Boots Hyper Market - product seed data
-- Generated from src/data/products.ts by scripts/generate-seed.mjs.
-- Do not edit by hand; re-run the generator instead.
--
-- Run in the Supabase SQL Editor AFTER schema.sql.
-- Re-running is safe: existing rows are updated, not duplicated.
-- Note that stock is only set on first insert, so re-seeding will not
-- overwrite stock levels you have since adjusted.

insert into public.products (
  name, slug, description, price, compare_at_price, images, sizes,
  category, brand, stock, is_active,
  department, gender, colors, material, care, featured
) values
${rows.join(',\n')}
on conflict (slug) do update set
  name        = excluded.name,
  description = excluded.description,
  price       = excluded.price,
  images      = excluded.images,
  sizes       = excluded.sizes,
  category    = excluded.category,
  department  = excluded.department,
  gender      = excluded.gender,
  colors      = excluded.colors,
  material    = excluded.material,
  care        = excluded.care,
  featured    = excluded.featured,
  updated_at  = now();
`;

await writeFile(path.join(ROOT, 'supabase/seed.sql'), sql, 'utf8');
console.log(`Wrote supabase/seed.sql with ${products.length} products.`);
