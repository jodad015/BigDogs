import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

export function createClient(supabaseUrl: string, supabaseAnonKey: string) {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

export type AppSupabaseClient = SupabaseClient;
