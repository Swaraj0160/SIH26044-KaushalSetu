import type { Metadata } from "next";

import {
  APP_NAME,
  APP_DESCRIPTION,
  SIH_PROBLEM_STATEMENT_ID,
} from "@/lib/app-meta";

export const metadata: Metadata = {
  title: `${APP_NAME} — setup`,
};

/**
 * Placeholder landing page for the SETUP phase.
 *
 * This is intentionally minimal. The real product (dashboards, competency
 * passport, matching, analytics, ...) is built in the master build phase.
 */
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
        {SIH_PROBLEM_STATEMENT_ID}
      </p>
      <h1 className="mt-2 text-2xl font-semibold">{APP_NAME}</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {APP_DESCRIPTION}
      </p>

      <div className="mt-8 rounded-lg border border-black/10 p-4 text-sm dark:border-white/15">
        <p className="font-medium">Development environment is ready.</p>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          The product has not been built yet. Check{" "}
          <a className="underline" href="/health">
            /health
          </a>{" "}
          or{" "}
          <a className="underline" href="/api/health">
            /api/health
          </a>{" "}
          for component status.
        </p>
      </div>
    </main>
  );
}
