/**
 * Applies supabase/schema.sql and supabase/seed.sql to the database.
 *
 * Needs SUPABASE_DB_URL in .env (Supabase > Settings > Database >
 * Connection string). Use the "Session pooler" or direct connection string,
 * not the transaction pooler, because this runs DDL.
 *
 *   node scripts/migrate.mjs          # schema + seed
 *   node scripts/migrate.mjs schema   # schema only
 *   node scripts/migrate.mjs seed     # seed only
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import pg from 'pg';

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
const connectionString = env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error(
    'SUPABASE_DB_URL is not set in .env.\n\n' +
      'Get it from: Supabase > Settings > Database > Connection string\n' +
      'Choose "Session pooler" (or the direct connection), copy the URI and\n' +
      'replace [YOUR-PASSWORD] with your database password.',
  );
  process.exit(1);
}

const which = process.argv[2];
const files = [];
if (!which) {
  files.push('supabase/schema.sql', 'supabase/seed.sql');
} else if (which === 'schema') {
  files.push('supabase/schema.sql');
} else if (which === 'seed') {
  files.push('supabase/seed.sql');
} else {
  // Any explicit path, e.g. supabase/migrations/001_product_management.sql
  files.push(which);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log('Connected.\n');

  for (const file of files) {
    const sql = readFileSync(path.join(ROOT, file), 'utf8');
    process.stdout.write(`Running ${file} ... `);
    await client.query(sql);
    console.log('done');
  }

  const { rows } = await client.query(
    'select count(*)::int as products from public.products',
  );
  console.log(`\nProducts in database: ${rows[0].products}`);
  console.log('Migration complete.');
} catch (error) {
  console.error(`\nFAILED: ${error.message}`);
  if (error.position) console.error(`at character ${error.position}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
