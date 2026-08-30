import { deleteAchievementAction } from "@/app/student-actions";
import { AchievementForm } from "@/components/kaushal/entity-forms";
import { JourneyStepper } from "@/components/kaushal/journey-stepper";
import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAchievements, getJourney } from "@/lib/data";
import { getStudentCtx } from "@/lib/data/viewer";
import { getDataset } from "@/lib/demo/dataset";
import { currentStudentId } from "@/lib/guards";

const ICON: Record<string, string> = {
  hackathon: "⚡",
  award: "🏅",
  competition: "◈",
  publication: "❝",
  research: "⚗",
  leadership: "◆",
  extracurricular: "✦",
};

export default async function AchievementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sid = await currentStudentId();
  const sp = await searchParams;
  const ctx = await getStudentCtx(sid);
  const achievements = getAchievements(sid, ctx);
  const journey = getJourney(sid, ctx);
  const d = getDataset();
  const isSession = (id: string) => id.startsWith("ach-s");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Achievements"
        description="Hackathons, awards, publications and leadership. Each can carry evidence and claim a competency — often the behavioural ones a transcript never shows."
      />
      <JourneyStepper stages={journey} variant="strip" />

      {sp.saved === "1" ? (
        <div className="border-success/40 bg-success/10 text-success rounded-md border px-3 py-2 text-sm">
          ✓ Achievement added to your record.
        </div>
      ) : null}
      {sp.removed === "1" ? (
        <div className="border-border bg-muted/50 text-muted-foreground rounded-md border px-3 py-2 text-sm">
          Achievement removed.
        </div>
      ) : null}

      <AchievementForm
        skills={d.skills
          .map((s) => ({ id: s.id, name: s.name }))
          .sort((a, b) => a.name.localeCompare(b.name))}
      />

      {achievements.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            No achievements recorded yet.
          </CardContent>
        </Card>
      ) : (
        <ol className="border-border relative space-y-4 border-l pl-6">
          {achievements.map((a) => (
            <li key={a.id} className="relative">
              <span className="border-border bg-card absolute top-0.5 -left-[1.85rem] grid size-6 place-items-center rounded-full border text-[0.8rem]">
                {ICON[a.type] ?? "•"}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{a.title}</span>
                <Badge variant="muted" className="capitalize">
                  {a.type}
                </Badge>
                {a.evidence?.verifiedBy ? (
                  <Badge variant="success">
                    verified · {a.evidence.verifiedBy}
                  </Badge>
                ) : null}
                {isSession(a.id) ? (
                  <form action={deleteAchievementAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="text-muted-foreground hover:text-destructive text-xs">
                      remove
                    </button>
                  </form>
                ) : null}
              </div>
              <div className="text-muted-foreground text-xs">
                {a.organisation} · {a.date}
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {a.description}
              </p>
              {(a.skillNames.length || a.competencyNames.length) && (
                <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                  {a.skillNames.map((s) => (
                    <span
                      key={s}
                      className="bg-muted text-muted-foreground rounded px-1.5 py-0.5"
                    >
                      {s}
                    </span>
                  ))}
                  {a.competencyNames.map((c) => (
                    <span
                      key={c}
                      className="bg-primary-muted text-primary rounded px-1.5 py-0.5"
                    >
                      → {c}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
