/**
 * Supabase Server-Side Client
 * 
 * For use in backend/Hono server only.
 * Uses service role key to bypass Row Level Security when needed.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.warn('[Supabase Backend] Missing SUPABASE_URL environment variable');
}

if (!SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_ANON_KEY) {
  console.warn('[Supabase Backend] Missing Supabase keys. Please set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
}

/**
 * Create admin client with service role key (bypasses RLS)
 * Use this for server-side operations that need to bypass Row Level Security
 */
export function createSupabaseAdmin(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create client with anon key (respects RLS)
 * Use this when you want to respect Row Level Security policies
 */
export function createSupabaseClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Default admin client instance
 */
export const supabaseAdmin = createSupabaseAdmin();

