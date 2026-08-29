/** Shared, app-wide types. Domain types are added in the master build phase. */

export type Result<T, E = string> =
  { ok: true; value: T } | { ok: false; error: E };

export type HealthState = "ok" | "not_configured" | "error";

export interface HealthReport {
  application: "ok";
  version: string;
  environment: "development" | "test" | "production";
  timestamp: string;
  database: HealthState;
  supabase: "configured" | "not_configured";
  ai: { provider: "mock" | "gemini" };
}
