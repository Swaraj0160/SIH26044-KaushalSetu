"use client";

import { useMemo, useState } from "react";

import { MatchScore } from "@/components/kaushal/primitives";
import { Button } from "@/components/ui/button";

export interface TunerFactor {
  key: string;
  label: string;
  value: number; // 0..1, fixed (from the engine for the sample)
  defaultWeight: number;
}

function band(score: number) {
  if (score >= 80) return "strong";
  if (score >= 65) return "promising";
  if (score >= 45) return "stretch";
  return "low";
}

export function MatchWeightTuner({
  factors,
  sampleLabel,
}: {
  factors: TunerFactor[];
  sampleLabel: string;
}) {
  const [weights, setWeights] = useState<Record<string, number>>(
    Object.fromEntries(factors.map((f) => [f.key, f.defaultWeight])),
  );

  const sum = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  const norm = Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, v / sum]),
  );
  const score = useMemo(
    () =>
      Math.round(factors.reduce((s, f) => s + f.value * norm[f.key], 0) * 100),
    [factors, norm],
  );
  const baseScore = Math.round(
    factors.reduce((s, f) => s + f.value * f.defaultWeight, 0) * 100,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <MatchScore score={score} band={band(score)} size={84} />
        <div className="text-sm">
          <div className="font-medium">{sampleLabel}</div>
          <div className="text-muted-foreground">
            Default weights → {baseScore}. Live recompute with your weights →{" "}
            <span className="text-foreground font-medium">{score}</span>.
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {factors.map((f) => (
          <div key={f.key} className="text-sm">
            <div className="flex items-center justify-between">
              <span>
                {f.label}{" "}
                <span className="text-muted-foreground text-xs">
                  (sample value {Math.round(f.value * 100)}%)
                </span>
              </span>
              <span className="tabular">{Math.round(norm[f.key] * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={Math.round(weights[f.key] * 100)}
              onChange={(e) =>
                setWeights((w) => ({
                  ...w,
                  [f.key]: Number(e.target.value) / 100,
                }))
              }
              className="mt-1 w-full accent-[var(--primary)]"
            />
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          setWeights(
            Object.fromEntries(factors.map((f) => [f.key, f.defaultWeight])),
          )
        }
      >
        Reset to production defaults
      </Button>
      <p className="text-muted-foreground text-xs">
        Weights are normalised to sum to 1. In production these live in a
        settings table per deployment; the algorithm is unchanged.
      </p>
    </div>
  );
}
