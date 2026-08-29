import Link from "next/link";

import { PageHeader } from "@/components/kaushal/page-header";
import { MatchScore } from "@/components/kaushal/primitives";
import { Card, CardContent } from "@/components/ui/card";
import { rankStudentsForRole } from "@/lib/data";
import { getDataset } from "@/lib/demo/dataset";
import { requireRole } from "@/lib/guards";
import { personaEmployerId } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function TalentSearch({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const persona = await requireRole("recruiter");
  const employerId = personaEmployerId(persona);
  const d = getDataset();
  const sp = await searchParams;
  const employerRoleIds = [
    ...new Set(
      d.opportunities
        .filter((o) => o.employerId === employerId)
        .map((o) => o.roleId),
    ),
  ];
  const roleId =
    typeof sp.role === "string" && d.roleById.has(sp.role)
      ? sp.role
      : (employerRoleIds[0] ?? d.roles[0].id);
  const ranked = rankStudentsForRole(roleId, 25);
  const role = d.roleById.get(roleId)!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Talent search"
        description="Search the whole student pool by competency fit for a role — evidence-weighted, explainable, not keyword-matched."
      />

      <div className="flex flex-wrap gap-2">
        {d.roles.map((r) => (
          <Link
            key={r.id}
            href={`/recruiter/talent?role=${r.id}`}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              r.id === roleId
                ? "border-primary bg-primary-muted text-primary"
                : "border-border hover:bg-muted",
            )}
          >
            {r.title}
            {employerRoleIds.includes(r.id) ? (
              <span className="text-accent-foreground ml-1">•</span>
            ) : null}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-2 pt-5">
          <p className="text-muted-foreground text-sm">
            {ranked.length} students ranked for <strong>{role.title}</strong> ·{" "}
            <span className="text-accent-foreground">•</span> = your team hires
            for this role
          </p>
          {ranked.map((c, i) => (
            <div
              key={c.student.id}
              className="border-border flex items-center gap-3 rounded-lg border p-3"
            >
              <span className="tabular text-muted-foreground w-5 text-center text-sm font-semibold">
                {i + 1}
              </span>
              <MatchScore score={c.match.score} band={c.match.band} size={48} />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{c.student.name}</div>
                <div className="text-muted-foreground truncate text-xs">
                  {c.student.programme} · {c.institutionName} ·{" "}
                  {c.match.mandatoryMet}/{c.match.mandatoryTotal} mandatory ·{" "}
                  {c.match.evidenceConfidencePct}% evidence ·{" "}
                  {c.experienceMonths} mo exp
                </div>
              </div>
              {c.match.missing.length ? (
                <span className="text-destructive hidden text-xs sm:block">
                  −
                  {c.match.missing
                    .slice(0, 2)
                    .map((m) => m.name)
                    .join(", ")}
                </span>
              ) : (
                <span className="text-success hidden text-xs sm:block">
                  no critical gaps
                </span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
