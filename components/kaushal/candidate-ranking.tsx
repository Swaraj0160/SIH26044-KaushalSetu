"use client";

import { useState } from "react";

import { setOverrideAction } from "@/app/actions";
import { MatchBreakdown } from "@/components/kaushal/match-breakdown";
import { MatchScore } from "@/components/kaushal/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MatchResult } from "@/lib/engines";
import { cn } from "@/lib/utils";

export interface CandidateVM {
  id: string;
  name: string;
  programme: string;
  institution: string;
  headline: string;
  experienceMonths: number;
  applicationStatus?: string;
  match: MatchResult;
}

const STAGE_ACTIONS = [
  ["shortlisted", "Shortlist"],
  ["interview", "Invite to interview"],
  ["offer", "Make an offer"],
] as const;

function CandidateActions({
  oppId,
  studentId,
  current,
}: {
  oppId: string;
  studentId: string;
  current?: string;
}) {
  return (
    <div className="bg-muted/50 mt-3 flex flex-wrap items-center gap-2 rounded-lg p-2.5">
      <span className="text-muted-foreground text-xs">Move to:</span>
      {STAGE_ACTIONS.map(([value, label]) => (
        <form key={value} action={setOverrideAction}>
          <input type="hidden" name="key" value={`app:${oppId}:${studentId}`} />
          <input type="hidden" name="value" value={value} />
          <input type="hidden" name="revalidate" value="/recruiter" />
          <button
            disabled={current === value}
            className="border-border bg-card hover:bg-primary-muted hover:text-primary rounded-md border px-2.5 py-1 text-xs font-medium disabled:opacity-40"
          >
            {label}
          </button>
        </form>
      ))}
      {current ? (
        <Badge variant="info" className="ml-auto capitalize">
          now: {current.replace(/_/g, " ")}
        </Badge>
      ) : null}
    </div>
  );
}

export function CandidateRanking({
  candidates,
  oppId,
}: {
  candidates: CandidateVM[];
  oppId: string;
}) {
  const [open, setOpen] = useState<string | null>(candidates[0]?.id ?? null);
  const [compare, setCompare] = useState<[string, string] | null>(null);

  const a = compare ? candidates.find((c) => c.id === compare[0]) : null;
  const b = compare ? candidates.find((c) => c.id === compare[1]) : null;

  return (
    <div className="space-y-3">
      {compare && a && b ? (
        <ComparePanel a={a} b={b} onClose={() => setCompare(null)} />
      ) : null}

      {candidates.map((c, i) => {
        const isOpen = open === c.id;
        return (
          <div key={c.id} className="border-border bg-card rounded-xl border">
            <button
              onClick={() => setOpen(isOpen ? null : c.id)}
              className="flex w-full items-center gap-3 p-3 text-left"
            >
              <span className="tabular text-muted-foreground w-5 text-center text-sm font-semibold">
                {i + 1}
              </span>
              <MatchScore score={c.match.score} band={c.match.band} size={52} />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{c.name}</div>
                <div className="text-muted-foreground truncate text-xs">
                  {c.programme} · {c.institution} · {c.experienceMonths} mo
                  experience
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                  <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                    {c.match.mandatoryMet}/{c.match.mandatoryTotal} mandatory
                  </span>
                  <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                    {c.match.evidenceConfidencePct}% evidence
                  </span>
                  {c.match.missing.slice(0, 2).map((m) => (
                    <span
                      key={m.skillId}
                      className="bg-destructive/12 text-destructive rounded px-1.5 py-0.5"
                    >
                      −{m.name}
                    </span>
                  ))}
                  {c.applicationStatus ? (
                    <span className="bg-info/12 text-info rounded px-1.5 py-0.5 capitalize">
                      {c.applicationStatus.replace(/_/g, " ")}
                    </span>
                  ) : null}
                </div>
              </div>
              <span className="text-muted-foreground text-xs">
                {isOpen ? "−" : "+"}
              </span>
            </button>

            {isOpen ? (
              <div className="border-border border-t p-4">
                <MatchBreakdown match={c.match} />
                <CandidateActions
                  oppId={oppId}
                  studentId={c.id}
                  current={c.applicationStatus}
                />
                <div className="mt-3 flex gap-2">
                  {candidates
                    .filter((x) => x.id !== c.id)
                    .slice(0, 3)
                    .map((x) => (
                      <Button
                        key={x.id}
                        size="sm"
                        variant="outline"
                        onClick={() => setCompare([c.id, x.id])}
                      >
                        Explain vs {x.name.split(" ")[0]}
                      </Button>
                    ))}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ComparePanel({
  a,
  b,
  onClose,
}: {
  a: CandidateVM;
  b: CandidateVM;
  onClose: () => void;
}) {
  const rows = a.match.factors.map((fa) => {
    const fb = b.match.factors.find((x) => x.key === fa.key)!;
    const deltaContribution = (fa.value - fb.value) * fa.weight * 100;
    return {
      label: fa.label,
      a: fa.value,
      b: fb.value,
      weight: fa.weight,
      deltaContribution,
    };
  });
  const leader = a.match.score >= b.match.score ? a : b;
  const trailer = leader === a ? b : a;
  const drivers = [...rows]
    .sort(
      (x, y) => Math.abs(y.deltaContribution) - Math.abs(x.deltaContribution),
    )
    .slice(0, 3);

  return (
    <div className="border-primary/40 bg-primary/5 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Why {leader.name.split(" ")[0]} ({leader.match.score}) ranks above{" "}
          {trailer.name.split(" ")[0]} ({trailer.match.score})
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          close
        </button>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        The {Math.abs(leader.match.score - trailer.match.score)}-point gap is
        driven mainly by:{" "}
        {drivers
          .map(
            (d) =>
              `${d.label} (${d.deltaContribution > 0 ? "+" : ""}${d.deltaContribution.toFixed(1)} pts to ${
                d.deltaContribution > 0
                  ? a.name.split(" ")[0]
                  : b.name.split(" ")[0]
              })`,
          )
          .join("; ")}
        .
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead className="text-muted-foreground text-xs tracking-wide uppercase">
            <tr>
              <th className="py-1 text-left font-medium">Factor</th>
              <th className="py-1 text-right font-medium">
                {a.name.split(" ")[0]}
              </th>
              <th className="py-1 text-right font-medium">
                {b.name.split(" ")[0]}
              </th>
              <th className="py-1 text-right font-medium">Δ contribution</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="py-1.5">{r.label}</td>
                <td className="tabular py-1.5 text-right">
                  {Math.round(r.a * 100)}%
                </td>
                <td className="tabular py-1.5 text-right">
                  {Math.round(r.b * 100)}%
                </td>
                <td
                  className={cn(
                    "tabular py-1.5 text-right",
                    r.deltaContribution > 0
                      ? "text-success"
                      : r.deltaContribution < 0
                        ? "text-destructive"
                        : "text-muted-foreground",
                  )}
                >
                  {r.deltaContribution > 0 ? "+" : ""}
                  {r.deltaContribution.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
