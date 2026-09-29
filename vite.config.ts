import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import apiPlugin from './scripts/vite-api-plugin.mjs';

export default defineConfig(({ mode }) => {
  // Server-only variables (service role key, Resend key) have no VITE_ prefix,
  // so Vite does not load them into process.env by default. The dev-only API
  // plugin needs them, so load them here for the dev server process only.
  // Nothing from this is exposed to the browser bundle.
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SHIPPING_FEE',
    'FREE_SHIPPING_THRESHOLD',
    'RESEND_API_KEY',
    'ADMIN_EMAIL',
    'FROM_EMAIL',
    'ADMIN_DASHBOARD_URL',
  ]) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }

  return {
    plugins: [react(), apiPlugin({ root: process.cwd() })],
    server: {
      port: 5173,
      strictPort: false,
    },
  };
});
