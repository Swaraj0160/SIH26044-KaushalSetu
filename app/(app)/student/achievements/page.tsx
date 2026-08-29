import { JourneyStepper } from "@/components/kaushal/journey-stepper";
import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAchievements, getJourney } from "@/lib/data";
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

export default async function AchievementsPage() {
  const sid = await currentStudentId();
  const achievements = getAchievements(sid);
  const journey = getJourney(sid);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Achievements"
        description="Hackathons, awards, publications and leadership. Each can carry evidence and claim a competency — often the behavioural ones a transcript never shows."
      />
      <JourneyStepper stages={journey} variant="strip" />

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
