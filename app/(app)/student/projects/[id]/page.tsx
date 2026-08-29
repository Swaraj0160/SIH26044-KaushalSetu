import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProject } from "@/lib/data";
import { currentStudentId } from "@/lib/guards";

const TYPE_LABEL: Record<string, string> = {
  mini: "Mini project",
  major: "Major / final-year",
  personal: "Personal",
  academic: "Academic",
  industry: "Industry",
  open_source: "Open source",
};

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const sid = await currentStudentId();
  const { id } = await params;
  const p = getProject(sid, id);
  if (!p) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={p.title}
        description={`${TYPE_LABEL[p.type] ?? p.type} · ${p.period || p.date.slice(0, 7)} · ${p.status.replace(/_/g, " ")}`}
        actions={
          <Link
            href="/student/projects"
            className="text-primary text-sm hover:underline"
          >
            ← all projects
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{p.summary}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-muted-foreground text-xs tracking-wide uppercase">
                    Your contribution
                  </div>
                  <div className="mt-0.5">{p.contribution}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs tracking-wide uppercase">
                    Team
                  </div>
                  <div className="mt-0.5">
                    {p.team.length ? p.team.join(", ") : "Solo"}
                  </div>
                </div>
              </div>
              {p.tech.length ? (
                <div>
                  <div className="text-muted-foreground text-xs tracking-wide uppercase">
                    Technologies
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {p.tech.map((t) => (
                      <span
                        key={t}
                        className="border-border bg-muted/40 rounded border px-1.5 py-0.5 text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {(p.links.repo || p.links.demo || p.links.docs) && (
                <div className="flex flex-wrap gap-3 text-xs">
                  {p.links.repo ? (
                    <span className="text-primary">↗ Repository</span>
                  ) : null}
                  {p.links.demo ? (
                    <span className="text-primary">↗ Demo</span>
                  ) : null}
                  {p.links.docs ? (
                    <span className="text-primary">↗ Documentation</span>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skill → evidence → competency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  Skills demonstrated:
                </span>
                {p.skillNames.map((s) => (
                  <span
                    key={s}
                    className="bg-muted rounded px-1.5 py-0.5 text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  Evidence produced:
                </span>
                {p.links.repo ? (
                  <Badge variant="outline">repository</Badge>
                ) : null}
                {p.evaluations.map((e, i) => (
                  <Badge key={i} variant="success">
                    {e.role} evaluation{e.score ? ` · ${e.score}/100` : ""}
                  </Badge>
                ))}
                {!p.evaluations.length && !p.links.repo ? (
                  <span className="text-muted-foreground text-xs">
                    none yet — request a review
                  </span>
                ) : null}
              </div>
              {p.competencyNames.length ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground text-xs">
                    Contributes to competency:
                  </span>
                  {p.competencyNames.map((c) => (
                    <span
                      key={c}
                      className="bg-primary-muted text-primary rounded px-1.5 py-0.5 text-xs"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Evaluations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {p.evaluations.length ? (
              p.evaluations.map((e, i) => (
                <div key={i} className="border-border rounded-lg border p-3">
                  <div className="font-medium">
                    {e.by}{" "}
                    <Badge
                      variant={e.role === "industry" ? "success" : "info"}
                      className="ml-1"
                    >
                      {e.role}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground">
                    {e.verdict}
                    {e.score ? ` · ${e.score}/100` : ""} · {e.date}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">
                No evaluation yet. Ask a faculty member to review this project
                from their verification queue — it turns project work into
                verified evidence.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
