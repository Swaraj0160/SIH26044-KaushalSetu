import Link from "next/link";

import { AdaptiveAssessment } from "@/components/kaushal/assessment";
import { PageHeader } from "@/components/kaushal/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { assessableSkillIds, bankForSkill } from "@/lib/demo/assessment-bank";
import { getDataset } from "@/lib/demo/dataset";
import { currentStudentId } from "@/lib/guards";

export default async function AssessmentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sid = await currentStudentId();
  const d = getDataset();
  const student = d.studentById.get(sid)!;
  const sp = await searchParams;
  const chosen = typeof sp.skill === "string" ? sp.skill : undefined;

  const roleSkillIds = d.roleById.get(student.targetRoleId)!.mandatorySkillIds;
  const available = assessableSkillIds.map((id) => ({
    id,
    name: d.skillById.get(id)?.name ?? id,
    relevant: roleSkillIds.includes(id),
    current: student.skills.find((s) => s.skillId === id)?.selfRating,
  }));

  if (chosen && assessableSkillIds.includes(chosen)) {
    const skill = d.skillById.get(chosen)!;
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Assessment — ${skill.name}`}
          description="Adaptive: a correct answer raises difficulty, an incorrect one lowers it. Scenario and confidence items are included. The result becomes assessment evidence for the skill."
          actions={
            <Link
              href="/student/assessment"
              className="text-primary text-sm hover:underline"
            >
              ← choose another skill
            </Link>
          }
        />
        <AdaptiveAssessment
          skillId={chosen}
          skillName={skill.name}
          questions={bankForSkill(chosen)}
          priorLevel={
            student.skills.find((s) => s.skillId === chosen)?.selfRating
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill assessment"
        description="Convert self-ratings into evidence. Assessments are adaptive and feed directly into your evidence confidence, readiness score and every match."
      />
      <Card>
        <CardHeader>
          <CardTitle>Choose a skill to assess</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {available.map((s) => (
            <Link
              key={s.id}
              href={`/student/assessment?skill=${s.id}`}
              className="border-border hover:border-primary/50 hover:bg-muted flex items-center justify-between rounded-lg border p-3 text-sm transition-colors"
            >
              <span>
                <span className="font-medium">{s.name}</span>
                {s.relevant ? (
                  <span className="text-primary ml-2 text-xs">
                    for your target role
                  </span>
                ) : null}
              </span>
              <span className="text-muted-foreground text-xs">
                {s.current ? `self-rated L${s.current}` : "not rated"} →
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
