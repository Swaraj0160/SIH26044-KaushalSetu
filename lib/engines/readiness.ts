/**
 * Career Readiness engine — deterministic 0–100 score for "how ready is this
 * student for their target role right now".
 *
 * readiness = Σ weightᵢ · factorᵢ   (READINESS_WEIGHTS in engines/config)
 *
 * AI may narrate this number. AI must never produce it.
 */

import { READINESS_WEIGHTS, clamp01, pct } from "./config";
import type { ResolvedProfile } from "./profile";
import type { Project, RoleProfile, Student } from "@/lib/domain/types";

export interface ReadinessFactor {
  key: keyof typeof READINESS_WEIGHTS;
  label: string;
  value: number;
  weight: number;
  detail: string;
}

export interface ReadinessResult {
  score: number;
  band: "placement_ready" | "near_ready" | "developing" | "early";
  factors: ReadinessFactor[];
  headline: string;
}

export interface ReadinessContext {
  role: RoleProfile;
  projects: Project[];
  experienceMonths: number;
}

function band(n: number): ReadinessResult["band"] {
  if (n >= 75) return "placement_ready";
  if (n >= 58) return "near_ready";
  if (n >= 40) return "developing";
  return "early";
}

export function computeReadiness(
  _student: Student,
  profile: ResolvedProfile,
  ctx: ReadinessContext,
): ReadinessResult {
  void _student;
  const { role, projects, experienceMonths } = ctx;

  const reqComps = role.requirements;
  const competencyCoverage = reqComps.length
    ? reqComps.reduce((s, req) => {
        const have = profile.competencies.get(req.competencyId)?.level ?? 0;
        return s + clamp01(have / Math.max(1, req.minLevel));
      }, 0) / reqComps.length
    : 0;

  const roleSkillIds = [
    ...new Set([...role.mandatorySkillIds, ...role.preferredSkillIds]),
  ];
  const skillProficiency = roleSkillIds.length
    ? roleSkillIds.reduce(
        (s, sid) =>
          s + clamp01((profile.skills.get(sid)?.effectiveLevel ?? 0) / 6),
        0,
      ) / roleSkillIds.length
    : 0;

  // Assessment signal is read from the resolved profile: which role skills have
  // been independently assessed, and how strong those assessed levels are.
  const assessedRoleSkills = roleSkillIds
    .map((sid) => profile.skills.get(sid))
    .filter((rs): rs is NonNullable<typeof rs> => Boolean(rs?.assessed));
  const assessment = assessedRoleSkills.length
    ? clamp01(
        assessedRoleSkills.reduce((s, rs) => s + rs.effectiveLevel / 8, 0) /
          assessedRoleSkills.length,
      ) *
      clamp01(0.45 + 0.55 * (assessedRoleSkills.length / roleSkillIds.length))
    : 0;
  const roleAssessments = assessedRoleSkills; // for the detail string below

  const evidence = profile.meanEvidence;

  const relevantProjects = projects.filter((p) =>
    p.skillIds.some((sid) => roleSkillIds.includes(sid)),
  ).length;
  const projectsFactor = clamp01(relevantProjects / 3);

  const experience = clamp01(
    experienceMonths / Math.max(3, role.minExperienceMonths || 6),
  );

  const factors: ReadinessFactor[] = [
    {
      key: "competencyCoverage",
      label: "Competency coverage",
      value: competencyCoverage,
      weight: READINESS_WEIGHTS.competencyCoverage,
      detail: `${reqComps.length} competencies required for ${role.title}`,
    },
    {
      key: "skillProficiency",
      label: "Skill proficiency",
      value: skillProficiency,
      weight: READINESS_WEIGHTS.skillProficiency,
      detail: `${roleSkillIds.length} role skills`,
    },
    {
      key: "assessment",
      label: "Assessment performance",
      value: assessment,
      weight: READINESS_WEIGHTS.assessment,
      detail: `${roleAssessments.length}/${roleSkillIds.length} role skills assessed`,
    },
    {
      key: "evidence",
      label: "Evidence confidence",
      value: evidence,
      weight: READINESS_WEIGHTS.evidence,
      detail: "Portfolio-wide evidence strength",
    },
    {
      key: "projects",
      label: "Project portfolio",
      value: projectsFactor,
      weight: READINESS_WEIGHTS.projects,
      detail: `${relevantProjects} project(s) touching this role`,
    },
    {
      key: "experience",
      label: "Practical experience",
      value: experience,
      weight: READINESS_WEIGHTS.experience,
      detail: `${experienceMonths} months`,
    },
  ];

  const score = pct(factors.reduce((s, f) => s + f.value * f.weight, 0));
  const b = band(score);
  const headline = {
    placement_ready: `Placement-ready for ${role.title}`,
    near_ready: `Near-ready for ${role.title} — a focused sprint closes the gap`,
    developing: `Developing toward ${role.title}`,
    early: `Early in the journey to ${role.title}`,
  }[b];

  return { score, band: b, factors, headline };
}
