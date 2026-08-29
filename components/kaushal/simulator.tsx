"use client";

import { useState } from "react";

import { BandLabel, MatchScore } from "@/components/kaushal/primitives";
import { Progress } from "@/components/ui/progress";
import type { RoleFit } from "@/lib/data";
import { cn } from "@/lib/utils";

export function CareerSimulator({
  fits,
  targetRoleId,
}: {
  fits: RoleFit[];
  targetRoleId: string;
}) {
  const ranked = [...fits].sort((a, b) => b.match.score - a.match.score);
  const [selected, setSelected] = useState<string[]>(() => {
    const top = ranked.slice(0, 2).map((f) => f.role.id);
    return [...new Set([targetRoleId, ...top])].slice(0, 3);
  });

  const toggle = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id].slice(-3),
    );

  const shown = fits.filter((f) => selected.includes(f.role.id));

  return (
    <div className="space-y-6">
      <div>
        <div className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
          Roles you are closest to
        </div>
        <div className="flex flex-wrap gap-2">
          {ranked.map((f) => {
            const on = selected.includes(f.role.id);
            return (
              <button
                key={f.role.id}
                onClick={() => toggle(f.role.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  on
                    ? "border-primary bg-primary-muted text-primary"
                    : "border-border hover:bg-muted",
                )}
              >
                {f.role.title}
                <span className="tabular text-muted-foreground ml-1.5 text-xs">
                  {f.match.score}%
                </span>
                {f.role.id === targetRoleId ? (
                  <span className="text-accent-foreground ml-1">★</span>
                ) : null}
              </button>
            );
          })}
        </div>
        <p className="text-muted-foreground mt-1.5 text-xs">
          ★ = declared target. Select up to 3 to compare side by side.
        </p>
      </div>

      <div
        className={cn(
          "grid gap-4",
          shown.length >= 3
            ? "lg:grid-cols-3"
            : shown.length === 2
              ? "sm:grid-cols-2"
              : "",
        )}
      >
        {shown.map((f) => (
          <div
            key={f.role.id}
            className="border-border bg-card rounded-xl border p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="leading-tight font-medium">{f.role.title}</div>
                <div className="text-muted-foreground text-xs">
                  {f.role.family}
                </div>
              </div>
              <MatchScore score={f.match.score} band={f.match.band} size={56} />
            </div>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Readiness</span>
                <span className="tabular">{f.readiness.score}/100</span>
              </div>
              <Progress value={f.readiness.score} className="h-1.5" />
              <BandLabel band={f.readiness.band} />
            </div>

            <div className="mt-3">
              <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Mandatory competencies
              </div>
              <ul className="mt-1 space-y-1 text-sm">
                {f.match.competencies
                  .filter((c) => c.mandatory)
                  .map((c) => (
                    <li
                      key={c.competencyId}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{c.name}</span>
                      <span
                        className={cn(
                          "tabular text-xs",
                          c.met ? "text-success" : "text-destructive",
                        )}
                      >
                        {c.have.toFixed(1)}/{c.required} {c.met ? "✓" : "✗"}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="mt-3">
              <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Gaps ({f.gap.gaps.filter((g) => g.gap > 0).length}) · ~
                {f.gap.totalWeeks}w plan
              </div>
              <ul className="mt-1 space-y-0.5 text-sm">
                {f.gap.gaps
                  .filter((g) => g.gap > 0)
                  .slice(0, 4)
                  .map((g) => (
                    <li
                      key={g.skillId}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{g.name}</span>
                      <span className="tabular text-muted-foreground text-xs">
                        L{g.current}→L{g.required}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="bg-muted/50 text-muted-foreground mt-3 rounded-md p-2 text-xs">
              Projected: closing the top{" "}
              {Math.min(3, f.gap.gaps.filter((g) => g.gap > 0).length)} gaps
              lifts this from {f.match.band} toward{" "}
              {f.match.score >= 65 ? "strong" : "promising"}.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
