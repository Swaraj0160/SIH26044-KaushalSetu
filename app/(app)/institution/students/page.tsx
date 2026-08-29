import { PageHeader } from "@/components/kaushal/page-header";
import { BandLabel } from "@/components/kaushal/primitives";
import { Card, CardContent } from "@/components/ui/card";
import { getInstitutionStudents } from "@/lib/data";
import { requireRole } from "@/lib/guards";
import { personaInstitutionId } from "@/lib/session";

export default async function InstitutionStudents() {
  const persona = await requireRole("institution_admin");
  const students = getInstitutionStudents(personaInstitutionId(persona));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Students (${students.length})`}
        description="Every student against their own declared target role. Readiness and evidence are computed identically to the student-facing view."
      />
      <Card>
        <CardContent className="overflow-x-auto pt-5">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-border text-muted-foreground border-b text-left text-xs tracking-wide uppercase">
              <tr>
                <th className="py-2 pr-3 font-medium">Student</th>
                <th className="py-2 pr-3 font-medium">Dept</th>
                <th className="py-2 pr-3 font-medium">Target role</th>
                <th className="py-2 pr-3 text-right font-medium">CGPA</th>
                <th className="py-2 pr-3 text-right font-medium">Readiness</th>
                <th className="py-2 pr-3 text-right font-medium">Evidence</th>
                <th className="py-2 pr-3 font-medium">Biggest gap</th>
                <th className="py-2 font-medium">Band</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="py-2 pr-3 font-medium">{s.name}</td>
                  <td className="text-muted-foreground py-2 pr-3">
                    {s.department.split(" ")[0]}
                  </td>
                  <td className="py-2 pr-3">{s.targetRole}</td>
                  <td className="tabular py-2 pr-3 text-right">{s.cgpa}</td>
                  <td className="tabular py-2 pr-3 text-right font-medium">
                    {s.readiness}
                  </td>
                  <td className="tabular text-muted-foreground py-2 pr-3 text-right">
                    {s.evidencePct}%
                  </td>
                  <td className="text-muted-foreground py-2 pr-3">
                    {s.biggestGap}
                  </td>
                  <td className="py-2">
                    <BandLabel band={s.band} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
