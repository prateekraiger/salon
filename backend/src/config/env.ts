/**
 * Environment Configuration with Zod Validation
 * Validates all required environment variables at startup
 */

import { config } from 'dotenv';
import { z } from 'zod';
import type { EnvConfig } from '../types';

// Load .env file
config();

// Define validation schema
const envSchema = z.object({
  PORT: z.string().default('5000').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  
  // Razorpay
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  
  // Twilio (optional for WhatsApp)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_WHATSAPP_FROM: z.string().optional(),
  SALON_WHATSAPP_NUMBER: z.string().optional(),
  
  // Admin & Security
  ADMIN_SECRET_KEY: z.string().min(8, 'ADMIN_SECRET_KEY must be at least 8 characters'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters').default(() => {
    // Fallback to ADMIN_SECRET_KEY if JWT_SECRET not provided (for backwards compatibility)
    return process.env.ADMIN_SECRET_KEY || '';
  }),
  
  // CORS
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
});

// Validate environment variables
const parseEnv = (): EnvConfig => {
  try {
    const parsed = envSchema.parse(process.env);
    
    // Ensure JWT_SECRET is set
    if (!parsed.JWT_SECRET && parsed.ADMIN_SECRET_KEY) {
      parsed.JWT_SECRET = parsed.ADMIN_SECRET_KEY;
    }
    
    return parsed as EnvConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
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

export const env = parseEnv();

// Helper to check if WhatsApp is configured
export const isWhatsAppConfigured = (): boolean => {
  return !!(
    env.TWILIO_ACCOUNT_SID &&
    env.TWILIO_AUTH_TOKEN &&
    env.TWILIO_WHATSAPP_FROM &&
    env.SALON_WHATSAPP_NUMBER
  );
};

// Helper to check if Razorpay is configured
export const isRazorpayConfigured = (): boolean => {
  return !!(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
};

export default env;
