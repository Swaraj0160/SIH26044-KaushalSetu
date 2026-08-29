/**
 * Skill-Gap engine + roadmap sequencer.
 *
 * Input:  resolved student profile + target role (+ learning catalogue)
 * Output: per-skill gap (required / current / gap / priority / actions) and an
 *         ordered development plan that respects skill prerequisites, ending in
 *         evidence a recruiter will trust.
 *
 * Deterministic.
 */

import { GAP_PRIORITY, LEVEL_LABEL } from "./config";
import type { ResolvedProfile } from "./profile";
import type {
  Id,
  LearningResource,
  ProficiencyLevel,
  RoleProfile,
  Skill,
} from "@/lib/domain/types";

export type GapPriority = "high" | "medium" | "low";

export interface SkillGap {
  skillId: Id;
  name: string;
  category?: string;
  required: ProficiencyLevel;
  /** Effective current level, 0 when the student does not have the skill. */
  current: number;
  gap: number;
  priority: GapPriority;
  mandatory: boolean;
  hasEvidence: boolean;
  actions: string[];
  resources: LearningResource[];
}

export interface RoadmapStep {
  order: number;
  skillId: Id;
  skillName: string;
  fromLevel: number;
  toLevel: number;
  activity: string;
  producesEvidence: string;
  estWeeks: number;
  resources: LearningResource[];
}

export interface SkillGapReport {
  roleId: Id;
  roleTitle: string;
  gaps: SkillGap[];
  matchableAfterPlan: number; // count of gaps the plan closes
  roadmap: RoadmapStep[];
  totalWeeks: number;
}

const TARGET_LEVEL: ProficiencyLevel = 5; // "Proficient" — the default role bar

export function computeSkillGap(
  profile: ResolvedProfile,
  role: RoleProfile,
  skillsById: Map<Id, Skill>,
  catalogue: LearningResource[],
  opts: { targetLevel?: ProficiencyLevel; extraSkillIds?: Id[] } = {},
): SkillGapReport {
  const target = opts.targetLevel ?? TARGET_LEVEL;
  const mandatory = new Set(role.mandatorySkillIds);
  const skillIds = [
    ...new Set([
      ...role.mandatorySkillIds,
      ...role.preferredSkillIds,
      ...(opts.extraSkillIds ?? []),
    ]),
  ];

  const gaps: SkillGap[] = [];
  for (const sid of skillIds) {
    const rs = profile.skills.get(sid);
    const current = rs?.effectiveLevel ?? 0;
    const isMandatory = mandatory.has(sid);
    const required = (
      isMandatory ? target : Math.max(3, target - 1)
    ) as ProficiencyLevel;
    const gap = Math.max(0, required - current);
    if (gap === 0 && (rs?.evidence.score ?? 0) >= 0.3) continue;

    const priority: GapPriority =
      isMandatory && gap >= GAP_PRIORITY.high
        ? "high"
        : gap >= GAP_PRIORITY.high || isMandatory
          ? "medium"
          : "low";

    const skill = skillsById.get(sid);
    const resources = catalogue
      .filter((r) => r.skillIds.includes(sid))
      .slice(0, 3);

    const actions: string[] = [];
    if (!rs)
      actions.push(`Begin with a foundations course in ${skill?.name ?? sid}`);
    if (gap > 0)
      actions.push(
        `Build a project that forces ${skill?.name ?? sid} to level ${required}`,
      );
    if ((rs?.evidence.score ?? 0) < 0.3)
      actions.push("Obtain faculty or industry verification for this skill");
    if (!rs?.assessed)
      actions.push("Take the skill assessment to establish a baseline");

    gaps.push({
      skillId: sid,
      name: skill?.name ?? sid,
      category: skill?.categoryId,
      required,
      current,
      gap,
      priority,
      mandatory: isMandatory,
      hasEvidence: (rs?.evidence.score ?? 0) >= 0.3,
      actions,
      resources,
    });
  }

  gaps.sort(
    (a, b) =>
      rank(b.priority) - rank(a.priority) ||
      Number(b.mandatory) - Number(a.mandatory) ||
      b.gap - a.gap,
  );

  const roadmap = sequenceRoadmap(gaps, skillsById, catalogue);
  const totalWeeks = roadmap.reduce((s, r) => s + r.estWeeks, 0);

  return {
    roleId: role.id,
    roleTitle: role.title,
    gaps,
    matchableAfterPlan: gaps.filter((g) => g.gap > 0).length,
    roadmap,
    totalWeeks,
  };
}

function rank(p: GapPriority): number {
  return { high: 2, medium: 1, low: 0 }[p];
}

/**
 * Orders gap-closing steps so prerequisites come first, highest-priority first
 * among the unblocked, and each step names the evidence it produces.
 */
function sequenceRoadmap(
  gaps: SkillGap[],
  skillsById: Map<Id, Skill>,
  catalogue: LearningResource[],
): RoadmapStep[] {
  const gapBySkill = new Map(gaps.map((g) => [g.skillId, g]));
  const done = new Set<Id>();
  const steps: RoadmapStep[] = [];
  const pending = gaps.filter((g) => g.gap > 0);

  let guard = 0;
  while (pending.length && guard++ < 50) {
    // pick first whose prerequisites are not themselves pending gaps
    const idx = pending.findIndex((g) => {
      const prereqs = skillsById.get(g.skillId)?.prerequisiteIds ?? [];
      return prereqs.every((p) => !gapBySkill.has(p) || done.has(p));
    });
    const g = pending.splice(idx === -1 ? 0 : idx, 1)[0];
    done.add(g.skillId);

    const from = g.current;
    const to = g.required;
    const estWeeks = Math.max(1, (to - from) * 2 + (g.hasEvidence ? 0 : 1));
    steps.push({
      order: steps.length + 1,
      skillId: g.skillId,
      skillName: g.name,
      fromLevel: from,
      toLevel: to,
      activity:
        from < 1
          ? `Foundations + guided project in ${g.name}`
          : `Advanced project raising ${g.name} from ${LEVEL_LABEL[from as ProficiencyLevel] ?? `L${from}`} to ${LEVEL_LABEL[to]}`,
      producesEvidence:
        g.priority === "high"
          ? "Portfolio project + skill assessment + mentor sign-off (industry-verifiable)"
          : "Portfolio project + skill assessment",
      estWeeks,
      resources: catalogue
        .filter((r) => r.skillIds.includes(g.skillId))
        .slice(0, 2),
    });
  }
  return steps;
}
