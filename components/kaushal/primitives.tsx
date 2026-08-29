import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LEVEL_LABEL } from "@/lib/engines/config";
import type { EvidenceConfidence, ProficiencyLevel } from "@/lib/domain/types";

/** Synthetic-data disclosure strip. Used app-wide so nothing is mistaken as real. */
export function DemoBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border-accent/30 bg-accent-muted/60 text-accent-foreground flex items-center gap-2 border-b px-4 py-1.5 text-xs",
        className,
      )}
    >
      <span className="bg-accent inline-block size-1.5 rounded-full" />
      <span>
        <strong className="font-semibold">Demo / synthetic data.</strong> All
        people, employers and numbers are generated for demonstration. No real
        or government data is used.
      </span>
    </div>
  );
}

const CONF_LABEL: Record<EvidenceConfidence, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  verified: "Verified",
};

export function ConfidenceDot({
  confidence,
}: {
  confidence: EvidenceConfidence;
}) {
  return (
    <span
      className="inline-block size-2 rounded-full"
      style={{ background: `var(--confidence-${confidence})` }}
      aria-hidden
    />
  );
}

export function EvidenceBadge({
  confidence,
  rationale,
  className,
}: {
  confidence: EvidenceConfidence;
  rationale?: string[];
  className?: string;
}) {
  const pill = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        className,
      )}
      style={{
        borderColor: `color-mix(in oklab, var(--confidence-${confidence}) 40%, transparent)`,
        background: `color-mix(in oklab, var(--confidence-${confidence}) 12%, transparent)`,
        color: `var(--confidence-${confidence})`,
      }}
    >
      <ConfidenceDot confidence={confidence} />
      {CONF_LABEL[confidence]} evidence
    </span>
  );
  if (!rationale?.length) return pill;
  return (
    <details className="group relative inline-block">
      <summary className="cursor-help list-none [&::-webkit-details-marker]:hidden">
        {pill}
      </summary>
      <div className="border-border bg-popover absolute top-full left-0 z-20 mt-1 w-60 rounded-lg border p-3 text-xs shadow-lg">
        <div className="mb-1 font-medium">Why this confidence</div>
        <ul className="text-muted-foreground space-y-0.5">
          {rationale.map((r, i) => (
            <li key={i}>• {r}</li>
          ))}
        </ul>
      </div>
    </details>
  );
}

export function LevelPip({ level }: { level: number }) {
  const l = Math.round(level);
  return (
    <span
      className="inline-flex items-center gap-1"
      title={`Level ${l} — ${LEVEL_LABEL[Math.min(8, Math.max(1, l)) as ProficiencyLevel]}`}
    >
      <span className="flex gap-0.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-3 w-1 rounded-sm",
              i < l ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </span>
      <span className="tabular text-muted-foreground text-xs">L{l}</span>
    </span>
  );
}

export function SkillChip({
  name,
  level,
  confidence,
  className,
}: {
  name: string;
  level?: number;
  confidence?: EvidenceConfidence;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "border-border bg-card inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs",
        className,
      )}
    >
      {confidence ? <ConfidenceDot confidence={confidence} /> : null}
      <span className="font-medium">{name}</span>
      {level != null ? (
        <span className="tabular text-muted-foreground">
          L{Math.round(level)}
        </span>
      ) : null}
    </span>
  );
}

const MATCH_BAND_STYLE: Record<string, string> = {
  strong: "var(--heat-strong)",
  promising: "var(--confidence-high)",
  stretch: "var(--warning)",
  low: "var(--muted-foreground)",
};

/** Circular match gauge. */
export function MatchScore({
  score,
  band,
  size = 72,
  label = "match",
}: {
  score: number;
  band: string;
  size?: number;
  label?: string;
}) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const colour = MATCH_BAND_STYLE[band] ?? "var(--primary)";
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${score}% ${label}, ${band}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={5}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colour}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular text-base leading-none font-semibold">
          {score}
        </span>
        <span className="text-muted-foreground text-[0.6rem] tracking-wide uppercase">
          {label}
        </span>
      </div>
    </div>
  );
}

export function BandLabel({ band }: { band: string }) {
  const map: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
    strong: "success",
    placement_ready: "success",
    promising: "info",
    near_ready: "info",
    stretch: "warning",
    developing: "warning",
    low: "muted",
    early: "muted",
  };
  return (
    <Badge variant={map[band] ?? "muted"} className="capitalize">
      {band.replace(/_/g, " ")}
    </Badge>
  );
}
