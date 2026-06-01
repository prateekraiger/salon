"use strict";
/**
 * Environment Configuration with Zod Validation
 * Validates all required environment variables at startup
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRazorpayConfigured = exports.isWhatsAppConfigured = exports.env = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
// Load .env file
(0, dotenv_1.config)();
// Define validation schema
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('5000').transform(Number),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    // Supabase
    SUPABASE_URL: zod_1.z.string().url('SUPABASE_URL must be a valid URL'),
    SUPABASE_ANON_KEY: zod_1.z.string().min(1, 'SUPABASE_ANON_KEY is required'),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
    // Razorpay
    RAZORPAY_KEY_ID: zod_1.z.string().min(1, 'RAZORPAY_KEY_ID is required'),
    RAZORPAY_KEY_SECRET: zod_1.z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
    RAZORPAY_WEBHOOK_SECRET: zod_1.z.string().optional(),
    // Twilio (optional for WhatsApp)
    TWILIO_ACCOUNT_SID: zod_1.z.string().optional(),
    TWILIO_AUTH_TOKEN: zod_1.z.string().optional(),
    TWILIO_WHATSAPP_FROM: zod_1.z.string().optional(),
    SALON_WHATSAPP_NUMBER: zod_1.z.string().optional(),
    // Admin & Security
    ADMIN_SECRET_KEY: zod_1.z.string().min(8, 'ADMIN_SECRET_KEY must be at least 8 characters'),
    JWT_SECRET: zod_1.z.string().min(8, 'JWT_SECRET must be at least 8 characters').default(() => {
        // Fallback to ADMIN_SECRET_KEY if JWT_SECRET not provided (for backwards compatibility)
        return process.env.ADMIN_SECRET_KEY || '';
    }),
    // CORS
    FRONTEND_URL: zod_1.z.string().url().default('http://localhost:3000'),
});
// Validate environment variables
const parseEnv = () => {
    try {
        const parsed = envSchema.parse(process.env);
        // Ensure JWT_SECRET is set
        if (!parsed.JWT_SECRET && parsed.ADMIN_SECRET_KEY) {
            parsed.JWT_SECRET = parsed.ADMIN_SECRET_KEY;
        }
        return parsed;
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            console.error('❌ Environment validation failed:');
            error.errors.forEach((err) => {
                console.error(`   • ${err.path.join('.')}: ${err.message}`);
            });
            console.error('\nPlease check your .env file and ensure all required variables are set.');
            process.exit(1);
        }
        throw error;
    }
};
exports.env = parseEnv();
// Helper to check if WhatsApp is configured
const isWhatsAppConfigured = () => {
    return !!(exports.env.TWILIO_ACCOUNT_SID &&
        exports.env.TWILIO_AUTH_TOKEN &&
        exports.env.TWILIO_WHATSAPP_FROM &&
        exports.env.SALON_WHATSAPP_NUMBER);
};
exports.isWhatsAppConfigured = isWhatsAppConfigured;
// Helper to check if Razorpay is configured
const isRazorpayConfigured = () => {
    return !!(exports.env.RAZORPAY_KEY_ID && exports.env.RAZORPAY_KEY_SECRET);
};
exports.isRazorpayConfigured = isRazorpayConfigured;
exports.default = exports.env;
//# sourceMappingURL=env.js.map