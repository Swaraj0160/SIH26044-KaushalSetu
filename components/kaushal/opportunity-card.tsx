import Link from "next/link";

import { MatchScore } from "@/components/kaushal/primitives";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { RankedOpportunity } from "@/lib/data";

const TYPE_LABEL: Record<string, string> = {
  internship: "Internship",
  job: "Job",
  apprenticeship: "Apprenticeship",
  live_project: "Live project",
  mentorship: "Mentorship",
};

function daysLeft(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

export function OpportunityCard({
  item,
  href,
}: {
  item: RankedOpportunity;
  href: string;
}) {
  const { opportunity: o, role, employerName, match } = item;
  const dl = daysLeft(o.deadline);
  return (
    <Card className="p-4 transition-shadow hover:shadow-md">
      <div className="flex gap-4">
        <MatchScore score={match.score} band={match.band} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={href} className="font-medium hover:underline">
                {role.title}
              </Link>
              <div className="text-muted-foreground text-sm">
                {employerName} · {o.city} · {o.mode}
              </div>
            </div>
            <Badge variant="outline">{TYPE_LABEL[o.type]}</Badge>
          </div>

          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {o.stipendPerMonth ? (
              <span>₹{o.stipendPerMonth.toLocaleString("en-IN")}/mo</span>
            ) : null}
            {o.salaryLpa ? <span>₹{o.salaryLpa} LPA</span> : null}
            {o.durationMonths ? <span>{o.durationMonths} months</span> : null}
            <span className={dl <= 5 ? "text-destructive" : ""}>
              {dl > 0 ? `${dl} days left` : "closed"}
            </span>
            <span>
              {o.openings} opening{o.openings > 1 ? "s" : ""}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">
              {match.mandatoryMet}/{match.mandatoryTotal} mandatory competencies
              · {match.evidenceConfidencePct}% evidence
            </span>
            {match.missing.length ? (
              <span className="text-destructive">
                missing:{" "}
                {match.missing
                  .slice(0, 2)
                  .map((m) => m.name)
                  .join(", ")}
                {match.missing.length > 2
                  ? ` +${match.missing.length - 2}`
                  : ""}
              </span>
            ) : (
              <span className="text-success">no critical gaps</span>
            )}
            {item.applied ? (
              <Badge variant="info" className="capitalize">
                {item.applied.status.replace(/_/g, " ")}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
