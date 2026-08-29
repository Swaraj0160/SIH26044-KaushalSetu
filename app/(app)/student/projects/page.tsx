import Link from "next/link";

import { JourneyStepper } from "@/components/kaushal/journey-stepper";
import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getJourney, getStudentProjects } from "@/lib/data";
import { currentStudentId } from "@/lib/guards";

const TYPE_LABEL: Record<string, string> = {
  mini: "Mini project",
  major: "Major / final-year",
  personal: "Personal",
  academic: "Academic",
  industry: "Industry",
  open_source: "Open source",
};

export default async function ProjectsPage() {
  const sid = await currentStudentId();
  const projects = getStudentProjects(sid);
  const journey = getJourney(sid);

  const groups = new Map<string, typeof projects>();
  for (const p of projects)
    groups.set(p.type, [...(groups.get(p.type) ?? []), p]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Stage 04. Projects are your evidence factory: each one shows a skill → evidence → competency chain a recruiter can trust."
      />
      <JourneyStepper stages={journey} variant="strip" />

      {projects.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            No projects yet. A guided project is often the fastest way to close
            a gap and produce verifiable evidence — see{" "}
            <Link
              href="/student/career?tab=gaps"
              className="text-primary underline"
            >
              Skill Gaps &amp; Roadmap
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        [...groups.entries()].map(([type, items]) => (
          <section key={type}>
            <h2 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
              {TYPE_LABEL[type] ?? type} ({items.length})
            </h2>
            <div className="space-y-2">
              {items.map((p) => (
                <Link
                  key={p.id}
                  href={`/student/projects/${p.id}`}
                  className="border-border hover:border-primary/40 hover:bg-muted/40 block rounded-lg border p-3 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{p.title}</span>
                    <div className="flex items-center gap-2 text-xs">
                      {p.evaluations.some((e) => e.role === "faculty") ? (
                        <Badge variant="success">faculty-verified</Badge>
                      ) : p.evaluations.some((e) => e.role === "industry") ? (
                        <Badge variant="success">industry-verified</Badge>
                      ) : (
                        <Badge variant="muted">
                          {p.status.replace(/_/g, " ")}
                        </Badge>
                      )}
                      <span className="text-muted-foreground">
                        {p.period || p.date.slice(0, 7)}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {p.summary}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground">Skills:</span>
                    {p.skillNames.map((s) => (
                      <span
                        key={s}
                        className="bg-muted text-muted-foreground rounded px-1.5 py-0.5"
                      >
                        {s}
                      </span>
                    ))}
                    {p.competencyNames.length ? (
                      <>
                        <span className="text-muted-foreground">→ claims:</span>
                        {p.competencyNames.map((c) => (
                          <span
                            key={c}
                            className="bg-primary-muted text-primary rounded px-1.5 py-0.5"
                          >
                            {c}
                          </span>
                        ))}
                      </>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
