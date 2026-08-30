import Link from "next/link";

import {
  advanceInterventionAction,
  removeInterventionAction,
} from "@/app/institution-actions";
import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/guards";
import {
  getInterventions,
  type Intervention,
  type InterventionStatus,
} from "@/lib/interventions";
import { personaInstitutionId } from "@/lib/session";

const NEXT_LABEL: Record<InterventionStatus, string | null> = {
  planned: "Start",
  active: "Mark complete",
  completed: null,
};
const STATUS_VARIANT: Record<InterventionStatus, "muted" | "info" | "success"> =
  { planned: "muted", active: "info", completed: "success" };

export default async function InterventionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const persona = await requireRole("institution_admin");
  const sp = await searchParams;
  const list = await getInterventions(personaInstitutionId(persona));

  const groups: [InterventionStatus, Intervention[]][] = (
    ["planned", "active", "completed"] as InterventionStatus[]
  ).map((s) => [s, list.filter((i) => i.status === s)]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Understand → Act → Measure"
        title="Interventions"
        description="Actions recorded from the skill heatmap, tracked from planned to completed, with a term-over-term check on whether the gap actually moved."
        actions={
          <Link
            href="/institution/heatmap"
            className="border-border-strong hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
          >
            Open the heatmap
          </Link>
        }
      />

      {sp.created === "1" ? (
        <div className="border-success/40 bg-success/10 text-success rounded-md border px-3 py-2 text-sm">
          ✓ Intervention recorded. Advance it as the programme runs.
        </div>
      ) : null}

      {list.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            No interventions yet. Open the{" "}
            <Link
              href="/institution/heatmap"
              className="text-primary underline"
            >
              skill heatmap
            </Link>
            , click a critical (red) cell, and record the recommended action —
            this is where analytics becomes accountable.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {groups.map(([status, items]) => (
            <section key={status}>
              <h2 className="eyebrow mb-2 capitalize">
                {status} ({items.length})
              </h2>
              <div className="space-y-2">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="border-border bg-card rounded-md border p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium">{it.title}</div>
                      <Badge variant={STATUS_VARIANT[it.status]}>
                        {it.status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {it.action}
                    </p>
                    <dl className="text-muted-foreground mt-2 space-y-0.5 text-xs">
                      <div>Owner: {it.owner}</div>
                      <div>Cohort: {it.cohortSize} students</div>
                      <div>Expected: {it.expectedImpact}</div>
                      <div>Recorded: {it.createdAt}</div>
                    </dl>
                    {it.outcome ? (
                      <p className="text-success mt-2 text-xs">{it.outcome}</p>
                    ) : null}
                    <div className="mt-2 flex gap-2">
                      {NEXT_LABEL[it.status] ? (
                        <form action={advanceInterventionAction}>
                          <input type="hidden" name="id" value={it.id} />
                          <button className="border-border-strong hover:bg-muted rounded-md border px-2.5 py-1 text-xs font-medium">
                            {NEXT_LABEL[it.status]}
                          </button>
                        </form>
                      ) : null}
                      <form action={removeInterventionAction}>
                        <input type="hidden" name="id" value={it.id} />
                        <button className="text-muted-foreground hover:text-destructive px-1 text-xs">
                          remove
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
                {items.length === 0 ? (
                  <p className="text-muted-foreground text-xs">—</p>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
