import Link from "next/link";

import { JourneyStepper } from "@/components/kaushal/journey-stepper";
import { OpportunityCard } from "@/components/kaushal/opportunity-card";
import { PageHeader } from "@/components/kaushal/page-header";
import { BandLabel } from "@/components/kaushal/primitives";
import { ReadinessMeter } from "@/components/kaushal/readiness";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  closestRoles,
  getJourney,
  getStudentDashboard,
  rankOpportunitiesForStudent,
} from "@/lib/data";
import { getDataset } from "@/lib/demo/dataset";
import { currentStudentId } from "@/lib/guards";

const TOOLS = [
  {
    href: "/student/gaps",
    label: "Skill Gaps & Roadmap",
    desc: "WhatWhat's blocking the goalapos;s blocking the goal, and the sequenced plan",
  },
  {
    href: "/student/simulator",
    label: "Explore Roles",
    desc: "Compare your target with adjacent roles",
  },
  {
    href: "/student/opportunities",
    label: "Opportunities",
    desc: "Ranked feed with explainable match",
  },
  {
    href: "/student/applications",
    label: "Applications",
    desc: "Saved → applied → interview → offer",
  },
];

export default async function CareerHub() {
  const sid = await currentStudentId();
  const dash = getStudentDashboard(sid);
  const journey = getJourney(sid);
  const d = getDataset();
  const student = d.studentById.get(sid)!;
  const close = closestRoles(sid, 4);
  const targetFit = close.find((r) => r.role.id === dash.targetRole.id);
  const topOpps = rankOpportunitiesForStudent(sid).slice(0, 3);
  const blockingGaps = dash.gap.gaps
    .filter((g) => g.gap > 0 && g.mandatory)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Career"
        description="One destination for the pursuit: your goal, your readiness, what's missing, and where to apply — all driven by the same target role."
      />
      <JourneyStepper stages={journey} variant="strip" />

      {/* Goal */}
      <Card>
        <CardHeader>
          <CardTitle>Career goal</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 pt-0 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Target role" value={dash.targetRole.title} />
          <Field label="Family" value={dash.targetRole.family} />
          <Field
            label="Interests"
            value={student.careerInterests
              .map((r) => d.roleById.get(r)?.title)
              .filter(Boolean)
              .slice(0, 2)
              .join(", ")}
          />
          <Field
            label="Match to target"
            value={targetFit ? `${targetFit.match.score}%` : "—"}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Readiness for {dash.targetRole.title}</CardTitle>
            <Link
              href="/student/gaps"
              className="text-primary text-xs hover:underline"
            >
              gaps & plan →
            </Link>
          </CardHeader>
          <CardContent>
            <ReadinessMeter readiness={dash.readiness} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What is blocking the goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {blockingGaps.length ? (
              blockingGaps.map((g) => (
                <div
                  key={g.skillId}
                  className="border-border flex items-center justify-between rounded-lg border p-2.5 text-sm"
                >
                  <span className="font-medium">{g.name}</span>
                  <span className="text-muted-foreground flex items-center gap-2 text-xs">
                    L{g.current} → L{g.required}
                    <Badge
                      variant={g.priority === "high" ? "danger" : "warning"}
                    >
                      {g.priority}
                    </Badge>
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No mandatory gaps outstanding — keep your evidence current.
              </p>
            )}
            <Link
              href="/student/gaps"
              className="text-primary inline-block pt-1 text-xs hover:underline"
            >
              Full roadmap →
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles you are closest to</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {close.map((r) => (
            <Link
              key={r.role.id}
              href="/student/simulator"
              className="border-border hover:border-primary/40 rounded-full border px-3 py-1 text-sm"
            >
              {r.role.title}
              <span className="tabular text-muted-foreground ml-1.5 text-xs">
                {r.match.score}%
              </span>
              {r.role.id === dash.targetRole.id ? (
                <span className="text-accent-foreground ml-1">★</span>
              ) : null}
            </Link>
          ))}
        </CardContent>
      </Card>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
            Opportunities for {dash.targetRole.title}
          </h2>
          <Link
            href="/student/opportunities"
            className="text-primary text-xs hover:underline"
          >
            all →
          </Link>
        </div>
        <div className="space-y-3">
          {topOpps.map((r) => (
            <OpportunityCard
              key={r.opportunity.id}
              item={r}
              href={`/student/opportunities/${r.opportunity.id}`}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="border-border bg-card hover:border-primary/40 rounded-xl border p-4 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{t.label}</span>
              <span className="text-primary">→</span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">{t.desc}</p>
          </Link>
        ))}
      </div>

      <p className="text-muted-foreground text-xs">
        Readiness <BandLabel band={dash.readiness.band} /> · every gap, match
        and readiness figure recomputes from this one target role.
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground text-xs tracking-wide uppercase">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium">{value || "—"}</div>
    </div>
  );
}
