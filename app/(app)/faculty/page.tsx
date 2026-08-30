import Link from "next/link";

import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Stat } from "@/components/ui/misc";
import { getDataset } from "@/lib/demo/dataset";
import { requireRole } from "@/lib/guards";
import { getOverrides } from "@/lib/overrides";

export default async function FacultyOverview() {
  const persona = await requireRole("faculty");
  const d = getDataset();
  const faculty = d.facultyById.get(persona.refId)!;
  const inst = d.institutionById.get(faculty.institutionId)!;
  const overrides = await getOverrides();

  const collabs = d.collaborations.filter(
    (c) => c.institutionId === faculty.institutionId,
  );
  const mine = collabs.filter((c) => c.facultyId === faculty.id);
  const unverifiedProjects = d.projects.filter(
    (p) =>
      !p.facultyVerifiedBy &&
      d.studentById.get(p.studentId)?.institutionId === faculty.institutionId &&
      overrides[`verify:project:${p.id}`] !== "done",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={faculty.name}
        description={`${faculty.designation} · ${inst.name} — your job here: verify student evidence and connect them to industry.`}
        actions={<Badge variant="accent">Demo · Faculty</Badge>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Industry engagement"
              value={`${faculty.industryEngagementScore}`}
              hint="/ 100"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat label="My collaborations" value={mine.length} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Active (institution)"
              value={collabs.filter((c) => c.stage === "active").length}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Evidence to verify"
              value={unverifiedProjects.length}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Industry engagement</span>
            <span className="tabular text-muted-foreground">
              {faculty.industryEngagementScore}/100
            </span>
          </div>
          <Progress
            value={faculty.industryEngagementScore}
            className="mt-1.5 h-1.5"
          />
          <p className="text-muted-foreground mt-2 text-xs">
            Composite of active collaborations, FDP participation, live projects
            supervised and industry-verified student evidence attributed to your
            mentorship.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>My collaborations</CardTitle>
            <Link
              href="/faculty/collaborations"
              className="text-primary text-xs hover:underline"
            >
              Pipeline →
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {mine.length ? (
              mine.map((c) => (
                <div
                  key={c.id}
                  className="border-border flex items-center justify-between rounded-lg border p-2.5 text-sm"
                >
                  <span>{c.title}</span>
                  <Badge variant="info" className="capitalize">
                    {c.stage}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No collaborations assigned to you yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Evidence verification queue</CardTitle>
            <Link
              href="/faculty/verification"
              className="text-primary text-xs hover:underline"
            >
              Open queue →
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {unverifiedProjects.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="border-border rounded-lg border p-2.5 text-sm"
              >
                <div className="font-medium">{p.title}</div>
                <div className="text-muted-foreground text-xs">
                  {d.studentById.get(p.studentId)?.name}
                </div>
              </div>
            ))}
            {!unverifiedProjects.length ? (
              <p className="text-muted-foreground text-sm">Queue clear.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
