/**
 * Supabase Client Configuration
 * 
 * Provides Supabase client instances for both client-side and server-side use.
 * Uses environment variables for configuration.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getEnvVar } from '@/config/env';

// Get Supabase configuration from environment variables
const SUPABASE_URL = getEnvVar('EXPO_PUBLIC_SUPABASE_URL') || getEnvVar('SUPABASE_URL');
const SUPABASE_ANON_KEY = getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = getEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase] Missing Supabase configuration. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
  );
}

/**
 * Client-side Supabase client (uses anon key)
 * Safe to use in frontend - respects Row Level Security policies
 */
export function createSupabaseClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Server-side Supabase client (uses service role key)
 * Bypasses Row Level Security - use only in backend/server code
 * 
 * WARNING: Never expose the service role key to the client!
 */
export function createSupabaseAdminClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
      '[Supabase] Missing service role key. Admin client not available.'
    );
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
 * Default client instance (client-side)
 */
export const supabase = createSupabaseClient();

/**
 * Database Types
 * These match the Supabase schema
 */
export interface Database {
  public: {
    Tables: {
      rules: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          conditions: Record<string, unknown>;
          actions: Record<string, unknown>;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          conditions: Record<string, unknown>;
          actions: Record<string, unknown>;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          conditions?: Record<string, unknown>;
          actions?: Record<string, unknown>;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      custom_folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          rule: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color: string;
          rule?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          rule?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          theme: string | null;
          settings: Record<string, unknown> | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme?: string | null;
          settings?: Record<string, unknown> | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          theme?: string | null;
          settings?: Record<string, unknown> | null;
          updated_at?: string;
        };
      };
    };
  };
}

