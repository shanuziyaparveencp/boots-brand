/**
 * Client-side configuration. Everything here is display-only: the serverless
 * order function recalculates prices, shipping and totals from the database
 * before an order is written.
 */

function numberFromEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export const SHIPPING_FEE = numberFromEnv(import.meta.env.VITE_SHIPPING_FEE, 100);

export const FREE_SHIPPING_THRESHOLD = numberFromEnv(
  import.meta.env.VITE_FREE_SHIPPING_THRESHOLD,
  4999,
);

/** Shipping shown in the cart. Mirrors the server rule in api/orders.ts. */
export function estimateShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

/**
 * When Supabase is not configured the shop still runs off the bundled
 * catalogue, so local development and the marketing pages never break.
 * Checkout and the admin area do require it.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
