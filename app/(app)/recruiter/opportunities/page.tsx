import Link from "next/link";

import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { recruiterOpportunities } from "@/lib/data";
import { getDataset } from "@/lib/demo/dataset";
import { requireRole } from "@/lib/guards";
import { personaEmployerId } from "@/lib/session";

export default async function RecruiterOpportunities() {
  const persona = await requireRole("recruiter");
  const employerId = personaEmployerId(persona);
  const d = getDataset();
  const opps = recruiterOpportunities(employerId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Postings"
        description="Every posting is defined by competency requirements, not a keyword list. Selection surfaces evidence-weighted fit."
      />
      <Card>
        <CardContent className="space-y-3 pt-5">
          {opps.map((o) => {
            const role = d.roleById.get(o.opportunity.roleId)!;
            return (
              <Link
                key={o.opportunity.id}
                href={`/recruiter/opportunities/${o.opportunity.id}`}
                className="border-border hover:bg-muted block rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{role.title}</span>
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <Badge variant="outline">
                      {o.opportunity.type.replace("_", " ")}
                    </Badge>
                    <span>{o.applicants} applicants</span>
                    <Badge variant="info">{o.shortlisted} shortlisted</Badge>
                  </div>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                  {role.requirements
                    .filter((r) => r.mandatory)
                    .map((r) => (
                      <span
                        key={r.competencyId}
                        className="bg-primary-muted text-primary rounded px-1.5 py-0.5"
                      >
                        {d.competencyById.get(r.competencyId)?.name} ≥ L
                        {r.minLevel}
                      </span>
                    ))}
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
