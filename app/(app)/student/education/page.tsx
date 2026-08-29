import Link from "next/link";

import { JourneyStepper } from "@/components/kaushal/journey-stepper";
import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getEducation, getJourney } from "@/lib/data";
import { currentStudentId } from "@/lib/guards";

const GRADE_TONE: Record<string, string> = {
  O: "text-success",
  "A+": "text-success",
  A: "text-foreground",
  "B+": "text-muted-foreground",
  B: "text-muted-foreground",
  C: "text-muted-foreground",
};

export default async function EducationPage() {
  const sid = await currentStudentId();
  const edu = getEducation(sid);
  const journey = getJourney(sid);

  const byTerm = new Map<string, typeof edu.courses>();
  for (const c of edu.courses) {
    byTerm.set(c.term, [...(byTerm.get(c.term) ?? []), c]);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Education"
        description="Stage 01 of your journey. Education isn't a transcript here — it's where your skills came from. Each course links to the skills it developed."
      />
      <JourneyStepper stages={journey} variant="strip" />

      <Card>
        <CardContent className="grid gap-4 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Degree" value={edu.degree} />
          <Field
            label="Institution"
            value={`${edu.institution} · ${edu.department}`}
          />
          <Field
            label="Current semester"
            value={`Sem ${edu.currentSemester} · ${edu.academicYear}`}
          />
          <Field label="CGPA" value={edu.cgpa.toFixed(2)} />
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
          Courses ({edu.courses.length}) → skills produced
        </h2>
        {[...byTerm.entries()].map(([term, courses]) => (
          <div key={term}>
            <div className="text-muted-foreground mb-1.5 text-xs font-medium">
              {term}
            </div>
            <div className="space-y-2">
              {courses.map((c) => (
                <div
                  key={c.code}
                  className="border-border rounded-lg border p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-medium">{c.title}</span>
                      <span className="text-muted-foreground ml-2 text-xs">
                        {c.code} · {c.credits} credits
                      </span>
                    </div>
                    <span
                      className={`text-sm font-semibold ${GRADE_TONE[c.grade] ?? ""}`}
                    >
                      {c.grade}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-muted-foreground text-xs">
                      Skills:
                    </span>
                    {c.skills.length ? (
                      c.skills.map((s) => (
                        <Link
                          key={s.id}
                          href="/student/skills"
                          className="border-border bg-muted/40 hover:border-primary/40 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs"
                        >
                          {s.name}
                          {s.hasIt ? (
                            <span className="tabular text-muted-foreground">
                              L{s.heldLevel}
                            </span>
                          ) : (
                            <Badge
                              variant="muted"
                              className="px-1 py-0 text-[0.6rem]"
                            >
                              not yet
                            </Badge>
                          )}
                        </Link>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="border-border bg-muted/40 text-muted-foreground rounded-lg border p-4 text-sm">
        <strong className="text-foreground">
          Education → Skills → Competencies.
        </strong>{" "}
        Courses seed your skill list; assessments and projects then turn those
        skills into evidence. See your{" "}
        <Link href="/student/skills" className="text-primary underline">
          skills &amp; evidence
        </Link>
        .
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground text-xs tracking-wide uppercase">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-medium">{value}</div>
    </div>
  );
}
