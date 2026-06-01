/**
 * Supabase Client Configuration
 * Provides typed admin and public clients
 */

import { createClient } from '@supabase/supabase-js';
import env from './env';

// Admin client with service role key (bypasses RLS - use only in backend)
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Public client with anon key (respects RLS)
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

// Health check function
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data: _data, error } = await supabaseAdmin.from('services').select('id').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return false;
  }
};

export default supabaseAdmin;
