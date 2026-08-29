import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * PLACEHOLDER SCHEMA — this is NOT the SIH26044 domain model.
 *
 * The real schema (competency graph, evidence, skill gaps, internships,
 * placements, institutional analytics, ...) is designed in the master build
 * phase, after the domain research is done.
 *
 * This single table exists only so that:
 *   - `npm run db:generate` produces a real migration, and
 *   - database connectivity can be exercised end to end.
 */
export const healthCheck = pgTable("health_check", {
  id: serial("id").primaryKey(),
  label: text("label").notNull().default("ok"),
  checkedAt: timestamp("checked_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
