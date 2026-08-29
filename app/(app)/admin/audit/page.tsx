import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getDataset } from "@/lib/demo/dataset";
import { requireRole } from "@/lib/guards";

const ROLE_VARIANT: Record<
  string,
  "info" | "success" | "warning" | "muted" | "accent"
> = {
  student: "info",
  faculty: "success",
  recruiter: "accent",
  institution_admin: "warning",
  super_admin: "muted",
};

export default async function AuditLog() {
  await requireRole("super_admin");
  const d = getDataset();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="Append-only record of security-relevant actions. No secrets or full PII — identifiers and action names only. Readable by platform admins."
      />
      <Card>
        <CardContent className="pt-5">
          <div className="space-y-1">
            {d.audit.map((a) => (
              <div
                key={a.id}
                className="border-border grid grid-cols-[5rem_1fr] gap-3 border-b py-2 text-sm last:border-0"
              >
                <span className="tabular text-muted-foreground text-xs">
                  {a.at}
                </span>
                <span>
                  <span className="font-medium">{a.actor}</span>{" "}
                  <Badge
                    variant={ROLE_VARIANT[a.actorRole] ?? "muted"}
                    className="mx-1 capitalize"
                  >
                    {a.actorRole.replace(/_/g, " ")}
                  </Badge>
                  {a.action}{" "}
                  <span className="text-muted-foreground">— {a.subject}</span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
