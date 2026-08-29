import { Fragment } from "react";

import { MatchScore } from "@/components/kaushal/primitives";
import { Progress } from "@/components/ui/progress";
import type { MatchResult } from "@/lib/engines";

/** The explainable factor breakdown — the "not a black box" view. */
export function MatchBreakdown({ match }: { match: MatchResult }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <MatchScore score={match.score} band={match.band} size={84} />
        <div className="text-sm">
          <div className="font-medium capitalize">{match.band} match</div>
          <div className="text-muted-foreground">
            {match.mandatoryMet}/{match.mandatoryTotal} mandatory competencies ·{" "}
            {match.preferredMet}/{match.preferredTotal} preferred ·{" "}
            {match.evidenceConfidencePct}% evidence confidence
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {match.factors.map((f) => (
          <div
            key={f.key}
            className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{f.label}</span>
              <span className="text-muted-foreground text-xs">
                weight {Math.round(f.weight * 100)}%
              </span>
            </div>
            <span className="tabular font-medium">
              {Math.round(f.value * 100)}%
            </span>
            <div className="col-span-2">
              <Progress value={f.value * 100} className="h-1.5" />
              <p className="text-muted-foreground mt-0.5 text-xs">{f.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {match.strengths.length || match.missing.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {match.strengths.length ? (
            <div className="border-border bg-muted/40 rounded-lg border p-3">
              <div className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
                Strong
              </div>
              <div className="flex flex-wrap gap-1.5">
                {match.strengths.map((s) => (
                  <span
                    key={s}
                    className="bg-success/12 text-success rounded px-1.5 py-0.5 text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {match.missing.length ? (
            <div className="border-border bg-muted/40 rounded-lg border p-3">
              <div className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
                Missing / weak
              </div>
              <div className="flex flex-wrap gap-1.5">
                {match.missing.map((m) => (
                  <span
                    key={m.skillId}
                    className="bg-destructive/12 text-destructive rounded px-1.5 py-0.5 text-xs"
                    title={
                      m.reason === "not_present"
                        ? "Not in profile"
                        : m.reason === "below_level"
                          ? `Have L${m.have}, need L${m.required}`
                          : "Present but weak evidence"
                    }
                  >
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {match.actions.length ? (
        <div>
          <div className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
            How to become ready
          </div>
          <ol className="space-y-1 text-sm">
            {match.actions.map((a, i) => (
              <li key={i} className="flex gap-2">
                <span className="tabular text-muted-foreground">{i + 1}.</span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}

/** Compact per-competency requirement table. */
export function CompetencyChecklist({ match }: { match: MatchResult }) {
  return (
    <div className="border-border overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-muted-foreground text-xs tracking-wide uppercase">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Competency</th>
            <th className="px-3 py-2 text-left font-medium">Type</th>
            <th className="px-3 py-2 text-right font-medium">Required</th>
            <th className="px-3 py-2 text-right font-medium">Have</th>
            <th className="px-3 py-2 text-center font-medium">Met</th>
          </tr>
        </thead>
        <tbody>
          {match.competencies.map((c) => (
            <Fragment key={c.competencyId}>
              <tr className="border-border border-t">
                <td className="px-3 py-2 font-medium">{c.name}</td>
                <td className="text-muted-foreground px-3 py-2">
                  {c.mandatory ? "Mandatory" : "Preferred"}
                </td>
                <td className="tabular px-3 py-2 text-right">L{c.required}</td>
                <td className="tabular px-3 py-2 text-right">
                  {c.have.toFixed(1)}
                </td>
                <td className="px-3 py-2 text-center">
                  {c.met ? (
                    <span className="text-success">✓</span>
                  ) : (
                    <span className="text-destructive">✗</span>
                  )}
                </td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
