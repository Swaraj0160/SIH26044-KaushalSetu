import { BarRows, ScatterMini } from "@/components/kaushal/charts";
import { PageHeader } from "@/components/kaushal/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/misc";
import { getPlacementIntelligence } from "@/lib/data";
import { requireRole } from "@/lib/guards";
import { personaInstitutionId } from "@/lib/session";

export default async function PlacementIntelligence() {
  const persona = await requireRole("institution_admin");
  const pi = getPlacementIntelligence(personaInstitutionId(persona));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Placement Intelligence"
        description="Not 'placed / not placed'. How competency development correlates with outcomes — the evidence for curriculum and training investment. Synthetic dataset."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <Stat label="Outcomes" value={pi.total} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Internship → placement"
              value={`${pi.conversionPct}%`}
              hint={`${pi.conversions} conversions`}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Avg readiness gain"
              value={`+${pi.avgReadinessGain}`}
              hint="start → offer"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat label="Roles placed into" value={pi.roleRows.length} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Outcomes by role</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-border text-muted-foreground border-b text-left text-xs tracking-wide uppercase">
              <tr>
                <th className="py-2 pr-3 font-medium">Role</th>
                <th className="py-2 pr-3 text-right font-medium">Count</th>
                <th className="py-2 pr-3 text-right font-medium">
                  Median CTC (LPA)
                </th>
                <th className="py-2 pr-3 text-right font-medium">
                  Avg days to offer
                </th>
                <th className="py-2 text-right font-medium">
                  Avg gaps closed first
                </th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {pi.roleRows.map((r) => (
                <tr key={r.title}>
                  <td className="py-2 pr-3 font-medium">{r.title}</td>
                  <td className="tabular py-2 pr-3 text-right">{r.count}</td>
                  <td className="tabular py-2 pr-3 text-right">
                    ₹{r.medianCtc}
                  </td>
                  <td className="tabular py-2 pr-3 text-right">{r.avgDays}</td>
                  <td className="tabular py-2 text-right">{r.avgGapClosed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Readiness at offer vs CTC</CardTitle>
          </CardHeader>
          <CardContent>
            <ScatterMini
              points={pi.scatter.map((s) => ({ x: s.readiness, y: s.ctc }))}
              xLabel="Readiness at offer"
              yLabel="CTC (LPA)"
              caption="Higher readiness at offer trends with higher CTC — the dashed line is a least-squares fit over synthetic outcomes."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Readiness at offer vs time to offer</CardTitle>
          </CardHeader>
          <CardContent>
            <ScatterMini
              points={pi.scatter.map((s) => ({ x: s.readiness, y: s.days }))}
              xLabel="Readiness at offer"
              yLabel="Days to offer"
              caption="More-ready students convert faster. Investment in closing gaps early shortens the placement cycle."
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Placements by role — volume</CardTitle>
        </CardHeader>
        <CardContent>
          <BarRows
            data={pi.roleRows.map((r) => ({
              label: r.title,
              value: r.count,
              sub: `₹${r.medianCtc} LPA median`,
            }))}
            caption="Concentration of outcomes by role guides which competencies to double down on."
          />
        </CardContent>
      </Card>
    </div>
  );
}
