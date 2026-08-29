import "dotenv/config";

import { defineConfig } from "drizzle-kit";

/**
 * drizzle-kit uses the DIRECT (non-pooled, port 5432) connection for DDL.
 * Falls back to DATABASE_URL. An empty string is fine until a DB is configured —
 * the CLI only needs it for `generate` when introspecting, not for offline work.
 */
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
