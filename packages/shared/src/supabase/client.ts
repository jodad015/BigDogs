import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

export function createClient(supabaseUrl: string, supabaseAnonKey: string) {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

export type AppSupabaseClient = SupabaseClient<Database>;
