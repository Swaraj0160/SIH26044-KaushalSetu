import { GapList, Roadmap } from "@/components/kaushal/gap-list";
import { PageHeader } from "@/components/kaushal/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudentDashboard } from "@/lib/data";
import { currentStudentId } from "@/lib/guards";

export default async function GapsPage() {
  const sid = await currentStudentId();
  const dash = getStudentDashboard(sid);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill gaps & development roadmap"
        description={`Gap = required level − current level for ${dash.targetRole.title}. Each gap names the evidence that will close it. The roadmap sequences them by prerequisite.`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Gaps ({dash.gap.gaps.filter((g) => g.gap > 0).length} blocking)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GapList report={dash.gap} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Development roadmap</CardTitle>
          </CardHeader>
          <CardContent>
            <Roadmap report={dash.gap} />
          </CardContent>
        </Card>
      </div>

      <div className="border-border bg-muted/40 text-muted-foreground rounded-lg border p-4 text-sm">
        The path is always <strong>gap → action → evidence → competency</strong>
        . A finished course is not the goal; a verifiable artefact a recruiter
        trusts is.
      </div>
    </div>
  );
}
