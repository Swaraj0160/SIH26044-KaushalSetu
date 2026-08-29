import Link from "next/link";

import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Stat } from "@/components/ui/misc";
import { getInstitutionOverview } from "@/lib/data";
import { requireRole } from "@/lib/guards";
import { personaInstitutionId } from "@/lib/session";

export default async function InstitutionCommandCenter() {
  const persona = await requireRole("institution_admin");
  const instId = personaInstitutionId(persona);
  const ov = getInstitutionOverview(instId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Command Center"
        description={`${ov.institutionName} — your job here: understand workforce readiness and act on the systemic gaps.`}
        actions={<Badge variant="accent">Demo persona · {persona.name}</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <Stat label="Students" value={ov.totalStudents} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Placement-ready"
              value={ov.placementReady}
              hint={`${Math.round((ov.placementReady / ov.totalStudents) * 100)}% · readiness ≥ 75`}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Mean readiness"
              value={ov.meanReadiness}
              hint="/ 100"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat label="Active internships" value={ov.internshipActive} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Department readiness</CardTitle>
            <Link
              href="/institution/heatmap"
              className="text-primary text-xs hover:underline"
            >
              Skill heatmap →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {ov.departments.map((dp) => (
              <div key={dp.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{dp.name}</span>
                  <span className="tabular text-muted-foreground">
                    {dp.meanReadiness}/100 · {dp.placementReadyPct}% ready ·{" "}
                    {dp.students} students
                  </span>
                </div>
                <Progress value={dp.meanReadiness} className="mt-1 h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top institutional skill gaps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ov.criticalGaps.map((g) => (
              <div
                key={g.skill}
                className="border-border flex items-center justify-between rounded-lg border p-2.5 text-sm"
              >
                <span className="font-medium">{g.skill}</span>
                <span className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span>
                    {g.belowBarPct}% below L4 · {g.students} students
                  </span>
                  <Badge
                    variant={
                      g.severity === "critical"
                        ? "danger"
                        : g.severity === "weak"
                          ? "warning"
                          : "muted"
                    }
                  >
                    mean L{g.meanLevel}
                  </Badge>
                </span>
              </div>
            ))}
            <p className="text-muted-foreground pt-1 text-xs">
              Cross-reference with{" "}
              <Link href="/demand" className="text-primary underline">
                industry demand
              </Link>{" "}
              to prioritise curriculum changes.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <Stat label="Industry partners" value={ov.industryPartners} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Active collaborations"
              value={ov.activeCollaborations}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Internship → placement"
              value={`${ov.placementConversionPct}%`}
              hint="conversion"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
