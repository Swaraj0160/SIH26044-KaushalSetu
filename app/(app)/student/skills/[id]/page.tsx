import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/kaushal/page-header";
import { EvidenceBadge } from "@/components/kaushal/primitives";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSkillDetail } from "@/lib/data";
import { getStudentCtx } from "@/lib/data/viewer";
import { evidenceKindLabel } from "@/lib/engines/evidence";
import { currentStudentId } from "@/lib/guards";

const KIND_TONE: Record<string, string> = {
  industry_verified: "text-confidence-verified",
  faculty_verified: "text-confidence-verified",
  assessment: "text-confidence-high",
  project: "text-confidence-moderate",
  certificate: "text-confidence-moderate",
  self_declared: "text-muted-foreground",
};

export default async function SkillDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sid = await currentStudentId();
  const { id } = await params;
  const ctx = await getStudentCtx(sid);
  const s = getSkillDetail(sid, id, ctx);
  if (!s) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={s.skill.name}
        description={`${s.category ?? "Skill"} · how good you are, and why the system believes it.`}
        actions={
          <Link
            href="/student/skills"
            className="text-primary text-sm hover:underline"
          >
            ← all skills
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* level vs target */}
        <Card>
          <CardHeader>
            <CardTitle>Level</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end gap-3">
              <span className="tabular text-4xl font-semibold">
                L{s.level || "—"}
              </span>
              <span className="text-muted-foreground pb-1 text-sm">
                effective ·{" "}
                {s.assessed ? "assessment-tempered" : "self-declared"}
              </span>
            </div>
            <div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span>
                Self-rated:{" "}
                <span className="text-foreground">L{s.selfLevel}</span>
              </span>
              <span>
                Target for {s.targetRoleTitle}:{" "}
                <span className="text-foreground">
                  {s.targetLevel ? `L${s.targetLevel}` : "not required"}
                </span>
              </span>
              <span>
                Last assessed:{" "}
                <span className="text-foreground">
                  {s.lastAssessed ?? "never"}
                </span>
              </span>
            </div>
            {s.targetLevel && s.level < s.targetLevel ? (
              <div className="border-warning/40 bg-warning/10 rounded-md border px-3 py-2 text-sm">
                <span className="dark:text-warning text-[oklch(0.48_0.12_75)]">
                  {s.targetLevel - s.level} level
                  {s.targetLevel - s.level === 1 ? "" : "s"} below what your
                  target role needs.
                </span>
              </div>
            ) : null}
            {s.prerequisites.length ? (
              <p className="text-muted-foreground text-xs">
                Builds on: {s.prerequisites.join(", ")}
              </p>
            ) : null}
          </CardContent>
        </Card>

        {/* evidence stack */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Why the system believes this</CardTitle>
            <EvidenceBadge confidence={s.confidence} rationale={s.rationale} />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-muted-foreground text-xs">
              Evidence score {s.evidenceScorePct}% — stronger evidence types
              first. Human verification is the only route to “verified”.
            </div>
            {s.stack.length ? (
              <ol className="space-y-1.5">
                {s.stack.map((e, i) => (
                  <li
                    key={i}
                    className="border-border flex items-center justify-between rounded-md border px-2.5 py-1.5 text-sm"
                  >
                    <span className={`font-medium ${KIND_TONE[e.kind] ?? ""}`}>
                      {evidenceKindLabel(e.kind)}
                      {e.verifier ? (
                        <span className="text-muted-foreground font-normal">
                          {" "}
                          · {e.verifier}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {e.label}
                      {e.date ? ` · ${e.date}` : ""}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-muted-foreground text-sm">
                No evidence yet — this level is unverified and heavily
                discounted.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* origins */}
      <Card>
        <CardHeader>
          <CardTitle>Where this skill came from</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-3">
          <Origin
            label="Courses"
            items={s.origins.courses.map((c) => `${c.title} (${c.grade})`)}
          />
          <Origin
            label="Projects"
            items={s.origins.projects.map((p) => p.title)}
          />
          <Origin
            label="Certifications"
            items={s.origins.certifications.map((c) => c.name)}
          />
        </CardContent>
      </Card>

      {/* competencies */}
      {s.competencies.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Feeds these competencies</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {s.competencies.map((c) => (
              <span
                key={c.id}
                className="border-border inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
              >
                {c.name}
                {c.requiredByGoal ? (
                  <Badge variant="subtle" className="px-1 py-0 text-[0.6rem]">
                    goal
                  </Badge>
                ) : null}
              </span>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {/* next step */}
      <Card className="border-primary/30">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
          <div>
            <div className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Your next step for this skill
            </div>
            <div className="mt-0.5 font-medium">{s.nextStep.label}</div>
            <p className="text-muted-foreground mt-1 max-w-xl text-sm">
              {s.nextStep.why}
            </p>
          </div>
          <Link
            href={s.nextStep.href}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 rounded-md px-3 py-1.5 text-sm font-medium"
          >
            {s.nextStep.label} →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function Origin({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </div>
      {items.length ? (
        <ul className="mt-1 space-y-0.5">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-1">—</p>
      )}
    </div>
  );
}
