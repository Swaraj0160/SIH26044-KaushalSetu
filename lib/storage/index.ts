import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env, isSupabaseConfigured } from "@/lib/env";

/**
 * Storage architecture (setup phase)
 * ----------------------------------
 * Supabase Storage will hold user-uploaded evidence artefacts (certificates,
 * project files, reports). Buckets, RLS policies and signed-URL helpers are
 * defined in the master build phase.
 *
 * This module only establishes the *server-side* admin entry point. It requires
 * the service-role key and must never be imported into client code (`server-only`
 * guards that at build time).
 */

/** Intended bucket names — created via migration/SQL in the master build phase. */
export const STORAGE_BUCKETS = {
  evidence: "evidence",
  avatars: "avatars",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export function isStorageConfigured(): boolean {
  return isSupabaseConfigured() && Boolean(env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Server-only Supabase client with the service-role key.
 * Bypasses RLS — use only in trusted server code with explicit authorization
 * checks already performed.
 */
export function createSupabaseAdminClient() {
  if (!isStorageConfigured()) {
    throw new Error(
      "Supabase Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL, " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL as string,
    env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
