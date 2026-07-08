import { createClient } from '@supabase/supabase-js';

/**
 * A minimal, unauthenticated Supabase client safe to use in Next.js
 * Server Components (no browser storage access, no session persistence).
 * Only ever used for PUBLIC reads (e.g. published blog posts, public jobs)
 * that anon is allowed to see under RLS.
 */
export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
