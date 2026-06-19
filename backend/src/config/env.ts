import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5001),
  DATABASE_URL: z.string().min(1),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:3000"),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  COOKIE_SECRET: z.string().min(16).default("customhub-cookie-secret"),
  // Google OAuth (Authorization Code flow)
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  GOOGLE_REDIRECT_URI: z.string().url().optional().default("http://localhost:3000/auth/google/callback"),
  RAZORPAY_KEY_ID: z.string().optional().default(""),
  RAZORPAY_KEY_SECRET: z.string().optional().default(""),
  CLOUDINARY_URL: z.string().optional().default(""),
  // Email (SMTP) for password reset
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  SMTP_FROM: z.string().optional().default(""),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  ADMIN_NAME: z.string().optional().default("CustomHub Admin"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid backend environment", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
