import { Badge } from "@/components/ui/badge";
import type { SkillGapReport } from "@/lib/engines";

const PRIORITY_VARIANT = {
  high: "danger",
  medium: "warning",
  low: "muted",
} as const;

export function GapList({ report }: { report: SkillGapReport }) {
  const gaps = report.gaps.filter((g) => g.gap > 0 || !g.hasEvidence);
  if (!gaps.length)
    return (
      <p className="text-muted-foreground text-sm">
        No blocking gaps for {report.roleTitle}. Keep evidence current.
      </p>
    );
  return (
    <div className="space-y-2">
      {gaps.map((g) => (
        <div key={g.skillId} className="border-border rounded-lg border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{g.name}</span>
              <Badge variant={PRIORITY_VARIANT[g.priority]}>{g.priority}</Badge>
              {g.mandatory ? <Badge variant="outline">mandatory</Badge> : null}
              {!g.hasEvidence ? (
                <Badge variant="muted">no evidence</Badge>
              ) : null}
            </div>
            <span className="tabular text-muted-foreground text-sm">
              L{g.current} → L{g.required}
              {g.gap > 0 ? `  (gap ${g.gap})` : ""}
            </span>
          </div>
          <ul className="text-muted-foreground mt-1.5 space-y-0.5 text-sm">
            {g.actions.map((a, i) => (
              <li key={i}>→ {a}</li>
            ))}
          </ul>
          {g.resources.length ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {g.resources.map((r) => (
                <span
                  key={r.id}
                  className="border-border bg-muted/40 rounded border px-1.5 py-0.5 text-xs"
                >
                  {r.kind === "project"
                    ? "🛠 "
                    : r.kind === "mentorship"
                      ? "🤝 "
                      : "📘 "}
                  {r.title} · {r.provider}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function Roadmap({ report }: { report: SkillGapReport }) {
  if (!report.roadmap.length)
    return <p className="text-muted-foreground text-sm">No roadmap needed.</p>;
  return (
    <div>
      <p className="text-muted-foreground mb-3 text-sm">
        Sequenced to respect skill prerequisites · ~{report.totalWeeks} weeks ·
        each step ends in evidence a recruiter can verify.
      </p>
      <ol className="border-border relative space-y-3 border-l pl-5">
        {report.roadmap.map((s) => (
          <li key={s.order} className="relative">
            <span className="border-border bg-card tabular absolute top-0.5 -left-[1.6rem] grid size-5 place-items-center rounded-full border text-[0.7rem] font-semibold">
              {s.order}
            </span>
            <div className="font-medium">{s.activity}</div>
            <div className="text-muted-foreground text-sm">
              {s.skillName}: L{s.fromLevel} → L{s.toLevel} · ~{s.estWeeks} weeks
            </div>
            <div className="text-primary mt-0.5 text-xs">
              Evidence produced: {s.producesEvidence}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
