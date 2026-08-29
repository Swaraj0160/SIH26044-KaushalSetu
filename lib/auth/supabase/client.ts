"use client";

import { createBrowserClient } from "@supabase/ssr";

import { env, isSupabaseConfigured } from "@/lib/env";

/**
 * Supabase client for Client Components (browser).
 *
 * Only ever uses the public anon key — never the service-role key.
 */
export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }

  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL as string,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  );
}
