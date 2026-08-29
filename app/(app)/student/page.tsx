import Link from "next/link";

import { CompetencyGraph } from "@/components/kaushal/competency-graph";
import { OpportunityCard } from "@/components/kaushal/opportunity-card";
import { PageHeader } from "@/components/kaushal/page-header";
import { BandLabel } from "@/components/kaushal/primitives";
import { ReadinessMeter } from "@/components/kaushal/readiness";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/misc";
import {
  closestRoles,
  getCompetencyGraph,
  getStudentDashboard,
} from "@/lib/data";
import { currentStudentId } from "@/lib/guards";

export default async function StudentOverview() {
  const sid = await currentStudentId();
  const dash = getStudentDashboard(sid);
  const graph = getCompetencyGraph(sid);
  const targetFit = closestRoles(sid, 6).find(
    (r) => r.role.id === dash.targetRole.id,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={dash.student.name}
        description={`${dash.student.programme} · ${dash.institutionName} · target role: ${dash.targetRole.title}`}
        actions={<Badge variant="accent">Demo persona</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Career readiness"
              value={dash.readiness.score}
              hint={<BandLabel band={dash.readiness.band} />}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Match to target"
              value={`${targetFit?.match.score ?? "—"}%`}
              hint={
                targetFit ? <BandLabel band={targetFit.match.band} /> : null
              }
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Evidence confidence"
              value={`${dash.evidenceConfidencePct}%`}
              hint="portfolio-wide"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Biggest gap"
              value={
                dash.biggestGap ? dash.biggestGap.name.split(" ")[0] : "None"
              }
              hint={
                dash.biggestGap
                  ? `${dash.biggestGap.gap} levels to close`
                  : "on track"
              }
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Competency graph</CardTitle>
            <Link
              href="/student/skills"
              className="text-primary text-xs hover:underline"
            >
              Skill graph & evidence →
            </Link>
          </CardHeader>
          <CardContent>
            <CompetencyGraph data={graph} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Readiness for {dash.targetRole.title}</CardTitle>
            <Link
              href="/student/gaps"
              className="text-primary text-xs hover:underline"
            >
              Gaps & roadmap →
            </Link>
          </CardHeader>
          <CardContent>
            <ReadinessMeter readiness={dash.readiness} />
          </CardContent>
        </Card>
      </div>

      {dash.activeInternship ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Active internship</CardTitle>
            <Link
              href="/student/internship"
              className="text-primary text-xs hover:underline"
            >
              Open workspace →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <span className="font-medium">
                {dash.activeInternship.roleTitle}
              </span>{" "}
              · {dash.activeInternship.employerName} · mentor{" "}
              {dash.activeInternship.mentorName}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Milestones
                </div>
                <ul className="space-y-1 text-sm">
                  {dash.activeInternship.milestones.map((m) => (
                    <li key={m.title} className="flex items-center gap-2">
                      <span
                        className={
                          m.done ? "text-success" : "text-muted-foreground"
                        }
                      >
                        {m.done ? "✓" : "○"}
                      </span>
                      {m.title}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Skill delta (in progress)
                </div>
                <ul className="space-y-1 text-sm">
                  {dash.activeInternship.skillDelta.map((s) => (
                    <li key={s.skillId} className="tabular">
                      {s.skillId.replace("sk-", "")}: L{s.before} → L{s.after}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recommended for you</h2>
          <Link
            href="/student/opportunities"
            className="text-primary text-xs hover:underline"
          >
            All opportunities →
          </Link>
        </div>
        <div className="grid gap-3">
          {dash.recommended.slice(0, 3).map((r) => (
            <OpportunityCard
              key={r.opportunity.id}
              item={r}
              href={`/student/opportunities/${r.opportunity.id}`}
            />
          ))}
        </div>
      </div>

      {dash.applications.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Your applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dash.applications.map((a) => (
                <div
                  key={a.id}
                  className="border-border flex items-center justify-between border-b py-2 text-sm last:border-0"
                >
                  <span>
                    {a.opportunity.title.split(" — ")[0]} ·{" "}
                    <span className="text-muted-foreground">
                      {a.employerName}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="tabular text-muted-foreground">
                      {a.matchAtApply}% at apply
                    </span>
                    <Badge variant="info" className="capitalize">
                      {a.status.replace(/_/g, " ")}
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <p className="text-muted-foreground text-xs">
        Every number here is produced by deterministic engines over synthetic
        data. The{" "}
        <Link href="/student/copilot" className="underline">
          Career Copilot
        </Link>{" "}
        explains them; it does not compute them.
      </p>
    </div>
  );
}
