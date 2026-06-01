"use strict";
/**
 * Supabase Client Configuration
 * Provides typed admin and public clients
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSupabaseConnection = exports.supabase = exports.supabaseAdmin = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = __importDefault(require("./env"));
// Admin client with service role key (bypasses RLS - use only in backend)
exports.supabaseAdmin = (0, supabase_js_1.createClient)(env_1.default.SUPABASE_URL, env_1.default.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
// Public client with anon key (respects RLS)
exports.supabase = (0, supabase_js_1.createClient)(env_1.default.SUPABASE_URL, env_1.default.SUPABASE_ANON_KEY);
// Health check function
const checkSupabaseConnection = async () => {
    try {
        const { data, error } = await exports.supabaseAdmin.from('services').select('id').limit(1);
        if (error)
            throw error;
        return true;
    }
    catch (error) {
        console.error('Supabase connection failed:', error);
        return false;
    }
};
exports.checkSupabaseConnection = checkSupabaseConnection;
exports.default = exports.supabaseAdmin;
//# sourceMappingURL=supabase.js.map