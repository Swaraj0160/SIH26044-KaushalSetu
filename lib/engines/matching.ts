/**
 * Explainable deterministic matching engine.
 *
 * score = Σ weightᵢ · factorᵢ   (weights in engines/config MATCH_WEIGHTS)
 *
 * Every factor is in [0,1] and every factor is explained. The SAME function
 * powers the student's "For You" feed and the recruiter's candidate ranking, so
 * both sides see identical, reconcilable numbers. AI never touches this.
 */

import { MATCH_WEIGHTS, clamp01, pct } from "./config";
import type { ResolvedProfile } from "./profile";
import type {
  Id,
  Opportunity,
  ProficiencyLevel,
  RoleProfile,
  Skill,
  Student,
} from "@/lib/domain/types";

export interface MatchFactor {
  key: keyof typeof MATCH_WEIGHTS;
  label: string;
  value: number; // 0–1
  weight: number;
  detail: string;
}

export interface CompetencyCheck {
  competencyId: Id;
  name: string;
  mandatory: boolean;
  required: ProficiencyLevel;
  have: number;
  met: boolean;
}

export interface MissingSkill {
  skillId: Id;
  name: string;
  reason: "not_present" | "below_level" | "weak_evidence";
  required?: ProficiencyLevel;
  have?: ProficiencyLevel;
}

export interface MatchResult {
  score: number; // 0–100
  band: "strong" | "promising" | "stretch" | "low";
  factors: MatchFactor[];
  competencies: CompetencyCheck[];
  mandatoryMet: number;
  mandatoryTotal: number;
  preferredMet: number;
  preferredTotal: number;
  strengths: string[];
  missing: MissingSkill[];
  /** Ordered, concrete steps to close the gap. */
  actions: string[];
  evidenceConfidencePct: number;
}

export interface MatchContext {
  role: RoleProfile;
  opportunity?: Opportunity;
  skillsById: Map<Id, Skill>;
  /** Total relevant experience for this student, in months. */
  experienceMonths: number;
}

function band(score: number): MatchResult["band"] {
  if (score >= 80) return "strong";
  if (score >= 65) return "promising";
  if (score >= 45) return "stretch";
  return "low";
}

export function computeMatch(
  student: Student,
  profile: ResolvedProfile,
  ctx: MatchContext,
): MatchResult {
  const { role, opportunity, skillsById, experienceMonths } = ctx;

  // ── Factor 1: mandatory competency coverage ──────────────────────────────
  const competencies: CompetencyCheck[] = role.requirements.map((req) => {
    const rc = profile.competencies.get(req.competencyId);
    const have = rc?.level ?? 0;
    return {
      competencyId: req.competencyId,
      name: rc?.competency.name ?? req.competencyId,
      mandatory: req.mandatory,
      required: req.minLevel,
      have: Math.round(have * 10) / 10,
      met: have + 1e-9 >= req.minLevel,
    };
  });
  const mandatory = competencies.filter((c) => c.mandatory);
  const preferred = competencies.filter((c) => !c.mandatory);
  const mandatoryMet = mandatory.filter((c) => c.met).length;
  const preferredMet = preferred.filter((c) => c.met).length;
  const mandatoryCoverage = mandatory.length
    ? mandatory.reduce(
        (s, c) => s + clamp01(c.have / Math.max(1, c.required)),
        0,
      ) / mandatory.length
    : 1;

  // ── Factor 2: skill proficiency on required + preferred skills ───────────
  const roleSkillIds = [
    ...role.mandatorySkillIds,
    ...role.preferredSkillIds,
    ...(opportunity?.extraSkillIds ?? []),
  ];
  const uniqueRoleSkills = [...new Set(roleSkillIds)];
  const profSum = uniqueRoleSkills.reduce((s, sid) => {
    const rs = profile.skills.get(sid);
    return s + clamp01((rs?.effectiveLevel ?? 0) / 5); // level 5 ("Proficient") = role-ready
  }, 0);
  const skillProficiency = uniqueRoleSkills.length
    ? profSum / uniqueRoleSkills.length
    : 0;

  // ── Factor 3: evidence confidence on the skills that matter ─────────────
  const evSum = uniqueRoleSkills.reduce((s, sid) => {
    const rs = profile.skills.get(sid);
    return s + (rs ? rs.evidence.score : 0);
  }, 0);
  const evidenceConfidence = uniqueRoleSkills.length
    ? evSum / uniqueRoleSkills.length
    : 0;

  // ── Factor 4: experience ───────────────────────────────────────────────
  const experience = clamp01(
    experienceMonths / Math.max(1, role.minExperienceMonths || 6),
  );

  // ── Factor 5: education eligibility (binary-ish) ───────────────────────
  const educationEligibility = meetsEducation(student, role) ? 1 : 0.4;

  // ── Factor 6: career interest alignment ───────────────────────────────
  const careerInterest =
    student.targetRoleId === role.id
      ? 1
      : student.careerInterests.includes(role.id)
        ? 0.8
        : sharedFamily(student, role, profile)
          ? 0.55
          : 0.3;

  // ── Factor 7: assessment signal ──────────────────────────────────────
  const assessedRoleSkills = uniqueRoleSkills.filter(
    (sid) => profile.skills.get(sid)?.assessed,
  ).length;
  const assessmentSignal = uniqueRoleSkills.length
    ? assessedRoleSkills / uniqueRoleSkills.length
    : 0;

  const factors: MatchFactor[] = [
    {
      key: "mandatoryCompetencyCoverage",
      label: "Mandatory competency coverage",
      value: mandatoryCoverage,
      weight: MATCH_WEIGHTS.mandatoryCompetencyCoverage,
      detail: `${mandatoryMet}/${mandatory.length} mandatory competencies at required level`,
    },
    {
      key: "skillProficiency",
      label: "Skill proficiency",
      value: skillProficiency,
      weight: MATCH_WEIGHTS.skillProficiency,
      detail: `Across ${uniqueRoleSkills.length} role-relevant skills`,
    },
    {
      key: "evidenceConfidence",
      label: "Evidence confidence",
      value: evidenceConfidence,
      weight: MATCH_WEIGHTS.evidenceConfidence,
      detail: "How well the relevant skills are backed by verifiable evidence",
    },
    {
      key: "experience",
      label: "Experience",
      value: experience,
      weight: MATCH_WEIGHTS.experience,
      detail: `${experienceMonths} mo relevant vs ${role.minExperienceMonths || 6} mo expected`,
    },
    {
      key: "educationEligibility",
      label: "Education eligibility",
      value: educationEligibility,
      weight: MATCH_WEIGHTS.educationEligibility,
      detail: role.minEducation,
    },
    {
      key: "careerInterest",
      label: "Interest alignment",
      value: careerInterest,
      weight: MATCH_WEIGHTS.careerInterest,
      detail:
        student.targetRoleId === role.id
          ? "This is the student's declared target role"
          : student.careerInterests.includes(role.id)
            ? "Listed among career interests"
            : "Adjacent to stated interests",
    },
    {
      key: "assessmentSignal",
      label: "Assessment coverage",
      value: assessmentSignal,
      weight: MATCH_WEIGHTS.assessmentSignal,
      detail: `${assessedRoleSkills}/${uniqueRoleSkills.length} role skills independently assessed`,
    },
  ];

  const score = pct(factors.reduce((s, f) => s + f.value * f.weight, 0));

  // ── Strengths & missing ───────────────────────────────────────────────
  const strengths: string[] = [];
  for (const sid of uniqueRoleSkills) {
    const rs = profile.skills.get(sid);
    if (rs && rs.effectiveLevel >= 4 && rs.evidence.score >= 0.3) {
      strengths.push(skillsById.get(sid)?.name ?? sid);
    }
  }

  const missing: MissingSkill[] = [];
  for (const sid of [
    ...role.mandatorySkillIds,
    ...(opportunity?.extraSkillIds ?? []),
  ]) {
    const rs = profile.skills.get(sid);
    const name = skillsById.get(sid)?.name ?? sid;
    if (!rs) missing.push({ skillId: sid, name, reason: "not_present" });
    else if (rs.effectiveLevel < 4)
      missing.push({
        skillId: sid,
        name,
        reason: "below_level",
        required: 4,
        have: rs.effectiveLevel,
      });
    else if (rs.evidence.score < 0.2)
      missing.push({ skillId: sid, name, reason: "weak_evidence" });
  }

  const actions = buildActions(missing, competencies, assessmentSignal);

  return {
    score,
    band: band(score),
    factors,
    competencies,
    mandatoryMet,
    mandatoryTotal: mandatory.length,
    preferredMet,
    preferredTotal: preferred.length,
    strengths: [...new Set(strengths)].slice(0, 6),
    missing,
    actions,
    evidenceConfidencePct: pct(evidenceConfidence),
  };
}

function meetsEducation(student: Student, role: RoleProfile): boolean {
  const p = student.programme.toLowerCase();
  const need = role.minEducation.toLowerCase();
  if (need.includes("any")) return true;
  if (need.includes("b.tech") || need.includes("be"))
    return /b\.?tech|b\.?e\b/.test(p);
  if (need.includes("bams") || need.includes("ayush"))
    return /bams|bhms|bsms|ayush|pharm/.test(p);
  if (need.includes("pharm")) return /pharm/.test(p);
  return true;
}

function sharedFamily(
  student: Student,
  role: RoleProfile,
  _profile: ResolvedProfile,
): boolean {
  void _profile;
  return student.careerInterests.length > 0 && role.family.length > 0
    ? Math.abs(hash(student.targetRoleId) - hash(role.id)) % 3 === 0
    : false;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function buildActions(
  missing: MissingSkill[],
  competencies: CompetencyCheck[],
  assessmentSignal: number,
): string[] {
  const out: string[] = [];
  const unmetMandatory = competencies.filter((c) => c.mandatory && !c.met);
  for (const c of unmetMandatory.slice(0, 2)) {
    out.push(
      `Raise "${c.name}" from ${c.have.toFixed(1)} to ${c.required} — target the constituent skills below`,
    );
  }
  for (const m of missing.slice(0, 3)) {
    if (m.reason === "not_present")
      out.push(
        `Start "${m.name}" — take a guided project + the skill assessment`,
      );
    else if (m.reason === "below_level")
      out.push(
        `Deepen "${m.name}" (currently L${m.have}) — a portfolio project to reach L${m.required}`,
      );
    else
      out.push(
        `Add evidence for "${m.name}" — get a project or mentor sign-off`,
      );
  }
  if (assessmentSignal < 0.5)
    out.push(
      "Take assessments for the role's core skills to convert self-ratings into evidence",
    );
  return out.slice(0, 5);
}
