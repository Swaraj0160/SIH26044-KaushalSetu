import { OpportunityCard } from "@/components/kaushal/opportunity-card";
import { PageHeader } from "@/components/kaushal/page-header";
import { rankOpportunitiesForStudent } from "@/lib/data";
import { appliedOpportunityIds } from "@/lib/applied";
import { currentStudentId } from "@/lib/guards";

export default async function OpportunitiesPage() {
  const sid = await currentStudentId();
  const ranked = rankOpportunitiesForStudent(sid);
  const applied = new Set(await appliedOpportunityIds());

  const withApplied = ranked.map((r) =>
    r.applied || !applied.has(r.opportunity.id)
      ? r
      : {
          ...r,
          applied: {
            id: `local-${r.opportunity.id}`,
            opportunityId: r.opportunity.id,
            studentId: sid,
            status: "submitted" as const,
            appliedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            matchAtApply: r.match.score,
          },
        },
  );

  const strong = withApplied.filter((r) => r.match.score >= 65);
  const rest = withApplied.filter((r) => r.match.score < 65);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunities — ranked for you"
        description="Ranked by the same explainable match engine a recruiter sees. Open any card for the full per-factor breakdown and a 'how to become ready' list."
      />

      <section>
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
          Strong & promising ({strong.length})
        </h2>
        <div className="grid gap-3">
          {strong.map((r) => (
            <OpportunityCard
              key={r.opportunity.id}
              item={r}
              href={`/student/opportunities/${r.opportunity.id}`}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wide uppercase">
          Stretch & developing ({rest.length})
        </h2>
        <div className="grid gap-3">
          {rest.slice(0, 12).map((r) => (
            <OpportunityCard
              key={r.opportunity.id}
              item={r}
              href={`/student/opportunities/${r.opportunity.id}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
