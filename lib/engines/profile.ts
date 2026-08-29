/**
 * Resolves a raw Student into an analysis-ready profile:
 *   - effective proficiency per skill (self rating tempered by assessment)
 *   - evidence score + confidence per skill
 *   - competency levels (min of constituent skills, the "chain is as strong as
 *     its weakest link" rule)
 *
 * Pure and deterministic. Everything downstream (matching, readiness, gaps)
 * consumes this instead of touching Student directly.
 */

import { scoreEvidence, type EvidenceScore } from "./evidence";
import type {
  Competency,
  Id,
  ProficiencyLevel,
  Skill,
  Student,
} from "@/lib/domain/types";

export interface ResolvedSkill {
  skillId: Id;
  skill?: Skill;
  selfLevel: ProficiencyLevel;
  /** assessment-tempered level actually used in scoring */
  effectiveLevel: ProficiencyLevel;
  assessed: boolean;
  evidence: EvidenceScore;
}

export interface ResolvedCompetency {
  competencyId: Id;
  competency: Competency;
  /** 0 if the student has none of the constituent skills */
  level: number;
  requiredSkillsHeld: number;
  requiredSkillsTotal: number;
  /** mean evidence score across held constituent skills */
  evidence: number;
}

export interface ResolvedProfile {
  studentId: Id;
  skills: Map<Id, ResolvedSkill>;
  competencies: Map<Id, ResolvedCompetency>;
  meanEvidence: number;
}

function temper(
  self: ProficiencyLevel,
  assessed: ProficiencyLevel | undefined,
): ProficiencyLevel {
  if (assessed == null) {
    // No assessment: trust self-rating only up to "Working" (3); above that,
    // pull toward 3 because it is unverified.
    return (self <= 3 ? self : Math.round((self + 3) / 2)) as ProficiencyLevel;
  }
  // Assessment present: weight it 70/30 over self-rating.
  return Math.max(
    1,
    Math.round(assessed * 0.7 + self * 0.3),
  ) as ProficiencyLevel;
}

export function resolveProfile(
  student: Student,
  skillsById: Map<Id, Skill>,
  competencies: Competency[],
): ResolvedProfile {
  const skills = new Map<Id, ResolvedSkill>();

  for (const ss of student.skills) {
    const evidence = scoreEvidence(ss.evidence);
    const effectiveLevel = temper(ss.selfRating, ss.assessedLevel);
    skills.set(ss.skillId, {
      skillId: ss.skillId,
      skill: skillsById.get(ss.skillId),
      selfLevel: ss.selfRating,
      effectiveLevel,
      assessed: ss.assessedLevel != null,
      evidence,
    });
  }

  const resolvedComps = new Map<Id, ResolvedCompetency>();
  for (const comp of competencies) {
    const held = comp.skillIds
      .map((sid) => skills.get(sid))
      .filter((x): x is ResolvedSkill => Boolean(x));

    let level = 0;
    let evidence = 0;
    if (held.length) {
      // Competency level blends the weakest constituent skill (a chain is only as
      // strong as its weakest link) with the average, then applies a soft
      // coverage penalty (√) so missing one of several skills is not fatal.
      const levels = held.map((h) => h.effectiveLevel);
      const weakest = Math.min(...levels);
      const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
      const coverage = held.length / comp.skillIds.length;
      level = (0.35 * weakest + 0.65 * avg) * Math.pow(coverage, 0.3);
      evidence = held.reduce((s, h) => s + h.evidence.score, 0) / held.length;
    }

    resolvedComps.set(comp.id, {
      competencyId: comp.id,
      competency: comp,
      level,
      requiredSkillsHeld: held.length,
      requiredSkillsTotal: comp.skillIds.length,
      evidence,
    });
  }

  const meanEvidence =
    student.skills.length === 0
      ? 0
      : [...skills.values()].reduce((s, r) => s + r.evidence.score, 0) /
        skills.size;

  return {
    studentId: student.id,
    skills,
    competencies: resolvedComps,
    meanEvidence,
  };
}
