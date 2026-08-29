import { setOverrideAction } from "@/app/actions";
import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CollaborationStage } from "@/lib/domain/types";
import { getDataset } from "@/lib/demo/dataset";
import { requireRole } from "@/lib/guards";
import { getOverrides } from "@/lib/overrides";

const STAGES: CollaborationStage[] = [
  "requested",
  "approved",
  "active",
  "completed",
];
const NEXT: Record<CollaborationStage, CollaborationStage | null> = {
  requested: "approved",
  approved: "active",
  active: "completed",
  completed: null,
};

export default async function CollaborationsPage() {
  const persona = await requireRole("faculty");
  const d = getDataset();
  const faculty = d.facultyById.get(persona.refId)!;
  const overrides = await getOverrides();

  const collabs = d.collaborations
    .filter((c) => c.institutionId === faculty.institutionId)
    .map((c) => ({
      ...c,
      stage: (overrides[`collab:${c.id}`] as CollaborationStage) ?? c.stage,
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academia–Industry collaboration pipeline"
        description="Real state, not a decorative board. Advancing a stage records the transition for the session (production writes an audit row)."
      />
      <div className="grid gap-4 md:grid-cols-4">
        {STAGES.map((stage) => {
          const items = collabs.filter((c) => c.stage === stage);
          return (
            <div
              key={stage}
              className="border-border bg-muted/30 rounded-xl border p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold capitalize">
                  {stage}
                </span>
                <Badge variant="muted">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map((c) => (
                  <Card key={c.id} className="p-3">
                    <div className="text-sm leading-tight font-medium">
                      {c.title}
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs capitalize">
                      {c.type.replace(/_/g, " ")}
                    </div>
                    {c.outcome ? (
                      <div className="text-success mt-1 text-xs">
                        {c.outcome}
                      </div>
                    ) : null}
                    {NEXT[c.stage] ? (
                      <form action={setOverrideAction} className="mt-2">
                        <input
                          type="hidden"
                          name="key"
                          value={`collab:${c.id}`}
                        />
                        <input
                          type="hidden"
                          name="value"
                          value={NEXT[c.stage]!}
                        />
                        <input
                          type="hidden"
                          name="revalidate"
                          value="/faculty"
                        />
                        <button className="border-border hover:bg-muted w-full rounded-md border px-2 py-1 text-xs">
                          Advance → {NEXT[c.stage]}
                        </button>
                      </form>
                    ) : null}
                  </Card>
                ))}
                {!items.length ? (
                  <p className="text-muted-foreground text-xs">—</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
