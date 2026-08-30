import Link from "next/link";

import { deleteProjectAction } from "@/app/student-actions";
import { ProjectForm } from "@/components/kaushal/entity-forms";
import { JourneyStepper } from "@/components/kaushal/journey-stepper";
import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getJourney, getStudentProjects } from "@/lib/data";
import { getStudentCtx } from "@/lib/data/viewer";
import { getDataset } from "@/lib/demo/dataset";
import { currentStudentId } from "@/lib/guards";

const TYPE_LABEL: Record<string, string> = {
  mini: "Mini project",
  major: "Major / final-year",
  personal: "Personal",
  academic: "Academic",
  industry: "Industry",
  open_source: "Open source",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sid = await currentStudentId();
  const sp = await searchParams;
  const ctx = await getStudentCtx(sid);
  const projects = getStudentProjects(sid, ctx);
  const journey = getJourney(sid, ctx);
  const d = getDataset();
  // session-added projects have ids starting "proj-s"
  const isSession = (id: string) => id.startsWith("proj-s");

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

      {sp.saved === "1" ? (
        <Banner tone="success">
          ✓ Project added — its skills now carry project-grade evidence, and
          your readiness recomputed.
        </Banner>
      ) : null}
      {sp.removed === "1" ? (
        <Banner tone="muted">Project removed.</Banner>
      ) : null}

      <ProjectForm
        skills={d.skills
          .map((s) => ({ id: s.id, name: s.name }))
          .sort((a, b) => a.name.localeCompare(b.name))}
      />

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
                <div
                  key={p.id}
                  className="border-border hover:border-primary/40 rounded-lg border p-3 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={`/student/projects/${p.id}`}
                      className="font-medium hover:underline"
                    >
                      {p.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs">
                      {isSession(p.id) ? (
                        <Badge variant="muted">added this session</Badge>
                      ) : p.evaluations.some((e) => e.role === "faculty") ? (
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
                      {isSession(p.id) ? (
                        <form action={deleteProjectAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <button className="text-muted-foreground hover:text-destructive text-xs">
                            remove
                          </button>
                        </form>
                      ) : null}
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
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function Banner({
  tone,
  children,
}: {
  tone: "success" | "muted";
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className={
        tone === "success"
          ? "border-success/40 bg-success/10 text-success rounded-md border px-3 py-2 text-sm"
          : "border-border bg-muted/50 text-muted-foreground rounded-md border px-3 py-2 text-sm"
      }
    >
      {children}
    </div>
  );
}
