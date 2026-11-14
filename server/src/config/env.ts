import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env if present
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16).default('leaf_jwt_secret_dev_key_2026_sanctuary'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(16).default('leaf_refresh_secret_dev_key_2026_sanctuary'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_placeholder_key'),
  RAZORPAY_KEY_SECRET: z.string().default('rzp_test_placeholder_secret'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('rzp_webhook_placeholder_secret'),
  MONGODB_URI: z.string().optional(),
  REDIS_URL: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ FATAL: Invalid Server Environment Configuration:');
  console.error(parsedEnv.error.format());
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

export const ENV = parsedEnv.success ? parsedEnv.data : envSchema.parse({});
