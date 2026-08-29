import type { Metadata } from "next";

import { getAiProviderName } from "@/lib/ai";
import { APP_NAME, APP_VERSION } from "@/lib/app-meta";
import { checkDatabaseHealth } from "@/lib/db/health";
import {
  env,
  isGeminiConfigured,
  isSupabaseConfigured,
  resolvedAiProvider,
} from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Health · ${APP_NAME}`,
  robots: { index: false, follow: false },
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/10 py-2 dark:border-white/10">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}

export default async function HealthPage() {
  const db = await checkDatabaseHealth();

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-16">
      <h1 className="text-xl font-semibold">{APP_NAME} — environment health</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Diagnostics only. Machine-readable version at{" "}
        <a className="underline" href="/api/health">
          /api/health
        </a>
        .
      </p>

      <div className="mt-8">
        <Row label="Application" value="OK" />
        <Row label="Version" value={APP_VERSION} />
        <Row label="Environment" value={env.NODE_ENV} />
        <Row
          label="Database"
          value={
            db.status === "ok"
              ? `OK (${db.latencyMs} ms)`
              : db.status === "not_configured"
                ? "NOT CONFIGURED"
                : "ERROR"
          }
        />
        <Row
          label="Supabase"
          value={isSupabaseConfigured() ? "CONFIGURED" : "NOT CONFIGURED"}
        />
        <Row
          label="AI provider (configured)"
          value={env.AI_PROVIDER.toUpperCase()}
        />
        <Row
          label="AI provider (active)"
          value={getAiProviderName().toUpperCase()}
        />
        <Row
          label="Gemini key"
          value={isGeminiConfigured() ? "PRESENT" : "ABSENT"}
        />
        <Row label="Resolved AI" value={resolvedAiProvider().toUpperCase()} />
      </div>
    </main>
  );
}
