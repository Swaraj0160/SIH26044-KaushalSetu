/**
 * Evidence Confidence engine.
 *
 * A self-declared skill is worth almost nothing on its own. Confidence rises as
 * independent, harder-to-fake evidence types accumulate — and jumps to
 * "verified" once a human verifier (faculty or industry) has signed off.
 *
 * Deterministic: same evidence set → same score, always.
 */

import { CONFIDENCE_BANDS, EVIDENCE_WEIGHT, clamp01 } from "./config";
import type {
  EvidenceConfidence,
  EvidenceKind,
  SkillEvidenceRef,
  StudentSkill,
} from "@/lib/domain/types";

export interface EvidenceScore {
  score: number; // 0–1
  confidence: EvidenceConfidence;
  kinds: EvidenceKind[];
  hasHumanVerification: boolean;
  /** Short reasons the UI can list. */
  rationale: string[];
}

const DIMINISHING = 0.55; // each extra piece of the same kind counts for less

export function scoreEvidence(evidence: SkillEvidenceRef[]): EvidenceScore {
  const byKind = new Map<EvidenceKind, number>();
  for (const e of evidence) byKind.set(e.kind, (byKind.get(e.kind) ?? 0) + 1);

  let raw = 0;
  for (const [kind, count] of byKind) {
    // first item full weight, subsequent items decay
    let contribution = 0;
    for (let i = 0; i < count; i++) {
      contribution += EVIDENCE_WEIGHT[kind] * Math.pow(DIMINISHING, i);
    }
    raw += contribution;
  }

  const hasHumanVerification =
    byKind.has("faculty_verified") || byKind.has("industry_verified");

  // A lone self-declaration is capped hard.
  if (byKind.size === 1 && byKind.has("self_declared"))
    raw = Math.min(raw, 0.08);

  const score = clamp01(raw);

  let confidence: EvidenceConfidence = "low";
  if (hasHumanVerification && score >= CONFIDENCE_BANDS.verified)
    confidence = "verified";
  else if (score >= CONFIDENCE_BANDS.high) confidence = "high";
  else if (score >= CONFIDENCE_BANDS.moderate) confidence = "moderate";

  const rationale: string[] = [];
  const order: EvidenceKind[] = [
    "industry_verified",
    "faculty_verified",
    "assessment",
    "project",
    "certificate",
    "self_declared",
  ];
  for (const k of order) {
    const c = byKind.get(k);
    if (c) rationale.push(`${LABEL[k]}${c > 1 ? ` ×${c}` : ""}`);
  }
  if (!hasHumanVerification)
    rationale.push("No human verification yet — discounted in matching");

  return {
    score,
    confidence,
    kinds: [...byKind.keys()],
    hasHumanVerification,
    rationale,
  };
}

const LABEL: Record<EvidenceKind, string> = {
  self_declared: "Self-declared",
  assessment: "Assessment",
  project: "Project evidence",
  certificate: "Certificate",
  faculty_verified: "Faculty verified",
  industry_verified: "Industry verified",
};

export function evidenceKindLabel(k: EvidenceKind): string {
  return LABEL[k];
}

/** Average evidence score across a student's skills — used by readiness. */
export function portfolioEvidenceScore(skills: StudentSkill[]): number {
  if (!skills.length) return 0;
  const total = skills.reduce(
    (s, sk) => s + scoreEvidence(sk.evidence).score,
    0,
  );
  return total / skills.length;
}

export function confidenceRank(c: EvidenceConfidence): number {
  return { low: 0, moderate: 1, high: 2, verified: 3 }[c];
}
