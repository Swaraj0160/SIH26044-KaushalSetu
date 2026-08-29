/**
 * Database seed entry point.  Run with:  npm run db:seed
 *
 * SETUP PHASE: the domain schema does not exist yet, so this only seeds the
 * placeholder `health_check` table — enough to prove the seed path works end to
 * end (env -> client -> write -> read). The master build phase replaces the body
 * with real reference/demo data (clearly labelled as synthetic in the UI).
 *
 * Safe to run repeatedly. Never seeds destructive data. No-ops with a clear
 * message when DATABASE_URL is absent.
 */
import "./load-env";

import { closeDb, getDb } from "@/lib/db";
import { healthCheck } from "@/lib/db/schema";
import { env } from "@/lib/env";

async function main() {
  if (!env.DATABASE_URL) {
    console.log(
      "[seed] DATABASE_URL is not set — nothing to seed. Configure Supabase in .env.local first.",
    );
    return;
  }

  const db = getDb();

  try {
    await db.select().from(healthCheck).limit(1);
  } catch {
    console.error(
      "[seed] table 'health_check' not found. Run `npm run db:migrate` first.",
    );
    process.exitCode = 1;
    return;
  }

  await db.insert(healthCheck).values({ label: "seed" });
  const rows = await db.select().from(healthCheck);
  console.log(`[seed] ok — health_check now has ${rows.length} row(s).`);
}

main()
  .catch((error) => {
    console.error("[seed] failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
