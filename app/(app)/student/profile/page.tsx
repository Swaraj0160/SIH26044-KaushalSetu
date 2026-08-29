import Link from "next/link";

import { CompetencyGraph } from "@/components/kaushal/competency-graph";
import { JourneyStepper } from "@/components/kaushal/journey-stepper";
import { PageHeader } from "@/components/kaushal/page-header";
import {
  BandLabel,
  EvidenceBadge,
  LevelPip,
} from "@/components/kaushal/primitives";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/misc";
import {
  getCompetencyGraph,
  getEducation,
  getJourney,
  getPassport,
  getStudentProjects,
} from "@/lib/data";
import { getDataset } from "@/lib/demo/dataset";
import { currentStudentId } from "@/lib/guards";

export default async function CompetencyProfilePage() {
  const sid = await currentStudentId();
  const p = getPassport(sid);
  const graph = getCompetencyGraph(sid);
  const journey = getJourney(sid);
  const edu = getEducation(sid);
  const projects = getStudentProjects(sid);
  const d = getDataset();
  const internships = d.internships.filter((i) => i.studentId === sid);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competency Profile"
        description="Your single source of truth. Education, skills, evidence, projects, experience, certifications and feedback all feed one competency profile — which powers your readiness, matching and Passport."
        actions={
          <Link
            href="/student/passport"
            className="text-primary text-sm hover:underline"
          >
            Open Passport →
          </Link>
        }
      />
      <JourneyStepper stages={journey} variant="strip" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Readiness"
              value={p.dash.readiness.score}
              hint={<BandLabel band={p.dash.readiness.band} />}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Evidence confidence"
              value={`${p.dash.evidenceConfidencePct}%`}
              hint="portfolio-wide"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Competencies"
              value={p.competencyRows.length}
              hint="at level ≥ 2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat label="Verified skills" value={p.verifiedSkills.length} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Competency graph</CardTitle>
          </CardHeader>
          <CardContent>
            <CompetencyGraph data={graph} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Inputs feeding this profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Feed
              label="Education"
              value={`${edu.courses.length} courses`}
              href="/student/education"
            />
            <Feed
              label="Skills"
              value={`${p.dash.profile.skills.size} on record`}
              href="/student/skills"
            />
            <Feed
              label="Projects"
              value={`${projects.length}, ${projects.filter((x) => x.evaluations.length).length} evaluated`}
              href="/student/projects"
            />
            <Feed
              label="Experience"
              value={`${internships.length} internship${internships.length === 1 ? "" : "s"}`}
              href="/student/internship"
            />
            <Feed label="Certifications" value={`${p.certifications.length}`} />
            <Feed label="Endorsements" value={`${p.endorsements.length}`} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competencies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {p.competencyRows.map((c) => (
            <div key={c.id} className="border-border rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{c.name}</span>
                <span className="text-muted-foreground flex items-center gap-3 text-sm">
                  <span className="tabular">L{c.level}</span>
                  <span>NSQF ~{c.nsqfBand}</span>
                  <span className="tabular">{c.evidence}% evidence</span>
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {c.skills.map((s) => (
                  <span
                    key={s.name}
                    className="border-border bg-muted/40 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs"
                  >
                    <span
                      className="inline-block size-1.5 rounded-full"
                      style={{
                        background: `var(--confidence-${s.confidence})`,
                      }}
                    />
                    {s.name} · L{s.level}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Verified & high-evidence skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {p.verifiedSkills.length ? (
              p.verifiedSkills.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <LevelPip level={s.level} />
                    {s.name}
                  </span>
                  <EvidenceBadge
                    confidence={s.confidence}
                    rationale={s.rationale}
                  />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No high-evidence skills yet — assessments and verification move
                skills into this list.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faculty & industry feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {p.endorsements.length ? (
              p.endorsements.map((e, i) => (
                <div
                  key={i}
                  className="border-border rounded-lg border p-3 text-sm"
                >
                  <div className="font-medium">
                    {e.by} · {e.organisation}{" "}
                    <Badge
                      variant={e.role === "industry" ? "success" : "info"}
                      className="ml-1"
                    >
                      {e.role}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground">
                    On{" "}
                    <span className="text-foreground">{e.competencyName}</span>:
                    “{e.note}”
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No endorsements yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Feed({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="border-border flex items-center justify-between rounded-md border px-2.5 py-1.5">
      <span className="font-medium">{label}</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
  return href ? (
    <Link href={href} className="block hover:opacity-80">
      {inner}
    </Link>
  ) : (
    inner
  );
}
