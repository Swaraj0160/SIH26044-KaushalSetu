/**
 * Next Best Action — deterministic, explainable.
 *
 * Generates candidate actions from the student's real state (readiness, gaps,
 * evidence, assessments, internships, applications, career goal) and ranks them
 * by leverage / effort. The top one is shown on Home; the rest can back a
 * "more actions" list. No AI, no hardcoded copy that isn't derived from data.
 */

import type { ResolvedProfile } from "./profile";
import type { ReadinessResult } from "./readiness";
import type { SkillGapReport } from "./skill-gap";
import type { Application, Internship, RoleProfile } from "@/lib/domain/types";

export interface NextAction {
  id: string;
  /** journey stage this advances (1..7) */
  stage: number;
  title: string;
  why: string;
  /** route to act on it */
  href: string;
  ctaLabel: string;
  /** 0..1 — higher = do this first */
  score: number;
  kind:
    | "set_goal"
    | "close_gap"
    | "take_assessment"
    | "request_verification"
    | "accept_delta"
    | "application_step"
    | "add_evidence"
    | "explore";
}

export interface NextActionContext {
  hasGoal: boolean;
  targetRole: RoleProfile;
  profile: ResolvedProfile;
  readiness: ReadinessResult;
  gap: SkillGapReport;
  internships: Internship[];
  applications: Array<Application & { title?: string }>;
  /** skillId -> true if the student has a project touching it but no verification */
  unverifiedProjectSkills: Set<string>;
}

const rank = (n: NextAction[]) => n.sort((a, b) => b.score - a.score);

export function computeNextActions(ctx: NextActionContext): NextAction[] {
  const out: NextAction[] = [];

  // 0 — no goal set: everything depends on this
  if (!ctx.hasGoal) {
    out.push({
      id: "set-goal",
      stage: 6,
      title: "Set your target role",
      why: "Readiness, skill gaps and opportunity matching are all measured against a target role. Pick one to get a plan.",
      href: "/student/career",
      ctaLabel: "Choose a role",
      score: 1,
      kind: "set_goal",
    });
    return out;
  }

  // 1 — internship finished but skill delta not yet reflected (free readiness)
  for (const it of ctx.internships) {
    if (
      it.status === "completed" &&
      it.finalEvaluation &&
      it.skillDelta.length
    ) {
      out.push({
        id: `accept-delta-${it.id}`,
        stage: 4,
        title: "Accept your verified internship skills",
        why: `Your completed internship produced a mentor-verified skill delta (${it.skillDelta
          .map((s) => s.skillId.replace("sk-", ""))
          .join(
            ", ",
          )}). Accepting it adds industry-verified evidence and lifts your readiness.`,
        href: "/student/internship",
        ctaLabel: "Review internship",
        score: 0.92,
        kind: "accept_delta",
      });
      break;
    }
  }

  // 2 — highest-priority mandatory gap for the target role
  const topGap = ctx.gap.gaps.find((g) => g.gap > 0 && g.mandatory);
  if (topGap) {
    out.push({
      id: `gap-${topGap.skillId}`,
      stage: 3,
      title: `Close your ${topGap.name} gap`,
      why: `${topGap.name} is a mandatory competency for ${ctx.targetRole.title} and currently your ${
        topGap.priority
      }-priority gap (level ${topGap.current} vs ${topGap.required}). It is blocking the role.`,
      href: "/student/gaps",
      ctaLabel: "Open the plan",
      score: 0.88,
      kind: "close_gap",
    });
  }

  // 3 — a role skill is self-rated but never assessed (cheap evidence win)
  const roleSkillIds = [
    ...new Set([
      ...ctx.targetRole.mandatorySkillIds,
      ...ctx.targetRole.preferredSkillIds,
    ]),
  ];
  const unassessed = roleSkillIds
    .map((sid) => ctx.profile.skills.get(sid))
    .filter((rs): rs is NonNullable<typeof rs> =>
      Boolean(rs && !rs.assessed && rs.effectiveLevel >= 2),
    )
    .sort((a, b) => b.effectiveLevel - a.effectiveLevel)[0];
  if (unassessed) {
    const name = unassessed.skill?.name ?? unassessed.skillId;
    out.push({
      id: `assess-${unassessed.skillId}`,
      stage: 2,
      title: `Take the ${name} assessment`,
      why: `You've rated ${name} at level ${unassessed.effectiveLevel} but never had it independently assessed. An assessment turns a claim into evidence and raises your match on every ${name} role.`,
      href: `/student/assessment?skill=${unassessed.skillId}`,
      ctaLabel: "Start assessment",
      score: 0.72,
      kind: "take_assessment",
    });
  }

  // 4 — a skill has a project but weak evidence → ask for verification
  for (const sid of ctx.unverifiedProjectSkills) {
    const rs = ctx.profile.skills.get(sid);
    if (rs && rs.evidence.score < 0.35) {
      out.push({
        id: `verify-${sid}`,
        stage: 3,
        title: `Request verification for ${rs.skill?.name ?? sid}`,
        why: `You have project work for ${rs.skill?.name ?? sid} but no faculty or industry sign-off. One verification jumps its evidence confidence.`,
        href: "/student/skills",
        ctaLabel: "View skill",
        score: 0.66,
        kind: "request_verification",
      });
      break;
    }
  }

  // 5 — an application is mid-pipeline with no next step
  const liveApp = ctx.applications.find((a) =>
    ["shortlisted", "interview"].includes(a.status),
  );
  if (liveApp) {
    out.push({
      id: `app-${liveApp.id}`,
      stage: 6,
      title: `Prepare for your ${liveApp.title ?? "shortlisted application"}`,
      why: `You're at the "${liveApp.status}" stage. Review the role's competency requirements and your gap for it before the next round.`,
      href: "/student/applications",
      ctaLabel: "Open applications",
      score: 0.6,
      kind: "application_step",
    });
  }

  // 6 — fallback: explore roles if readiness is low and nothing else fired
  if (out.length === 0) {
    out.push({
      id: "explore",
      stage: 6,
      title: "Explore roles close to your profile",
      why: `Your readiness for ${ctx.targetRole.title} is ${ctx.readiness.score}/100. Comparing adjacent roles can reveal a faster on-ramp.`,
      href: "/student/simulator",
      ctaLabel: "Compare roles",
      score: 0.4,
      kind: "explore",
    });
  }

  return rank(out);
}
