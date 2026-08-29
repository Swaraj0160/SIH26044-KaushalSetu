import Link from "next/link";
import type { Metadata } from "next";

import { enterDemoAs } from "@/app/actions";
import { Logo } from "@/components/kaushal/logo";
import { DemoBanner } from "@/components/kaushal/primitives";
import { Badge } from "@/components/ui/badge";
import { PERSONAS } from "@/lib/session";

export const metadata: Metadata = {
  title: "Judge demo",
  description:
    "One-click access to every KaushalSetu persona. No registration.",
};

const ROLE_LABEL: Record<string, string> = {
  student: "Student",
  recruiter: "Industry",
  faculty: "Faculty",
  institution_admin: "Institution",
  super_admin: "Administrator",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen">
      <DemoBanner />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>
        <h1 className="mt-8 text-2xl font-semibold">Enter the judge demo</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          No registration. Pick a persona and you are dropped straight into a
          fully populated workspace. Every persona shares the same synthetic
          dataset, so the story stays consistent as you switch between them.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {PERSONAS.map((p) => (
            <form key={p.key} action={enterDemoAs}>
              <input type="hidden" name="persona" value={p.key} />
              <button className="group border-border bg-card hover:border-primary/50 flex h-full w-full flex-col rounded-xl border p-4 text-left transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{p.name}</span>
                  <Badge variant="subtle">{ROLE_LABEL[p.role]}</Badge>
                </div>
                <div className="text-muted-foreground mt-0.5 text-xs">
                  {p.subtitle}
                </div>
                <p className="text-muted-foreground mt-2 text-sm">{p.blurb}</p>
                <span className="text-primary mt-3 text-sm font-medium group-hover:underline">
                  Enter as {p.name.split(" ")[0]} →
                </span>
              </button>
            </form>
          ))}
        </div>

        <div className="border-border bg-muted/40 text-muted-foreground mt-8 rounded-lg border p-4 text-sm">
          <p className="text-foreground font-medium">Suggested walkthrough</p>
          <ol className="mt-1.5 list-decimal space-y-0.5 pl-5">
            <li>
              Start as <strong>Aarav Sharma</strong> — readiness, competency
              graph, evidence, gaps, the career simulator, then an explainable
              opportunity match.
            </li>
            <li>
              Switch to <strong>Rohan Mehta</strong> (recruiter) — see the same
              match from the hiring side, reconciled to the same numbers.
            </li>
            <li>
              Switch to <strong>Dr. S. Rao</strong> (institution) — the skill
              heatmap and systemic gap analytics.
            </li>
            <li>
              Optionally: <strong>Dr. Ananya Nair</strong> for the Ministry of
              Ayush angle (BAMS → industry QA).
            </li>
          </ol>
          <p className="mt-3">
            Or open the{" "}
            <Link href="/judge" className="text-primary underline">
              technical showcase
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
