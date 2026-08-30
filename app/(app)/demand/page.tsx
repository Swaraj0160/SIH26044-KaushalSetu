import { BarRows, TrendChips } from "@/components/kaushal/charts";
import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/misc";
import { getDemandReport } from "@/lib/data";
import { requireRole } from "@/lib/guards";

export default async function DemandPage() {
  await requireRole("institution_admin", "recruiter", "super_admin", "faculty");
  const dm = getDemandReport();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Industry Skill-Demand Intelligence"
        description="Aggregated from the live opportunity corpus: which skills and roles industry is asking for, and how that is changing."
        actions={
          <Badge variant="outline">
            Simulated dataset — labelled synthetic
          </Badge>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Opportunities analysed"
              value={dm.totalOpportunities}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat label="Skills in demand" value={dm.allSkills.length} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat label="Surging skills" value={dm.surging.length} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat label="Declining" value={dm.declining.length} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Surging</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChips
              items={dm.surging}
              caption="+40% or more openings vs the previous synthetic period."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Emerging / growing</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChips
              items={dm.emerging}
              caption="Steady upward movement (+12–40%)."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Declining</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChips
              items={dm.declining}
              caption="Fewer new postings cite these — still relevant, lower urgency."
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role demand</CardTitle>
        </CardHeader>
        <CardContent>
          <BarRows
            data={dm.roles.slice(0, 10).map((r) => ({
              label: r.title,
              value: r.openings,
              sub: r.medianSalaryLpa
                ? `₹${r.medianSalaryLpa} LPA`
                : r.medianStipend
                  ? `₹${r.medianStipend.toLocaleString("en-IN")}/mo`
                  : undefined,
            }))}
            unit=" openings"
            caption="Openings summed across postings. Each role links to a competency profile — the gap between this and institutional supply is the actionable signal."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demand by location</CardTitle>
        </CardHeader>
        <CardContent>
          <BarRows
            data={dm.locations.slice(0, 8).map((l) => ({
              label: l.city,
              value: l.openings,
              sub: `top: ${l.topRole}`,
            }))}
            unit=" openings"
          />
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-xs">
        Real deployments would blend this with National Career Service and
        Sector Skill Council data. No government statistics are fabricated here
        — every number is derived from the bundled synthetic opportunity set.
      </p>
    </div>
  );
}
