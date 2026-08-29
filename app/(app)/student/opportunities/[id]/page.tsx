import Link from "next/link";
import { notFound } from "next/navigation";

import { applyToOpportunity } from "@/app/actions";
import { GapList } from "@/components/kaushal/gap-list";
import {
  CompetencyChecklist,
  MatchBreakdown,
} from "@/components/kaushal/match-breakdown";
import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appliedOpportunityIds } from "@/lib/applied";
import { getOpportunityMatchForStudent } from "@/lib/data";
import { getDataset } from "@/lib/demo/dataset";
import { currentStudentId } from "@/lib/guards";

export default async function OpportunityDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sid = await currentStudentId();
  const result = getOpportunityMatchForStudent(sid, id);
  if (!result) notFound();
  const { opportunity: o, role, employer, match, gap } = result;

  const d = getDataset();
  const seeded = d.applications.find(
    (a) => a.studentId === sid && a.opportunityId === id,
  );
  const localApplied = (await appliedOpportunityIds()).includes(id);
  const applied = seeded || localApplied;

  return (
    <div className="space-y-6">
      <PageHeader
        title={role.title}
        description={`${employer.name} · ${o.city} · ${o.mode} · ${o.type.replace("_", " ")}`}
        actions={
          applied ? (
            <Badge variant="info" className="capitalize">
              {seeded ? seeded.status.replace(/_/g, " ") : "submitted"}
            </Badge>
          ) : (
            <form action={applyToOpportunity}>
              <input type="hidden" name="opportunityId" value={o.id} />
              <Button type="submit">Apply ({match.score}% match)</Button>
            </form>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Why this match — full breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <MatchBreakdown match={match} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Competency requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <CompetencyChecklist match={match} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>The role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{o.description}</p>
              <div>
                <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Details
                </div>
                <ul className="mt-1 space-y-0.5">
                  {o.stipendPerMonth ? (
                    <li>
                      Stipend: ₹{o.stipendPerMonth.toLocaleString("en-IN")}/mo
                    </li>
                  ) : null}
                  {o.salaryLpa ? <li>Salary: ₹{o.salaryLpa} LPA</li> : null}
                  {o.durationMonths ? (
                    <li>Duration: {o.durationMonths} months</li>
                  ) : null}
                  <li>Openings: {o.openings}</li>
                  <li>Deadline: {o.deadline}</li>
                  <li>
                    Assessment required: {o.requiresAssessment ? "yes" : "no"}
                  </li>
                  <li>Min. education: {role.minEducation}</li>
                </ul>
              </div>
              <div>
                <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Tools & behavioural
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {[...role.tools, ...role.behavioural].map((t) => (
                    <span
                      key={t}
                      className="border-border bg-muted/40 rounded border px-1.5 py-0.5 text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                {employer.name} — {employer.about}{" "}
                {employer.verified ? (
                  <Badge variant="success" className="ml-1">
                    verified employer
                  </Badge>
                ) : null}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Close the gap for this posting</CardTitle>
            </CardHeader>
            <CardContent>
              <GapList report={gap} />
              <Link
                href="/student/gaps"
                className="text-primary mt-3 inline-block text-xs hover:underline"
              >
                Full roadmap →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
