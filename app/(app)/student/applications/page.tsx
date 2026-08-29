import Link from "next/link";

import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { appliedOpportunityIds } from "@/lib/applied";
import { getStudentDashboard } from "@/lib/data";
import { getDataset } from "@/lib/demo/dataset";
import { currentStudentId } from "@/lib/guards";

const FLOW = [
  "submitted",
  "under_review",
  "shortlisted",
  "interview",
  "offer",
  "hired",
];

export default async function ApplicationsPage() {
  const sid = await currentStudentId();
  const dash = getStudentDashboard(sid);
  const d = getDataset();
  const seededIds = new Set(dash.applications.map((a) => a.opportunityId));
  const extra = (await appliedOpportunityIds()).filter(
    (id) => !seededIds.has(id),
  );

  const rows = [
    ...dash.applications.map((a) => ({
      id: a.id,
      title: a.opportunity.title.split(" — ")[0],
      employer: a.employerName,
      status: a.status,
      match: a.matchAtApply,
      when: a.appliedAt,
    })),
    ...extra.map((id) => {
      const o = d.opportunityById.get(id);
      return {
        id: `local-${id}`,
        title: o?.title.split(" — ")[0] ?? id,
        employer: o ? (d.employerById.get(o.employerId)?.name ?? "—") : "—",
        status: "submitted",
        match: 0,
        when: "just now",
      };
    }),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Applications carry a snapshot of the match score at the time of applying, so progress is measurable."
      />
      {rows.length ? (
        <Card>
          <CardContent className="pt-5">
            <div className="space-y-3">
              {rows.map((r) => (
                <div key={r.id} className="border-border rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-muted-foreground text-xs">
                        {r.employer} · applied {r.when}
                        {r.match ? ` · ${r.match}% match at apply` : ""}
                      </div>
                    </div>
                    <Badge variant="info" className="capitalize">
                      {r.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {FLOW.map((s) => {
                      const idx = FLOW.indexOf(r.status);
                      const here = FLOW.indexOf(s);
                      const done = here <= idx && r.status !== "rejected";
                      return (
                        <div
                          key={s}
                          className={`h-1 flex-1 rounded-full ${done ? "bg-primary" : "bg-muted"}`}
                          title={s.replace(/_/g, " ")}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-muted-foreground text-sm">
          No applications yet.{" "}
          <Link
            href="/student/opportunities"
            className="text-primary underline"
          >
            Browse opportunities
          </Link>
          .
        </p>
      )}
    </div>
  );
}
