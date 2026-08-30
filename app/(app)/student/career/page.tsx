import Link from "next/link";

import { GapList, Roadmap } from "@/components/kaushal/gap-list";
import { GoalEditor } from "@/components/kaushal/goal-editor";
import { JourneyStepper } from "@/components/kaushal/journey-stepper";
import { OpportunityCard } from "@/components/kaushal/opportunity-card";
import { PageHeader } from "@/components/kaushal/page-header";
import { BandLabel } from "@/components/kaushal/primitives";
import { ReadinessMeter } from "@/components/kaushal/readiness";
import { CareerSimulator } from "@/components/kaushal/simulator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { appliedOpportunityIds } from "@/lib/applied";
import {
  closestRoles,
  getJourney,
  getStudentDashboard,
  rankOpportunitiesForStudent,
  simulateRoles,
  type StudentCtx,
} from "@/lib/data";
import { getStudentCtx } from "@/lib/data/viewer";
import { getDataset } from "@/lib/demo/dataset";
import { currentStudentId } from "@/lib/guards";
import { cn } from "@/lib/utils";

const TABS = [
  ["goal", "Goal"],
  ["readiness", "Readiness"],
  ["gaps", "Skill Gaps"],
  ["roadmap", "Roadmap"],
  ["explore", "Explore Roles"],
  ["opportunities", "Opportunities"],
  ["applications", "Applications"],
] as const;

export default async function CareerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sid = await currentStudentId();
  const sp = await searchParams;
  const tab = (
    typeof sp.tab === "string" ? sp.tab : "goal"
  ) as (typeof TABS)[number][0];
  const ctx = await getStudentCtx(sid);
  const dash = getStudentDashboard(sid, ctx);
  const journey = getJourney(sid, ctx);
  const d = getDataset();
  const student = ctx.student ?? d.studentById.get(sid)!;
  const saved = sp.saved === "1";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Career"
        description="One destination for the pursuit — goal, readiness, gaps, plan, role exploration, opportunities and applications, all driven by the same target role."
      />
      <JourneyStepper stages={journey} variant="strip" />

      <div className="border-border flex flex-wrap gap-1 overflow-x-auto border-b">
        {TABS.map(([key, label]) => (
          <Link
            key={key}
            href={`/student/career?tab=${key}`}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2 text-sm transition-colors",
              tab === key
                ? "border-primary text-primary font-medium"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {saved ? (
        <div
          role="status"
          className="border-success/40 bg-success/10 text-success rounded-md border px-3 py-2 text-sm"
        >
          ✓ Career goal updated — every figure below recomputed.
        </div>
      ) : null}

      {tab === "goal" ? <GoalTab sid={sid} ctx={ctx} /> : null}
      {tab === "readiness" ? (
        <Card>
          <CardContent className="pt-5">
            <ReadinessMeter readiness={dash.readiness} />
          </CardContent>
        </Card>
      ) : null}
      {tab === "gaps" ? (
        <Card>
          <CardContent className="pt-5">
            <GapList report={dash.gap} />
          </CardContent>
        </Card>
      ) : null}
      {tab === "roadmap" ? (
        <Card>
          <CardContent className="pt-5">
            <Roadmap report={dash.gap} />
          </CardContent>
        </Card>
      ) : null}
      {tab === "explore" ? (
        <Card>
          <CardContent className="pt-5">
            <CareerSimulator
              fits={simulateRoles(
                sid,
                d.roles.map((r) => r.id),
                ctx,
              )}
              targetRoleId={student.targetRoleId}
            />
          </CardContent>
        </Card>
      ) : null}
      {tab === "opportunities" ? (
        <OpportunitiesTab sid={sid} ctx={ctx} />
      ) : null}
      {tab === "applications" ? <ApplicationsTab sid={sid} ctx={ctx} /> : null}
    </div>
  );
}

async function GoalTab({ sid, ctx }: { sid: string; ctx: StudentCtx }) {
  const dash = getStudentDashboard(sid, ctx);
  const d = getDataset();
  const student = ctx.student ?? d.studentById.get(sid)!;
  const close = closestRoles(sid, 5, ctx);
  const targetFit = close.find((r) => r.role.id === dash.targetRole.id);
  const blockingGaps = dash.gap.gaps
    .filter((g) => g.gap > 0 && g.mandatory)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Field label="Target role" value={dash.targetRole.title} />
            <Field label="Family" value={dash.targetRole.family} />
            <Field
              label="Interests"
              value={student.careerInterests
                .filter((r) => r !== dash.targetRole.id)
                .map((r) => d.roleById.get(r)?.title)
                .filter(Boolean)
                .slice(0, 2)
                .join(", ")}
            />
            <Field
              label="Match / Readiness"
              value={`${targetFit?.match.score ?? "—"}% · ${dash.readiness.score}/100`}
            />
          </div>
          <GoalEditor
            roles={d.roles.map((r) => ({
              id: r.id,
              title: r.title,
              family: r.family,
            }))}
            currentRoleId={student.targetRoleId}
            currentInterests={student.careerInterests}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-5">
            <div className="mb-2 text-sm font-semibold">
              What is blocking the goal
            </div>
            {blockingGaps.length ? (
              <div className="space-y-2">
                {blockingGaps.map((g) => (
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
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No mandatory gaps outstanding.
              </p>
            )}
            <Link
              href="/student/career?tab=roadmap"
              className="text-primary mt-2 inline-block text-xs hover:underline"
            >
              Open the plan →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="mb-2 text-sm font-semibold">
              Roles you are closest to
            </div>
            <div className="flex flex-wrap gap-2">
              {close.map((r) => (
                <span
                  key={r.role.id}
                  className="border-border rounded-full border px-3 py-1 text-sm"
                >
                  {r.role.title}
                  <span className="tabular text-muted-foreground ml-1.5 text-xs">
                    {r.match.score}%
                  </span>
                  {r.role.id === dash.targetRole.id ? (
                    <span className="text-accent-foreground ml-1">★</span>
                  ) : null}
                </span>
              ))}
            </div>
            <Link
              href="/student/career?tab=explore"
              className="text-primary mt-2 inline-block text-xs hover:underline"
            >
              Compare roles →
            </Link>
          </CardContent>
        </Card>
      </div>
      <p className="text-muted-foreground text-xs">
        Readiness <BandLabel band={dash.readiness.band} /> · every figure on
        this page recomputes from this one target role.
      </p>
    </div>
  );
}

async function OpportunitiesTab({
  sid,
  ctx,
}: {
  sid: string;
  ctx: StudentCtx;
}) {
  const ranked = rankOpportunitiesForStudent(sid, ctx);
  const applied = new Set(await appliedOpportunityIds());
  const strong = ranked.filter((r) => r.match.score >= 65);
  const rest = ranked.filter((r) => r.match.score < 65).slice(0, 10);
  const withApplied = (r: (typeof ranked)[number]) =>
    r.applied || !applied.has(r.opportunity.id)
      ? r
      : {
          ...r,
          applied: {
            id: `local-${r.opportunity.id}`,
            opportunityId: r.opportunity.id,
            studentId: sid,
            status: "submitted" as const,
            appliedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            matchAtApply: r.match.score,
          },
        };
  return (
    <div className="space-y-5">
      <section>
        <h3 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
          Strong & promising ({strong.length})
        </h3>
        <div className="space-y-3">
          {strong.map((r) => (
            <OpportunityCard
              key={r.opportunity.id}
              item={withApplied(r)}
              href={`/student/opportunities/${r.opportunity.id}`}
            />
          ))}
        </div>
      </section>
      <section>
        <h3 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
          Stretch ({rest.length})
        </h3>
        <div className="space-y-3">
          {rest.map((r) => (
            <OpportunityCard
              key={r.opportunity.id}
              item={withApplied(r)}
              href={`/student/opportunities/${r.opportunity.id}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

const FLOW = [
  "submitted",
  "under_review",
  "shortlisted",
  "interview",
  "offer",
  "hired",
];

async function ApplicationsTab({ sid, ctx }: { sid: string; ctx: StudentCtx }) {
  const dash = getStudentDashboard(sid, ctx);
  const d = getDataset();
  const seededIds = new Set(dash.applications.map((a) => a.opportunityId));
  const extra = (await appliedOpportunityIds()).filter(
    (id) => !seededIds.has(id),
  );
  const rows = [
    ...dash.applications.map((a) => ({
      id: a.id,
      title: a.opportunity.title.split(" — ")[0],
      employer: a.employerName,
      status: a.status,
      match: a.matchAtApply,
    })),
    ...extra.map((id) => {
      const o = d.opportunityById.get(id);
      return {
        id: `local-${id}`,
        title: o?.title.split(" — ")[0] ?? id,
        employer: o ? (d.employerById.get(o.employerId)?.name ?? "—") : "—",
        status: "submitted",
        match: 0,
      };
    }),
  ];
  if (!rows.length)
    return (
      <p className="text-muted-foreground text-sm">
        No applications yet.{" "}
        <Link
          href="/student/career?tab=opportunities"
          className="text-primary underline"
        >
          Browse opportunities
        </Link>
        .
      </p>
    );
  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const idx = FLOW.indexOf(r.status);
        return (
          <div key={r.id} className="border-border rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-muted-foreground text-xs">
                  {r.employer}
                  {r.match ? ` · ${r.match}% match at apply` : ""}
                </div>
              </div>
              <Badge variant="info" className="capitalize">
                {r.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <div className="mt-2 flex gap-1">
              {FLOW.map((s, i) => (
                <div
                  key={s}
                  title={s.replace(/_/g, " ")}
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    i <= idx && r.status !== "rejected"
                      ? "bg-primary"
                      : "bg-muted",
                  )}
                />
              ))}
            </div>
          </div>
        );
      })}
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
