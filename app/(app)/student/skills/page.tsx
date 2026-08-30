import Link from "next/link";

import { CompetencyGraph } from "@/components/kaushal/competency-graph";
import { PageHeader } from "@/components/kaushal/page-header";
import { EvidenceBadge, LevelPip } from "@/components/kaushal/primitives";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompetencyGraph, getStudentDashboard } from "@/lib/data";
import { getStudentCtx } from "@/lib/data/viewer";
import { evidenceKindLabel } from "@/lib/engines/evidence";
import { currentStudentId } from "@/lib/guards";
import { getDataset } from "@/lib/demo/dataset";

export default async function SkillsPage() {
  const sid = await currentStudentId();
  const ctx = await getStudentCtx(sid);
  const dash = getStudentDashboard(sid, ctx);
  const graph = getCompetencyGraph(sid, ctx);
  const d = getDataset();
  const student = ctx.student ?? d.studentById.get(sid)!;

  const rows = [...dash.profile.skills.values()].sort(
    (a, b) =>
      b.effectiveLevel - a.effectiveLevel ||
      b.evidence.score - a.evidence.score,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill graph & evidence"
        description="Skills are only as strong as the evidence behind them. Self-declared skills with no independent evidence are visibly discounted in every match."
      />

      <Card>
        <CardHeader>
          <CardTitle>Competency map — {dash.targetRole.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CompetencyGraph data={graph} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evidence ledger ({rows.length} skills)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.map((rs) => {
            const raw = student.skills.find((s) => s.skillId === rs.skillId);
            return (
              <div
                key={rs.skillId}
                className="border-border hover:border-primary/40 rounded-lg border p-3 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/student/skills/${rs.skillId}`}
                      className="font-medium hover:underline"
                    >
                      {rs.skill?.name ?? rs.skillId}
                    </Link>
                    <LevelPip level={rs.effectiveLevel} />
                    {rs.assessed ? (
                      <span className="text-success text-xs">assessed</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        self-rated
                      </span>
                    )}
                  </div>
                  <EvidenceBadge
                    confidence={rs.evidence.confidence}
                    rationale={rs.evidence.rationale}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(raw?.evidence ?? []).map((e, i) => (
                    <span
                      key={i}
                      className="border-border bg-muted/40 text-muted-foreground rounded border px-1.5 py-0.5 text-xs"
                      title={e.date}
                    >
                      {evidenceKindLabel(e.kind)}
                      {e.verifier ? ` · ${e.verifier}` : ""}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
