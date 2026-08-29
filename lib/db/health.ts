import { sql } from "drizzle-orm";

import { env } from "@/lib/env";

import { getDb } from "./index";

export type DbHealth =
  | { status: "ok"; latencyMs: number }
  | { status: "not_configured" }
  | { status: "error"; message: string };

/**
 * Runs `select 1` against the configured database.
 *
 * Never throws — returns a discriminated result so the health endpoint can
 * degrade gracefully. The `message` field is for server logs only and must not
 * be forwarded to unauthenticated clients.
 */
export async function checkDatabaseHealth(): Promise<DbHealth> {
  if (!env.DATABASE_URL) return { status: "not_configured" };

  const startedAt = performance.now();
  try {
    await getDb().execute(sql`select 1`);
    return {
      status: "ok",
      latencyMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "unknown database error",
    };
  }
}
