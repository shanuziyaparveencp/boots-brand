import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from './config';

/**
 * Browser Supabase client, using the anon key. Row Level Security limits this
 * to reading active products, plus reading/updating orders once an admin has
 * signed in. It can never read orders anonymously.
 *
 * Null when the project has no Supabase credentials configured.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'bhm.auth',
      },
    })
  : null;

/** Narrowing helper for code paths that require Supabase. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    );
  }
  return supabase;
}
