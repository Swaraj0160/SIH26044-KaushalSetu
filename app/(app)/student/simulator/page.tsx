import { PageHeader } from "@/components/kaushal/page-header";
import { CareerSimulator } from "@/components/kaushal/simulator";
import { Card, CardContent } from "@/components/ui/card";
import { simulateRoles } from "@/lib/data";
import { getDataset } from "@/lib/demo/dataset";
import { currentStudentId } from "@/lib/guards";

export default async function SimulatorPage() {
  const sid = await currentStudentId();
  const d = getDataset();
  const student = d.studentById.get(sid)!;
  const fits = simulateRoles(
    sid,
    d.roles.map((r) => r.id),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Career Simulator"
        description="Compare your current profile against any role: current vs required competencies, the gap, a development plan, and projected readiness. Everything recomputes from the same deterministic engines."
      />
      <Card>
        <CardContent className="pt-5">
          <CareerSimulator fits={fits} targetRoleId={student.targetRoleId} />
        </CardContent>
      </Card>
    </div>
  );
}
