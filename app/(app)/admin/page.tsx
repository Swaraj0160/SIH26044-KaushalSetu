import Link from "next/link";

import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/misc";
import { getDataset } from "@/lib/demo/dataset";
import { requireRole } from "@/lib/guards";
import { getOverrides } from "@/lib/overrides";

export default async function AdminOverview() {
  await requireRole("super_admin");
  const d = getDataset();
  const overrides = await getOverrides();
  const pendingEmployers = d.employers.filter(
    (e) => !e.verified && overrides[`employer:${e.id}`] !== "verified",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Administration"
        description="Governance for KaushalSetu: taxonomy, employer verification, matching configuration, audit."
        actions={<Badge variant="accent">Demo persona</Badge>}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <Stat label="Institutions" value={d.institutions.length} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat
              label="Employers"
              value={d.employers.length}
              hint={`${pendingEmployers.length} pending verification`}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat label="Students" value={d.students.length} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <Stat label="Credentials issued" value={d.credentials.length} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Employer verification queue</CardTitle>
            <Link
              href="/admin/employers"
              className="text-primary text-xs hover:underline"
            >
              Manage →
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingEmployers.slice(0, 6).map((e) => (
              <div
                key={e.id}
                className="border-border flex items-center justify-between rounded-lg border p-2.5 text-sm"
              >
                <span>
                  {e.name}{" "}
                  <span className="text-muted-foreground">· {e.sector}</span>
                </span>
                <Badge variant="warning">pending</Badge>
              </div>
            ))}
            {!pendingEmployers.length ? (
              <p className="text-muted-foreground text-sm">
                All employers verified.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent audit events</CardTitle>
            <Link
              href="/admin/audit"
              className="text-primary text-xs hover:underline"
            >
              Full log →
            </Link>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            {d.audit.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-start gap-2">
                <span className="tabular text-muted-foreground text-xs">
                  {a.at}
                </span>
                <span>
                  <span className="font-medium">{a.actor}</span> — {a.action}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Link
          href="/admin/taxonomy"
          className="border-border bg-card hover:border-primary/50 rounded-xl border p-4"
        >
          <div className="font-medium">Skill & Role Taxonomy</div>
          <p className="text-muted-foreground mt-1 text-sm">
            {d.skills.length} skills · {d.competencies.length} competencies ·{" "}
            {d.roles.length} roles
          </p>
        </Link>
        <Link
          href="/admin/matching"
          className="border-border bg-card hover:border-primary/50 rounded-xl border p-4"
        >
          <div className="font-medium">Matching Config</div>
          <p className="text-muted-foreground mt-1 text-sm">
            Tune factor weights and see a live recompute
          </p>
        </Link>
        <Link
          href="/admin/audit"
          className="border-border bg-card hover:border-primary/50 rounded-xl border p-4"
        >
          <div className="font-medium">Audit Log</div>
          <p className="text-muted-foreground mt-1 text-sm">
            {d.audit.length} events
          </p>
        </Link>
      </div>
    </div>
  );
}
