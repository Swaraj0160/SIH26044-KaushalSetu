import Link from "next/link";

import { PageHeader } from "@/components/kaushal/page-header";
import { MatchScore } from "@/components/kaushal/primitives";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/misc";
import {
  rankCandidatesForOpportunity,
  recruiterOpportunities,
} from "@/lib/data";
import { getDataset } from "@/lib/demo/dataset";
import { requireRole } from "@/lib/guards";
import { personaEmployerId } from "@/lib/auth/personas";

const STAGES = [
  "applied",
  "shortlisted",
  "interview",
  "offer",
  "hired",
] as const;
const STAGE_MATCH: Record<string, (typeof STAGES)[number]> = {
  submitted: "applied",
  under_review: "applied",
  shortlisted: "shortlisted",
  interview: "interview",
  offer: "offer",
  hired: "hired",
};

export default async function IndustryHome() {
  const persona = await requireRole("recruiter");
  const employerId = personaEmployerId(persona);
  const d = getDataset();
  const employer = d.employerById.get(employerId)!;
  const opps = recruiterOpportunities(employerId);

  const apps = d.applications.filter((a) =>
    opps.some((o) => o.opportunity.id === a.opportunityId),
  );
  const funnel = STAGES.map((s) => ({
    stage: s,
    count: apps.filter((a) => STAGE_MATCH[a.status] === s).length,
  }));
  const awaitingDecision = apps.filter((a) =>
    ["shortlisted", "interview"].includes(a.status),
  ).length;

  const featured =
    opps.find((o) => o.opportunity.id === "opp-hero-ml") ?? opps[0];
  const topCandidates = featured
    ? rankCandidatesForOpportunity(featured.opportunity.id).slice(0, 3)
    : [];
  const maxFunnel = Math.max(1, ...funnel.map((f) => f.count));

  return (
    <div className="space-y-6">
      <PageHeader
        title={employer.name}
        description="Your job here: fill roles with people whose skills are proven. Everything is competency-defined and evidence-weighted."
        actions={<Badge variant="accent">Demo · {persona.name}</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <Stat label="Open roles" value={opps.length} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat label="Applicants" value={apps.length} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat label="Awaiting your decision" value={awaitingDecision} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Roles"
              value={new Set(opps.map((o) => o.role.id)).size}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Talent pipeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {funnel.map((f) => (
            <div
              key={f.stage}
              className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3 text-sm"
            >
              <span className="text-muted-foreground capitalize">
                {f.stage}
              </span>
              <div className="bg-muted h-5 overflow-hidden rounded">
                <div
                  className="bg-primary h-full rounded"
                  style={{ width: `${(f.count / maxFunnel) * 100}%` }}
                />
              </div>
              <span className="tabular text-right">{f.count}</span>
            </div>
          ))}
          <p className="text-muted-foreground pt-1 text-xs">
            Advancing a candidate here mirrors into their Applications view —
            one shared pipeline.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Open roles</CardTitle>
          <Link
            href="/recruiter/opportunities"
            className="text-primary text-xs hover:underline"
          >
            manage →
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {opps.map((o) => (
            <Link
              key={o.opportunity.id}
              href={`/recruiter/opportunities/${o.opportunity.id}`}
              className="border-border hover:bg-muted flex items-center justify-between rounded-lg border p-3 text-sm"
            >
              <span>
                <span className="font-medium">{o.role.title}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {o.opportunity.type.replace("_", " ")} ·{" "}
                  {o.opportunity.city}
                </span>
              </span>
              <span className="text-muted-foreground flex items-center gap-3 text-xs">
                <span>{o.applicants} applicants</span>
                <Badge variant="info">{o.shortlisted} shortlisted</Badge>
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>

      {featured ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Top candidates — {featured.role.title}</CardTitle>
            <Link
              href={`/recruiter/opportunities/${featured.opportunity.id}`}
              className="text-primary text-xs hover:underline"
            >
              explainable ranking →
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {topCandidates.map((c, i) => (
              <div
                key={c.student.id}
                className="border-border flex items-center gap-3 rounded-lg border p-3"
              >
                <span className="tabular text-muted-foreground w-5 text-center text-sm font-semibold">
                  {i + 1}
                </span>
                <MatchScore
                  score={c.match.score}
                  band={c.match.band}
                  size={48}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{c.student.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {c.student.programme} · {c.institutionName} ·{" "}
                    {c.match.mandatoryMet}/{c.match.mandatoryTotal} mandatory ·{" "}
                    {c.match.evidenceConfidencePct}% evidence
                  </div>
                </div>
                {c.application ? (
                  <Badge variant="info" className="capitalize">
                    {c.application.status.replace(/_/g, " ")}
                  </Badge>
                ) : (
                  <Badge variant="muted">latent match</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
