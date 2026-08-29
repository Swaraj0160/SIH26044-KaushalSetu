import { NextResponse } from "next/server";

import { getAiProviderName } from "@/lib/ai";
import { APP_VERSION } from "@/lib/app-meta";
import { checkDatabaseHealth } from "@/lib/db/health";
import { env, isSupabaseConfigured } from "@/lib/env";
import type { HealthReport } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/health
 *
 * Deployment / diagnostics probe. Reports component status without leaking any
 * secrets or internal error detail. Returns 503 if the database is configured
 * but unreachable, 200 otherwise.
 */
export async function GET() {
  const db = await checkDatabaseHealth();

  const report: HealthReport = {
    application: "ok",
    version: APP_VERSION,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    database:
      db.status === "ok"
        ? "ok"
        : db.status === "not_configured"
          ? "not_configured"
          : "error",
    supabase: isSupabaseConfigured() ? "configured" : "not_configured",
    ai: { provider: getAiProviderName() },
  };

  const dbLatencyMs = db.status === "ok" ? db.latencyMs : undefined;
  const healthy = report.database !== "error";

  return NextResponse.json(
    { ...report, dbLatencyMs },
    { status: healthy ? 200 : 503 },
  );
}
