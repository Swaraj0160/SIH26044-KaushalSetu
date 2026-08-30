"use client";

import { useState } from "react";

import { recordInterventionAction } from "@/app/institution-actions";
import type { HeatCellDetail, HeatmapRow } from "@/lib/data";
import { cn } from "@/lib/utils";

const CELL_BG: Record<string, string> = {
  strong: "var(--heat-strong)",
  moderate: "var(--heat-moderate)",
  critical: "var(--heat-critical)",
  na: "var(--muted)",
};

export function Heatmap({
  rows,
  skillNames,
  institutionId,
}: {
  rows: HeatmapRow[];
  skillNames: { id: string; name: string }[];
  institutionId: string;
}) {
  const [sel, setSel] = useState<{ dept: string; skill: string } | null>(null);
  const [detail, setDetail] = useState<HeatCellDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterDept, setFilterDept] = useState<string>("all");

  async function openCell(deptId: string, skillId: string) {
    setSel({ dept: deptId, skill: skillId });
    setLoading(true);
    setDetail(null);
    const res = await fetch(
      `/api/heatmap-cell?inst=${institutionId}&dept=${deptId}&skill=${skillId}`,
    );
    setDetail(await res.json());
    setLoading(false);
  }

  const shownRows =
    filterDept === "all"
      ? rows
      : rows.filter((r) => r.departmentId === filterDept);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">Filter:</span>
        <button
          onClick={() => setFilterDept("all")}
          className={cn(
            "rounded-full border px-2 py-0.5",
            filterDept === "all"
              ? "border-primary bg-primary-muted text-primary"
              : "border-border",
          )}
        >
          All departments
        </button>
        {rows.map((r) => (
          <button
            key={r.departmentId}
            onClick={() => setFilterDept(r.departmentId)}
            className={cn(
              "rounded-full border px-2 py-0.5",
              filterDept === r.departmentId
                ? "border-primary bg-primary-muted text-primary"
                : "border-border",
            )}
          >
            {r.department.split(" ")[0]}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="bg-background sticky left-0" />
              {skillNames.map((s) => (
                <th
                  key={s.id}
                  className="h-28 w-10 align-bottom"
                  title={s.name}
                >
                  <div className="text-muted-foreground mx-auto w-6 origin-bottom-left -rotate-45 text-xs whitespace-nowrap">
                    {s.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shownRows.map((row) => (
              <tr key={row.departmentId}>
                <td className="bg-background sticky left-0 z-10 pr-2 text-right text-xs font-medium whitespace-nowrap">
                  {row.department}
                </td>
                {row.cells.map((c) => {
                  const active =
                    sel?.dept === row.departmentId && sel?.skill === c.skillId;
                  return (
                    <td key={c.skillId}>
                      <button
                        onClick={() => openCell(row.departmentId, c.skillId)}
                        title={`${c.skill}: mean L${c.meanLevel}, ${c.withEvidence}/${c.students} with evidence`}
                        className={cn(
                          "size-8 rounded transition-transform hover:scale-110",
                          active && "ring-primary ring-2 ring-offset-1",
                        )}
                        style={{ background: CELL_BG[c.status] }}
                      >
                        <span className="text-[0.6rem] font-medium text-white/90">
                          {c.status === "na" ? "" : c.meanLevel.toFixed(1)}
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
        <Legend
          colour={CELL_BG.strong}
          label="Strong (mean ≥ L4.5, ≥50% coverage)"
        />
        <Legend colour={CELL_BG.moderate} label="Moderate" />
        <Legend colour={CELL_BG.critical} label="Critical" />
        <span>cell value = mean effective level · click to drill down</span>
      </div>

      {sel ? (
        <div className="border-border bg-card rounded-xl border p-4">
          {loading || !detail ? (
            <p className="text-muted-foreground text-sm">Loading cell…</p>
          ) : (
            <>
              <h3 className="text-sm font-semibold">
                {detail.department} × {detail.skill}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {detail.students.filter((s) => s.level > 0).length}/
                {detail.students.length} students have this skill · mean L
                {detail.meanLevel}
              </p>
              <div className="border-primary/25 bg-primary/5 mt-3 rounded-md border p-3 text-sm">
                <div className="text-primary font-medium">
                  Recommended institutional action
                </div>
                <p className="text-muted-foreground">
                  {detail.recommendedAction}
                </p>
                {sel ? (
                  <form
                    action={recordInterventionAction}
                    className="mt-3 flex flex-wrap items-center gap-2"
                  >
                    <input type="hidden" name="departmentId" value={sel.dept} />
                    <input
                      type="hidden"
                      name="departmentName"
                      value={detail.department}
                    />
                    <input type="hidden" name="skillId" value={sel.skill} />
                    <input
                      type="hidden"
                      name="skillName"
                      value={detail.skill}
                    />
                    <input
                      type="hidden"
                      name="action"
                      value={detail.recommendedAction}
                    />
                    <input
                      type="hidden"
                      name="cohortSize"
                      value={detail.students.length}
                    />
                    <input
                      name="owner"
                      defaultValue="Placement & Competency Cell"
                      className="border-input bg-background rounded-md border px-2 py-1 text-xs"
                    />
                    <button className="bg-primary text-primary-foreground rounded-md px-2.5 py-1 text-xs font-medium hover:opacity-90">
                      Record as intervention →
                    </button>
                  </form>
                ) : null}
              </div>
              <div className="mt-3 max-h-56 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground text-xs tracking-wide uppercase">
                    <tr>
                      <th className="py-1 text-left font-medium">Student</th>
                      <th className="py-1 text-left font-medium">
                        Target role
                      </th>
                      <th className="py-1 text-right font-medium">Level</th>
                      <th className="py-1 text-right font-medium">Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {detail.students.map((s) => (
                      <tr key={s.id}>
                        <td className="py-1">{s.name}</td>
                        <td className="text-muted-foreground py-1">
                          {s.targetRole}
                        </td>
                        <td className="tabular py-1 text-right">L{s.level}</td>
                        <td className="py-1 text-right">
                          {s.hasEvidence ? (
                            <span className="text-success">✓</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Legend({ colour, label }: { colour: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block size-3 rounded"
        style={{ background: colour }}
      />
      {label}
    </span>
  );
}
