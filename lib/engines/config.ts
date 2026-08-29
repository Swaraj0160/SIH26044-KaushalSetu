/**
 * Tunable constants for the deterministic engines.
 *
 * Everything the matching / readiness / evidence logic depends on lives here so
 * it can be reviewed, unit-tested, and (in production) moved to a DB-backed
 * settings table without touching the algorithms.
 */

import type { EvidenceKind, ProficiencyLevel } from "@/lib/domain/types";

/** Match score factor weights. Must sum to 1. */
export const MATCH_WEIGHTS = {
  mandatoryCompetencyCoverage: 0.4,
  skillProficiency: 0.2,
  evidenceConfidence: 0.15,
  experience: 0.1,
  educationEligibility: 0.05,
  careerInterest: 0.05,
  assessmentSignal: 0.05,
} as const;

/** Readiness score factor weights. Must sum to 1. */
export const READINESS_WEIGHTS = {
  competencyCoverage: 0.3,
  skillProficiency: 0.2,
  assessment: 0.18,
  evidence: 0.12,
  projects: 0.1,
  experience: 0.1,
} as const;

/**
 * Evidence weight per kind. Higher = harder to obtain, more trustworthy.
 * Used both for the per-skill confidence and as an input to matching.
 */
export const EVIDENCE_WEIGHT: Record<EvidenceKind, number> = {
  self_declared: 0.05,
  assessment: 0.28,
  project: 0.22,
  certificate: 0.15,
  faculty_verified: 0.3,
  industry_verified: 0.4,
};

/** Confidence band cutoffs on the 0–1 evidence score. */
export const CONFIDENCE_BANDS = {
  verified: 0.75, // includes an industry- or faculty-verification signal
  high: 0.55,
  moderate: 0.3,
} as const;

/** A gap of this many NSQF levels or more is "high" priority. */
export const GAP_PRIORITY = { high: 2, medium: 1 } as const;

export const LEVEL_LABEL: Record<ProficiencyLevel, string> = {
  1: "Aware",
  2: "Novice",
  3: "Working",
  4: "Practitioner",
  5: "Proficient",
  6: "Advanced",
  7: "Expert",
  8: "Lead",
};

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function pct(n01: number): number {
  return Math.round(clamp01(n01) * 100);
}
