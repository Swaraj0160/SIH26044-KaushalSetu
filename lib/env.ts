import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Centralised, validated environment access.
 *
 * Design goals for the setup phase:
 *  - The application MUST boot with zero external credentials (mock AI, no DB).
 *  - Anything that would break local dev when missing is `.optional()`.
 *  - `SKIP_ENV_VALIDATION=1` bypasses validation (used by Docker/CI image builds).
 */
export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.url().optional(),
    DIRECT_URL: z.url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    GEMINI_API_KEY: z.string().min(1).optional(),
    AI_PROVIDER: z.enum(["mock", "gemini"]).default("mock"),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    AI_PROVIDER: process.env.AI_PROVIDER,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
  emptyStringAsUndefined: true,
});

export function isDatabaseConfigured(): boolean {
  return Boolean(env.DATABASE_URL);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isGeminiConfigured(): boolean {
  return Boolean(env.GEMINI_API_KEY);
}

/** The provider that will actually be used, after falling back to mock. */
export function resolvedAiProvider(): "mock" | "gemini" {
  return env.AI_PROVIDER === "gemini" && isGeminiConfigured()
    ? "gemini"
    : "mock";
}
