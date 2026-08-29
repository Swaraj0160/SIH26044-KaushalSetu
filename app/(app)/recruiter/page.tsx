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
import { personaEmployerId } from "@/lib/session";

export default async function RecruiterOverview() {
  const persona = await requireRole("recruiter");
  const employerId = personaEmployerId(persona);
  const d = getDataset();
  const employer = d.employerById.get(employerId)!;
  const opps = recruiterOpportunities(employerId);
  const totalApplicants = opps.reduce((s, o) => s + o.applicants, 0);
  const totalShortlisted = opps.reduce((s, o) => s + o.shortlisted, 0);

  const featured =
    opps.find((o) => o.opportunity.id === "opp-hero-ml") ?? opps[0];
  const topCandidates = featured
    ? rankCandidatesForOpportunity(featured.opportunity.id).slice(0, 4)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={employer.name}
        description={`${employer.sector} · ${employer.city} · ${employer.verified ? "verified employer" : "verification pending"}`}
        actions={<Badge variant="accent">Demo persona · {persona.name}</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <Stat label="Open postings" value={opps.length} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat label="Applicants" value={totalApplicants} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat label="Shortlisted" value={totalShortlisted} />
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
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Postings</CardTitle>
          <Link
            href="/recruiter/opportunities"
            className="text-primary text-xs hover:underline"
          >
            Manage →
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
              Full explainable ranking →
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
                  size={52}
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
