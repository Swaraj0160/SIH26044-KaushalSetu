import { notFound } from "next/navigation";

import {
  CandidateRanking,
  type CandidateVM,
} from "@/components/kaushal/candidate-ranking";
import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { rankCandidatesForOpportunity } from "@/lib/data";
import { getDataset } from "@/lib/demo/dataset";
import { requireRole } from "@/lib/guards";
import { personaEmployerId } from "@/lib/session";

export default async function RecruiterOpportunityDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const persona = await requireRole("recruiter");
  const { id } = await params;
  const d = getDataset();
  const opp = d.opportunityById.get(id);
  if (!opp || opp.employerId !== personaEmployerId(persona)) notFound();
  const role = d.roleById.get(opp.roleId)!;

  const ranked = rankCandidatesForOpportunity(id);
  const candidates: CandidateVM[] = ranked.map((c) => ({
    id: c.student.id,
    name: c.student.name,
    programme: c.student.programme,
    institution: c.institutionName,
    headline: c.student.headline,
    experienceMonths: c.experienceMonths,
    applicationStatus: c.application?.status,
    match: c.match,
  }));

  const applicants = candidates.filter((c) => c.applicationStatus).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${role.title} — candidate ranking`}
        description="Same explainable engine the student sees. Expand any candidate for the full per-factor breakdown, or use 'Explain vs' to see exactly why one ranks above another."
        actions={
          <div className="flex gap-2">
            <Badge variant="muted">{applicants} applicants</Badge>
            <Badge variant="outline">
              {candidates.length} ranked (incl. latent)
            </Badge>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Requirement profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Mandatory competencies
            </div>
            <ul className="mt-1 space-y-0.5">
              {role.requirements
                .filter((r) => r.mandatory)
                .map((r) => (
                  <li key={r.competencyId}>
                    {d.competencyById.get(r.competencyId)?.name} ≥ L{r.minLevel}
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Extra skills for this posting
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {opp.extraSkillIds.length ? (
                opp.extraSkillIds.map((s) => (
                  <span
                    key={s}
                    className="border-border bg-muted/40 rounded border px-1.5 py-0.5 text-xs"
                  >
                    {d.skillById.get(s)?.name}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground">
                  none beyond the role profile
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <CandidateRanking candidates={candidates} />

      <p className="text-muted-foreground text-xs">
        This is not a black-box ATS. Weights are configurable (see the
        Administrator persona → Matching Config) and every point is
        attributable.
      </p>
    </div>
  );
}
