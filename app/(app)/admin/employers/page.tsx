import { setOverrideAction } from "@/app/actions";
import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getDataset } from "@/lib/demo/dataset";
import { requireRole } from "@/lib/guards";
import { getOverrides } from "@/lib/overrides";

export default async function EmployersPage() {
  await requireRole("super_admin");
  const d = getDataset();
  const overrides = await getOverrides();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employer verification"
        description="Only verified employers can post opportunities and see candidate rankings. Verification is a governance control, not automated."
      />
      <Card>
        <CardContent className="space-y-2 pt-5">
          {d.employers.map((e) => {
            const verified =
              e.verified || overrides[`employer:${e.id}`] === "verified";
            return (
              <div
                key={e.id}
                className="border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
              >
                <div>
                  <div className="font-medium">{e.name}</div>
                  <div className="text-muted-foreground text-xs">
                    {e.sector} · {e.city}, {e.state}
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {e.about}
                  </p>
                </div>
                {verified ? (
                  <Badge variant="success">verified</Badge>
                ) : (
                  <form action={setOverrideAction}>
                    <input
                      type="hidden"
                      name="key"
                      value={`employer:${e.id}`}
                    />
                    <input type="hidden" name="value" value="verified" />
                    <input type="hidden" name="revalidate" value="/admin" />
                    <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1 text-xs font-medium">
                      Verify employer
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
