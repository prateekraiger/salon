/**
 * Supabase Client Configuration
 * Provides typed admin and public clients
 */
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
export declare const supabaseAdmin: SupabaseClient<Database>;
export declare const supabase: SupabaseClient<Database>;
export declare const checkSupabaseConnection: () => Promise<boolean>;
export default supabaseAdmin;
//# sourceMappingURL=supabase.d.ts.map