import Link from "next/link";

import { JourneyStepper } from "@/components/kaushal/journey-stepper";
import { OpportunityCard } from "@/components/kaushal/opportunity-card";
import { BandLabel } from "@/components/kaushal/primitives";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getStudentHome } from "@/lib/data";
import { currentStudentId } from "@/lib/guards";

const ACTIVITY_ICON: Record<string, string> = {
  skill: "✓",
  project: "■",
  internship: "▲",
  application: "◍",
  certificate: "▤",
  endorsement: "✦",
};

function timeAgo(iso: string): string {
  if (iso === "just now") return iso;
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.round(days / 7)} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
}

export default async function StudentHome() {
  const sid = await currentStudentId();
  const home = getStudentHome(sid);
  const nba = home.nextActions[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* 1 — greeting + goal */}
      <div>
        <h1 className="text-2xl font-semibold">
          {greeting}, {home.firstName}.
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="text-muted-foreground">
            Target:{" "}
            <span className="text-foreground font-medium">
              {home.targetRole.title}
            </span>
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            Readiness{" "}
            <span className="tabular text-foreground text-lg font-semibold">
              {home.readiness.score}%
            </span>
          </span>
          <BandLabel band={home.readiness.band} />
          <Link
            href="/student/career"
            className="text-primary text-xs hover:underline"
          >
            change goal →
          </Link>
        </div>
      </div>

      {/* 2 — the journey */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
          Your journey
        </h2>
        <JourneyStepper stages={home.journey} />
      </section>

      {/* 3 — next best action */}
      {nba ? (
        <section>
          <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
            Your next best action
          </h2>
          <Card className="border-primary/30 bg-primary/[0.03]">
            <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-base font-semibold">{nba.title}</div>
                <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
                  <span className="text-foreground font-medium">Why: </span>
                  {nba.why}
                </p>
              </div>
              <Button asChild className="shrink-0">
                <Link href={nba.href}>{nba.ctaLabel}</Link>
              </Button>
            </CardContent>
          </Card>
          {home.nextActions.length > 1 ? (
            <details className="mt-2 text-sm">
              <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-xs">
                {home.nextActions.length - 1} more suggested action
                {home.nextActions.length > 2 ? "s" : ""}
              </summary>
              <ul className="mt-2 space-y-1.5">
                {home.nextActions.slice(1).map((a) => (
                  <li
                    key={a.id}
                    className="border-border flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                  >
                    <span>
                      <span className="font-medium">{a.title}</span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        {a.why}
                      </span>
                    </span>
                    <Link
                      href={a.href}
                      className="text-primary shrink-0 text-xs hover:underline"
                    >
                      {a.ctaLabel} →
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>
      ) : null}

      {/* 4 — recent activity */}
      {home.activity.length ? (
        <section>
          <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
            Recent activity
          </h2>
          <ul className="space-y-1.5">
            {home.activity.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="text-muted-foreground mt-0.5 w-4 shrink-0 text-center">
                  {ACTIVITY_ICON[a.kind] ?? "·"}
                </span>
                <span className="flex-1">{a.label}</span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {timeAgo(a.when)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 5 — a few opportunities */}
      {home.recommended.length ? (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
              A few opportunities for you
            </h2>
            <Link
              href="/student/opportunities"
              className="text-primary text-xs hover:underline"
            >
              all opportunities →
            </Link>
          </div>
          <div className="space-y-3">
            {home.recommended.map((r) => (
              <OpportunityCard
                key={r.opportunity.id}
                item={r}
                href={`/student/opportunities/${r.opportunity.id}`}
              />
            ))}
          </div>
        </section>
      ) : null}

      <p className="text-muted-foreground text-xs">
        Every number is produced by deterministic engines over synthetic data —
        no AI in the loop. Your next action is chosen by leverage, not at
        random.
      </p>
    </div>
  );
}
