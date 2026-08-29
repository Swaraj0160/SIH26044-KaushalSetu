import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env";

import * as schema from "./schema";

export { schema };
export type Database = PostgresJsDatabase<typeof schema>;

let sqlClient: ReturnType<typeof postgres> | null = null;
let db: Database | null = null;

/**
 * Lazily creates the Drizzle client.
 *
 * Nothing connects at import time, so the app boots fine without `DATABASE_URL`.
 * Callers that need the DB get a clear error instead of a crash on startup.
 *
 * Connection settings are tuned for Supabase's pooler + serverless:
 *   - `prepare: false`  — required behind PgBouncer (transaction pooling)
 *   - `max: 1`          — one socket per serverless invocation
 */
export function getDb(): Database {
  if (!env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add Supabase/Postgres credentials to .env.local " +
        "(see .env.example and DEVELOPMENT.md).",
    );
  }
  if (!db) {
    sqlClient = postgres(env.DATABASE_URL, { prepare: false, max: 1 });
    db = drizzle(sqlClient, { schema });
  }
  return db;
}

/** Closes the pool. Intended for scripts and test teardown, not request paths. */
export async function closeDb(): Promise<void> {
  if (sqlClient) {
    await sqlClient.end({ timeout: 5 });
    sqlClient = null;
    db = null;
  }
}
