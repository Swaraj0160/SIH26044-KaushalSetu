"use client";

import { useMemo, useState } from "react";

import type { GraphData } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Radial competency map: centre = student, inner ring = competencies (radius ∝
 * level, fill ∝ evidence, outline = required-and-met), outer ring = constituent
 * skills. Hover a node to isolate its neighbourhood. Not a decorative diagram —
 * every position and colour encodes real engine output.
 */
export function CompetencyGraph({ data }: { data: GraphData }) {
  const W = 640;
  const H = 520;
  const cx = W / 2;
  const cy = H / 2;
  const [hover, setHover] = useState<string | null>(null);

  const layout = useMemo(() => {
    const comps = data.competencies.slice(0, 10);
    const compAngle = (i: number) =>
      (i / comps.length) * Math.PI * 2 - Math.PI / 2;
    const compR = 150;
    const compPos = new Map(
      comps.map((c, i) => [
        c.id,
        {
          x: cx + Math.cos(compAngle(i)) * compR,
          y: cy + Math.sin(compAngle(i)) * compR,
        },
      ]),
    );

    // place each skill near the average of its competencies, pushed outward
    const skills = data.skills.slice(0, 26).map((s) => {
      const owners = s.competencyIds
        .map((id) => compPos.get(id))
        .filter(Boolean) as {
        x: number;
        y: number;
      }[];
      const base = owners.length
        ? {
            x: owners.reduce((a, o) => a + o.x, 0) / owners.length,
            y: owners.reduce((a, o) => a + o.y, 0) / owners.length,
          }
        : { x: cx, y: cy };
      const ang = Math.atan2(base.y - cy, base.x - cx);
      const r = 250;
      return {
        ...s,
        x: cx + Math.cos(ang) * r + (hashJitter(s.id) - 0.5) * 60,
        y: cy + Math.sin(ang) * r + (hashJitter(s.id + "y") - 0.5) * 50,
      };
    });

    return { comps, compPos, skills };
  }, [data, cx, cy]);

  const dim = (id: string, kind: "comp" | "skill", ownerIds: string[] = []) => {
    if (!hover) return false;
    if (hover === id) return false;
    if (kind === "skill" && ownerIds.includes(hover)) return false;
    if (kind === "comp") {
      const hoveredSkill = data.skills.find((s) => s.id === hover);
      if (hoveredSkill?.competencyIds.includes(id)) return false;
    }
    return true;
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto w-full max-w-[640px]"
        role="img"
        aria-label={`Competency map for ${data.student.name} targeting ${data.student.targetRole}`}
      >
        {/* links */}
        {layout.skills.map((s) =>
          s.competencyIds.map((cid) => {
            const p = layout.compPos.get(cid);
            if (!p) return null;
            return (
              <line
                key={`${s.id}-${cid}`}
                x1={p.x}
                y1={p.y}
                x2={s.x}
                y2={s.y}
                stroke="var(--border)"
                strokeWidth={1}
                opacity={
                  dim(s.id, "skill", s.competencyIds) || dim(cid, "comp")
                    ? 0.15
                    : 0.6
                }
              />
            );
          }),
        )}
        {layout.comps.map((c) => {
          const p = layout.compPos.get(c.id)!;
          return (
            <line
              key={`c-${c.id}`}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="var(--border)"
              strokeWidth={1.5}
              opacity={dim(c.id, "comp") ? 0.15 : 0.7}
            />
          );
        })}

        {/* centre */}
        <circle cx={cx} cy={cy} r={26} fill="var(--primary)" />
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          className="fill-[var(--primary-foreground)] text-[10px] font-semibold"
        >
          {initials(data.student.name)}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          className="fill-[var(--primary-foreground)] text-[7px]"
        >
          target
        </text>

        {/* competency nodes */}
        {layout.comps.map((c) => {
          const p = layout.compPos.get(c.id)!;
          const r = 10 + c.level * 2.6;
          return (
            <g
              key={c.id}
              onMouseEnter={() => setHover(c.id)}
              onMouseLeave={() => setHover(null)}
              opacity={dim(c.id, "comp") ? 0.25 : 1}
              className="cursor-pointer"
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={`color-mix(in oklab, var(--primary) ${20 + c.evidence * 65}%, var(--card))`}
                stroke={
                  c.inTarget
                    ? c.met
                      ? "var(--heat-strong)"
                      : "var(--warning)"
                    : "var(--border)"
                }
                strokeWidth={c.inTarget ? 2.5 : 1.5}
              />
              <text
                x={p.x}
                y={p.y - r - 5}
                textAnchor="middle"
                className="fill-[var(--foreground)] text-[9px] font-medium"
              >
                {truncate(c.name, 22)}
              </text>
              <text
                x={p.x}
                y={p.y + 3}
                textAnchor="middle"
                className="tabular fill-[var(--foreground)] text-[8px]"
              >
                L{c.level.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* skill nodes */}
        {layout.skills.map((s) => (
          <g
            key={s.id}
            onMouseEnter={() => setHover(s.id)}
            onMouseLeave={() => setHover(null)}
            opacity={dim(s.id, "skill", s.competencyIds) ? 0.2 : 1}
            className="cursor-pointer"
          >
            <circle
              cx={s.x}
              cy={s.y}
              r={s.inProfile ? 4.5 + s.level * 0.9 : 3}
              fill={
                s.inProfile
                  ? `var(--confidence-${s.confidence})`
                  : "var(--muted)"
              }
              stroke="var(--card)"
              strokeWidth={1}
            />
            {(hover === s.id || s.level >= 5) && (
              <text
                x={s.x}
                y={s.y - 9}
                textAnchor="middle"
                className="fill-[var(--muted-foreground)] text-[7.5px]"
              >
                {truncate(s.name, 18)}
              </text>
            )}
          </g>
        ))}
      </svg>

      <div className="text-muted-foreground mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
        <Legend swatch="var(--heat-strong)" label="required & met" ring />
        <Legend swatch="var(--warning)" label="required, gap" ring />
        <Legend swatch="var(--confidence-verified)" label="verified skill" />
        <Legend swatch="var(--confidence-low)" label="low-evidence skill" />
        <span>node size ∝ level · fill ∝ evidence</span>
      </div>
    </div>
  );
}

function Legend({
  swatch,
  label,
  ring,
}: {
  swatch: string;
  label: string;
  ring?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-block size-2.5 rounded-full",
          ring && "bg-transparent",
        )}
        style={
          ring ? { border: `2px solid ${swatch}` } : { background: swatch }
        }
      />
      {label}
    </span>
  );
}

function initials(name: string): string {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
function hashJitter(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (Math.abs(h) % 1000) / 1000;
}
