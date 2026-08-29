import { Heatmap } from "@/components/kaushal/heatmap";
import { PageHeader } from "@/components/kaushal/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getInstitutionOverview } from "@/lib/data";
import { getDataset } from "@/lib/demo/dataset";
import { requireRole } from "@/lib/guards";
import { personaInstitutionId } from "@/lib/session";

export default async function HeatmapPage() {
  const persona = await requireRole("institution_admin");
  const instId = personaInstitutionId(persona);
  const ov = getInstitutionOverview(instId);
  const d = getDataset();
  const skillNames = ov.heatmapSkillIds.map((id) => ({
    id,
    name: d.skillById.get(id)?.name ?? id,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Skill Heatmap"
        description="Departments × the skills their students' target roles actually require. Green = strong, amber = moderate, red = critical. Click any cell for the affected students and a recommended institutional action."
      />
      <Card>
        <CardContent className="pt-5">
          <Heatmap
            rows={ov.heatmap}
            skillNames={skillNames}
            institutionId={instId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
