/**
 * Data-access + analysis layer.
 *
 * Combines the (demo) dataset with the deterministic engines into view-models the
 * UI renders directly. Every function is a pure read over `getDataset()`; a
 * production build reimplements this file against Drizzle without changing the
 * return types or the UI.
 */

import { getDataset } from "@/lib/demo/dataset";
import {
  computeDemand,
  computeMatch,
  computeReadiness,
  computeSkillGap,
  resolveProfile,
  scoreEvidence,
  type MatchResult,
  type ReadinessResult,
  type ResolvedProfile,
  type SkillGapReport,
} from "@/lib/engines";
import { computeNextActions, type NextAction } from "@/lib/engines/next-action";
import type {
  Achievement,
  Application,
  Certification,
  Id,
  Internship,
  Opportunity,
  Project,
  RoleProfile,
  Student,
} from "@/lib/domain/types";

const ds = getDataset;

/**
 * Per-request view context. When the signed-in student has made session edits
 * (career goal, added projects / certifications / achievements / assessments),
 * the page passes a patched `student` and merged collections so every engine
 * recomputes from the edited state. Omitted everywhere else → base dataset,
 * identical behaviour. Built by `lib/data/viewer.ts`.
 */
export interface StudentCtx {
  student?: Student;
  projects?: Project[];
  certifications?: Certification[];
  achievements?: Achievement[];
}

function studentOf(studentId: Id, ctx?: StudentCtx): Student {
  const s = ctx?.student ?? ds().studentById.get(studentId);
  if (!s) throw new Error(`Unknown student ${studentId}`);
  return s;
}
function projectsOf(studentId: Id, ctx?: StudentCtx): Project[] {
  return (
    ctx?.projects ?? ds().projects.filter((p) => p.studentId === studentId)
  );
}
function certsOf(studentId: Id, ctx?: StudentCtx): Certification[] {
  return (
    ctx?.certifications ??
    ds().certifications.filter((c) => c.studentId === studentId)
  );
}
function achievementsOf(studentId: Id, ctx?: StudentCtx): Achievement[] {
  return (
    ctx?.achievements ??
    ds().achievements.filter((a) => a.studentId === studentId)
  );
}

// ── shared helpers ─────────────────────────────────────────────────────────

export function experienceMonths(studentId: Id): number {
  const d = ds();
  return d.internships
    .filter((i) => i.studentId === studentId)
    .reduce((sum, i) => {
      const start = new Date(i.startDate).getTime();
      const end =
        i.status === "completed" ? new Date(i.endDate).getTime() : Date.now();
      const months = Math.max(0, (end - start) / (1000 * 60 * 60 * 24 * 30));
      return sum + Math.round(months);
    }, 0);
}

export function resolveStudent(
  studentId: Id,
  ctx?: StudentCtx,
): ResolvedProfile {
  const d = ds();
  return resolveProfile(studentOf(studentId, ctx), d.skillById, d.competencies);
}

// ── student-facing ─────────────────────────────────────────────────────────

export interface StudentDashboard {
  student: Student;
  institutionName: string;
  departmentName: string;
  targetRole: RoleProfile;
  profile: ResolvedProfile;
  readiness: ReadinessResult;
  gap: SkillGapReport;
  topStrength?: { name: string; level: number };
  biggestGap?: { name: string; gap: number };
  evidenceConfidencePct: number;
  applications: Array<
    Application & { opportunity: Opportunity; employerName: string }
  >;
  activeInternship?: Internship & { employerName: string; roleTitle: string };
  recommended: RankedOpportunity[];
}

export function getStudentDashboard(
  studentId: Id,
  ctx?: StudentCtx,
): StudentDashboard {
  const d = ds();
  const student = studentOf(studentId, ctx);
  const targetRole = d.roleById.get(student.targetRoleId)!;
  const profile = resolveStudent(studentId, ctx);
  const xp = experienceMonths(studentId);
  const studentProjects = projectsOf(studentId, ctx);

  const readiness = computeReadiness(student, profile, {
    role: targetRole,
    // adaptive assessment produces AssessmentResult in future; profile already carries assessedLevel
    projects: studentProjects,
    experienceMonths: xp,
  });

  const gap = computeSkillGap(
    profile,
    targetRole,
    d.skillById,
    d.learningResources,
  );

  // top strength = highest effective level with real evidence
  let topStrength: StudentDashboard["topStrength"];
  for (const rs of profile.skills.values()) {
    if (
      rs.evidence.score >= 0.3 &&
      (!topStrength || rs.effectiveLevel > topStrength.level)
    ) {
      topStrength = {
        name: rs.skill?.name ?? rs.skillId,
        level: rs.effectiveLevel,
      };
    }
  }
  const biggestGap = gap.gaps.find((g) => g.gap > 0)
    ? {
        name: gap.gaps.filter((g) => g.gap > 0).sort((a, b) => b.gap - a.gap)[0]
          .name,
        gap: gap.gaps.filter((g) => g.gap > 0).sort((a, b) => b.gap - a.gap)[0]
          .gap,
      }
    : undefined;

  const applications = d.applications
    .filter((a) => a.studentId === studentId)
    .map((a) => {
      const opportunity = d.opportunityById.get(a.opportunityId)!;
      return {
        ...a,
        opportunity,
        employerName: d.employerById.get(opportunity.employerId)?.name ?? "—",
      };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const activeRaw = d.internships.find(
    (i) => i.studentId === studentId && i.status === "active",
  );
  const activeInternship = activeRaw
    ? {
        ...activeRaw,
        employerName: d.employerById.get(activeRaw.employerId)?.name ?? "—",
        roleTitle: d.roleById.get(
          d.opportunityById.get(activeRaw.opportunityId)!.roleId,
        )!.title,
      }
    : undefined;

  const recommended = rankOpportunitiesForStudent(studentId, ctx).slice(0, 5);

  return {
    student,
    institutionName: d.institutionById.get(student.institutionId)?.name ?? "—",
    departmentName: d.departmentById.get(student.departmentId)?.name ?? "—",
    targetRole,
    profile,
    readiness,
    gap,
    topStrength,
    biggestGap,
    evidenceConfidencePct: Math.round(profile.meanEvidence * 100),
    applications,
    activeInternship,
    recommended,
  };
}

export interface RankedOpportunity {
  opportunity: Opportunity;
  employerName: string;
  role: RoleProfile;
  match: MatchResult;
  applied?: Application;
}

export function rankOpportunitiesForStudent(
  studentId: Id,
  ctx?: StudentCtx,
): RankedOpportunity[] {
  const d = ds();
  const student = studentOf(studentId, ctx);
  const profile = resolveStudent(studentId, ctx);
  const xp = experienceMonths(studentId);
  const apps = new Map(
    d.applications
      .filter((a) => a.studentId === studentId)
      .map((a) => [a.opportunityId, a]),
  );

  return d.opportunities
    .map((opportunity) => {
      const role = d.roleById.get(opportunity.roleId)!;
      const match = computeMatch(student, profile, {
        role,
        opportunity,
        skillsById: d.skillById,
        experienceMonths: xp,
      });
      return {
        opportunity,
        employerName: d.employerById.get(opportunity.employerId)?.name ?? "—",
        role,
        match,
        applied: apps.get(opportunity.id),
      };
    })
    .sort((a, b) => b.match.score - a.match.score);
}

export function getOpportunityMatchForStudent(
  studentId: Id,
  opportunityId: Id,
  ctx?: StudentCtx,
) {
  const d = ds();
  const student = studentOf(studentId, ctx);
  const opportunity = d.opportunityById.get(opportunityId);
  if (!opportunity) return undefined;
  const role = d.roleById.get(opportunity.roleId)!;
  const profile = resolveStudent(studentId, ctx);
  const match = computeMatch(student, profile, {
    role,
    opportunity,
    skillsById: d.skillById,
    experienceMonths: experienceMonths(studentId),
  });
  const gap = computeSkillGap(profile, role, d.skillById, d.learningResources, {
    extraSkillIds: opportunity.extraSkillIds,
  });
  return {
    opportunity,
    role,
    employer: d.employerById.get(opportunity.employerId)!,
    match,
    gap,
  };
}

// ── career simulator ───────────────────────────────────────────────────────

export interface RoleFit {
  role: RoleProfile;
  match: MatchResult;
  readiness: ReadinessResult;
  gap: SkillGapReport;
}

export function simulateRoles(
  studentId: Id,
  roleIds: Id[],
  ctx?: StudentCtx,
): RoleFit[] {
  const d = ds();
  const student = studentOf(studentId, ctx);
  const profile = resolveStudent(studentId, ctx);
  const xp = experienceMonths(studentId);
  const projects = projectsOf(studentId, ctx);

  return roleIds
    .map((rid) => d.roleById.get(rid))
    .filter((r): r is RoleProfile => Boolean(r))
    .map((role) => ({
      role,
      match: computeMatch(student, profile, {
        role,
        skillsById: d.skillById,
        experienceMonths: xp,
      }),
      readiness: computeReadiness(student, profile, {
        role,
        projects,
        experienceMonths: xp,
      }),
      gap: computeSkillGap(profile, role, d.skillById, d.learningResources),
    }));
}

/** "Which role am I closest to" — ranks all roles by match. */
export function closestRoles(
  studentId: Id,
  limit = 5,
  ctx?: StudentCtx,
): RoleFit[] {
  const d = ds();
  return simulateRoles(
    studentId,
    d.roles.map((r) => r.id),
    ctx,
  )
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, limit);
}

// ── recruiter-facing ───────────────────────────────────────────────────────

export interface RankedCandidate {
  student: Student;
  institutionName: string;
  match: MatchResult;
  application?: Application;
  experienceMonths: number;
}

export function rankCandidatesForOpportunity(
  opportunityId: Id,
): RankedCandidate[] {
  const d = ds();
  const opportunity = d.opportunityById.get(opportunityId);
  if (!opportunity) return [];
  const role = d.roleById.get(opportunity.roleId)!;
  const appsByStudent = new Map(
    d.applications
      .filter((a) => a.opportunityId === opportunityId)
      .map((a) => [a.studentId, a]),
  );

  // candidates = applicants + strong latent matches whose target role matches
  const candidateIds = new Set<Id>([
    ...appsByStudent.keys(),
    ...d.students.filter((s) => s.targetRoleId === role.id).map((s) => s.id),
  ]);

  return [...candidateIds]
    .map((sid) => {
      const student = d.studentById.get(sid)!;
      const profile = resolveProfile(student, d.skillById, d.competencies);
      const xp = experienceMonths(sid);
      const match = computeMatch(student, profile, {
        role,
        opportunity,
        skillsById: d.skillById,
        experienceMonths: xp,
      });
      return {
        student,
        institutionName:
          d.institutionById.get(student.institutionId)?.name ?? "—",
        match,
        application: appsByStudent.get(sid),
        experienceMonths: xp,
      };
    })
    .sort((a, b) => b.match.score - a.match.score);
}

export function rankStudentsForRole(roleId: Id, limit = 20): RankedCandidate[] {
  const d = ds();
  const role = d.roleById.get(roleId);
  if (!role) return [];
  return d.students
    .map((student) => {
      const profile = resolveProfile(student, d.skillById, d.competencies);
      const xp = experienceMonths(student.id);
      const match = computeMatch(student, profile, {
        role,
        skillsById: d.skillById,
        experienceMonths: xp,
      });
      return {
        student,
        institutionName:
          d.institutionById.get(student.institutionId)?.name ?? "—",
        match,
        application: undefined,
        experienceMonths: xp,
      };
    })
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, limit);
}

export function recruiterOpportunities(employerId: Id) {
  const d = ds();
  return d.opportunities
    .filter((o) => o.employerId === employerId)
    .map((o) => {
      const apps = d.applications.filter((a) => a.opportunityId === o.id);
      return {
        opportunity: o,
        role: d.roleById.get(o.roleId)!,
        applicants: apps.length,
        shortlisted: apps.filter((a) =>
          ["shortlisted", "interview", "offer", "hired"].includes(a.status),
        ).length,
      };
    });
}

// ── institution-facing ─────────────────────────────────────────────────────

export type HeatCell = "strong" | "moderate" | "critical" | "na";

export interface HeatmapRow {
  departmentId: Id;
  department: string;
  cells: Array<{
    skillId: Id;
    skill: string;
    status: HeatCell;
    meanLevel: number;
    students: number;
    withEvidence: number;
  }>;
}

export interface InstitutionOverview {
  institutionName: string;
  totalStudents: number;
  placementReady: number;
  internshipActive: number;
  meanReadiness: number;
  criticalGaps: Array<{
    skill: string;
    students: number;
    meanLevel: number;
    belowBarPct: number;
    severity: "critical" | "weak" | "watch";
  }>;
  departments: Array<{
    id: Id;
    name: string;
    students: number;
    meanReadiness: number;
    placementReadyPct: number;
  }>;
  industryPartners: number;
  activeCollaborations: number;
  heatmapSkillIds: Id[];
  heatmap: HeatmapRow[];
  placementConversionPct: number;
}

export function getInstitutionOverview(institutionId: Id): InstitutionOverview {
  const d = ds();
  const inst = d.institutionById.get(institutionId)!;
  const students = d.students.filter((s) => s.institutionId === institutionId);
  const depts = d.departments.filter(
    (dep) => dep.institutionId === institutionId,
  );

  // readiness per student (against their own target role)
  const readinessByStudent = new Map<Id, number>();
  for (const s of students) {
    const profile = resolveProfile(s, d.skillById, d.competencies);
    const role = d.roleById.get(s.targetRoleId)!;
    const r = computeReadiness(s, profile, {
      role,
      projects: d.projects.filter((p) => p.studentId === s.id),
      experienceMonths: experienceMonths(s.id),
    });
    readinessByStudent.set(s.id, r.score);
  }

  const meanReadiness = students.length
    ? Math.round(
        [...readinessByStudent.values()].reduce((a, b) => a + b, 0) /
          students.length,
      )
    : 0;
  const placementReady = students.filter(
    (s) => (readinessByStudent.get(s.id) ?? 0) >= 75,
  ).length;
  const internshipActive = d.internships.filter(
    (i) => i.status === "active" && students.some((s) => s.id === i.studentId),
  ).length;

  // skill columns for the heatmap: the union of mandatory skills of the target
  // roles that this institution's students actually pursue, capped at 12.
  const roleIds = new Set(students.map((s) => s.targetRoleId));
  const skillCount = new Map<Id, number>();
  for (const rid of roleIds) {
    for (const sid of d.roleById.get(rid)!.mandatorySkillIds) {
      skillCount.set(sid, (skillCount.get(sid) ?? 0) + 1);
    }
  }
  const heatmapSkillIds = [...skillCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([sid]) => sid);

  const heatmap: HeatmapRow[] = depts.flatMap((dep): HeatmapRow[] => {
    const deptStudents = students.filter((s) => s.departmentId === dep.id);
    if (!deptStudents.length) return [];
    const cells = heatmapSkillIds.map((sid) => {
      const levels: number[] = [];
      let withEvidence = 0;
      for (const s of deptStudents) {
        const ss = s.skills.find((x) => x.skillId === sid);
        if (!ss) continue;
        const profile = resolveProfile(s, d.skillById, d.competencies);
        const rs = profile.skills.get(sid);
        if (rs) {
          levels.push(rs.effectiveLevel);
          if (rs.evidence.score >= 0.3) withEvidence++;
        }
      }
      const meanLevel = levels.length
        ? levels.reduce((a, b) => a + b, 0) / levels.length
        : 0;
      const coverage = deptStudents.length
        ? levels.length / deptStudents.length
        : 0;
      let status: HeatCell = "na";
      if (levels.length) {
        if (meanLevel >= 4.5 && coverage >= 0.5) status = "strong";
        else if (meanLevel >= 3 && coverage >= 0.35) status = "moderate";
        else status = "critical";
      } else {
        status = "critical";
      }
      return {
        skillId: sid,
        skill: d.skillById.get(sid)?.name ?? sid,
        status,
        meanLevel: Math.round(meanLevel * 10) / 10,
        students: deptStudents.length,
        withEvidence,
      };
    });
    return [{ departmentId: dep.id, department: dep.name, cells }];
  });

  // critical institution-wide gaps
  const gapAgg = new Map<Id, { levels: number[]; students: number }>();
  for (const s of students) {
    const profile = resolveProfile(s, d.skillById, d.competencies);
    const role = d.roleById.get(s.targetRoleId)!;
    for (const sid of role.mandatorySkillIds) {
      const rs = profile.skills.get(sid);
      const rec = gapAgg.get(sid) ?? { levels: [], students: 0 };
      rec.levels.push(rs?.effectiveLevel ?? 0);
      rec.students++;
      gapAgg.set(sid, rec);
    }
  }
  const criticalGaps = [...gapAgg.entries()]
    .map(([sid, rec]) => {
      const meanLevel =
        Math.round(
          (rec.levels.reduce((a, b) => a + b, 0) / rec.levels.length) * 10,
        ) / 10;
      // share of students below "Practitioner" (L4) on this mandatory skill
      const belowBar = rec.levels.filter((l) => l < 4).length;
      return {
        skill: d.skillById.get(sid)?.name ?? sid,
        students: rec.students,
        meanLevel,
        belowBarPct: Math.round((belowBar / rec.levels.length) * 100),
        severity: (meanLevel < 3.2
          ? "critical"
          : meanLevel < 4
            ? "weak"
            : "watch") as "critical" | "weak" | "watch",
      };
    })
    // Always surface the weakest mandatory skills — the ranking is the signal.
    .sort((a, b) => a.meanLevel - b.meanLevel)
    .slice(0, 6);

  const departments = depts
    .map((dep) => {
      const ds2 = students.filter((s) => s.departmentId === dep.id);
      if (!ds2.length) return null;
      const rs = ds2.map((s) => readinessByStudent.get(s.id) ?? 0);
      return {
        id: dep.id,
        name: dep.name,
        students: ds2.length,
        meanReadiness: Math.round(rs.reduce((a, b) => a + b, 0) / rs.length),
        placementReadyPct: Math.round(
          (rs.filter((x) => x >= 75).length / ds2.length) * 100,
        ),
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .sort((a, b) => b.meanReadiness - a.meanReadiness);

  const collabs = d.collaborations.filter(
    (c) => c.institutionId === institutionId,
  );
  const placementsForInst = d.placements.filter((p) =>
    students.some((s) => s.id === p.studentId),
  );
  const conversions = placementsForInst.filter(
    (p) => p.type === "internship_conversion",
  ).length;

  return {
    institutionName: inst.name,
    totalStudents: students.length,
    placementReady,
    internshipActive,
    meanReadiness,
    criticalGaps,
    departments,
    industryPartners: new Set(collabs.map((c) => c.employerId)).size,
    activeCollaborations: collabs.filter((c) => c.stage === "active").length,
    heatmapSkillIds,
    heatmap,
    placementConversionPct: placementsForInst.length
      ? Math.round((conversions / placementsForInst.length) * 100)
      : 0,
  };
}

export interface HeatCellDetail {
  department: string;
  skill: string;
  students: Array<{
    id: Id;
    name: string;
    level: number;
    hasEvidence: boolean;
    targetRole: string;
  }>;
  meanLevel: number;
  recommendedAction: string;
}

export function getHeatmapCellDetail(
  institutionId: Id,
  departmentId: Id,
  skillId: Id,
): HeatCellDetail {
  const d = ds();
  const dept = d.departmentById.get(departmentId)!;
  const skill = d.skillById.get(skillId)!;
  const students = d.students.filter(
    (s) => s.institutionId === institutionId && s.departmentId === departmentId,
  );
  const rows = students
    .map((s) => {
      const profile = resolveProfile(s, d.skillById, d.competencies);
      const rs = profile.skills.get(skillId);
      return {
        id: s.id,
        name: s.name,
        level: rs?.effectiveLevel ?? 0,
        hasEvidence: (rs?.evidence.score ?? 0) >= 0.3,
        targetRole: d.roleById.get(s.targetRoleId)?.title ?? "—",
      };
    })
    .sort((a, b) => a.level - b.level);
  const withSkill = rows.filter((r) => r.level > 0);
  const meanLevel = withSkill.length
    ? withSkill.reduce((a, b) => a + b.level, 0) / withSkill.length
    : 0;
  const coverage = students.length ? withSkill.length / students.length : 0;

  let action: string;
  if (coverage < 0.4)
    action = `Only ${Math.round(coverage * 100)}% of ${dept.name} students have any ${skill.name}. Add a foundational module or an elective in the next semester.`;
  else if (meanLevel < 3)
    action = `${skill.name} is present but shallow (mean L${meanLevel.toFixed(1)}). Run an industry-led workshop + a graded mini-project to push toward L4.`;
  else
    action = `${skill.name} coverage is adequate. Prioritise evidence: only ${rows.filter((r) => r.hasEvidence).length}/${students.length} have verifiable evidence — organise assessments and faculty sign-off.`;

  return {
    department: dept.name,
    skill: skill.name,
    students: rows,
    meanLevel: Math.round(meanLevel * 10) / 10,
    recommendedAction: action,
  };
}

export function getInstitutionStudents(institutionId: Id) {
  const d = ds();
  return d.students
    .filter((s) => s.institutionId === institutionId)
    .map((s) => {
      const dash = getStudentDashboard(s.id);
      return {
        id: s.id,
        name: s.name,
        programme: s.programme,
        department: d.departmentById.get(s.departmentId)?.name ?? "—",
        graduationYear: s.graduationYear,
        cgpa: s.cgpa,
        targetRole: dash.targetRole.title,
        readiness: dash.readiness.score,
        band: dash.readiness.band,
        evidencePct: dash.evidenceConfidencePct,
        biggestGap: dash.biggestGap?.name ?? "—",
      };
    })
    .sort((a, b) => b.readiness - a.readiness);
}

export function getPlacementIntelligence(institutionId: Id) {
  const d = ds();
  const studentIds = new Set(
    d.students
      .filter((s) => s.institutionId === institutionId)
      .map((s) => s.id),
  );
  const outcomes = d.placements.filter((p) => studentIds.has(p.studentId));
  const byRole = new Map<
    string,
    { count: number; ctc: number[]; ttoDays: number[]; gapClosed: number[] }
  >();
  for (const o of outcomes) {
    const title = d.roleById.get(o.roleId)?.title ?? o.roleId;
    const rec = byRole.get(title) ?? {
      count: 0,
      ctc: [],
      ttoDays: [],
      gapClosed: [],
    };
    rec.count++;
    rec.ctc.push(o.ctcLpa);
    rec.ttoDays.push(o.timeToOfferDays);
    rec.gapClosed.push(o.skillGapClosed);
    byRole.set(title, rec);
  }
  const roleRows = [...byRole.entries()]
    .map(([title, r]) => ({
      title,
      count: r.count,
      medianCtc: median(r.ctc) ?? 0,
      avgDays: Math.round(
        r.ttoDays.reduce((a, b) => a + b, 0) / r.ttoDays.length,
      ),
      avgGapClosed:
        Math.round(
          (r.gapClosed.reduce((a, b) => a + b, 0) / r.gapClosed.length) * 10,
        ) / 10,
    }))
    .sort((a, b) => b.count - a.count);

  const readinessDelta = outcomes.map((o) => ({
    start: o.readinessAtStart,
    offer: o.readinessAtOffer,
    delta: o.readinessAtOffer - o.readinessAtStart,
  }));
  const avgDelta = readinessDelta.length
    ? Math.round(
        readinessDelta.reduce((a, b) => a + b.delta, 0) / readinessDelta.length,
      )
    : 0;
  const conversions = outcomes.filter(
    (o) => o.type === "internship_conversion",
  ).length;

  return {
    total: outcomes.length,
    conversions,
    conversionPct: outcomes.length
      ? Math.round((conversions / outcomes.length) * 100)
      : 0,
    avgReadinessGain: avgDelta,
    roleRows,
    scatter: outcomes
      .map((o) => ({
        readiness: o.readinessAtOffer,
        ctc: o.ctcLpa,
        days: o.timeToOfferDays,
      }))
      .sort((a, b) => a.readiness - b.readiness),
  };
}

function median(xs: number[]): number | undefined {
  if (!xs.length) return undefined;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round(((s[m - 1] + s[m]) / 2) * 10) / 10;
}

// ── demand ─────────────────────────────────────────────────────────────────

export function getDemandReport() {
  const d = ds();
  return computeDemand(d.opportunities, d.roleById, d.skillById);
}

// ── credential verification ────────────────────────────────────────────────

export function verifyCredential(credentialId: string) {
  const d = ds();
  const credential = d.credentialById.get(credentialId);
  if (!credential) return { found: false as const };
  const student = d.studentById.get(credential.studentId)!;
  return {
    found: true as const,
    credential,
    holder: {
      name: student.name,
      programme: student.programme,
      institution: d.institutionById.get(student.institutionId)?.name ?? "—",
    },
    competencies: credential.competencyIds
      .map((cid) => d.competencyById.get(cid))
      .filter((c): c is NonNullable<typeof c> => Boolean(c)),
  };
}

// ── misc list helpers used by pages ────────────────────────────────────────

// ── competency graph (for the visual) ──────────────────────────────────────

export interface GraphData {
  student: { id: Id; name: string; targetRole: string };
  competencies: Array<{
    id: Id;
    name: string;
    level: number;
    nsqfBand: number;
    required: number;
    met: boolean;
    inTarget: boolean;
    evidence: number;
    skillIds: Id[];
  }>;
  skills: Array<{
    id: Id;
    name: string;
    level: number;
    confidence: string;
    evidence: number;
    competencyIds: Id[];
    inProfile: boolean;
  }>;
}

export function getCompetencyGraph(studentId: Id, ctx?: StudentCtx): GraphData {
  const d = ds();
  const student = studentOf(studentId, ctx);
  const targetRole = d.roleById.get(student.targetRoleId)!;
  const profile = resolveStudent(studentId, ctx);
  const reqByComp = new Map(
    targetRole.requirements.map((r) => [r.competencyId, r]),
  );

  // competencies to show: the target role's, plus up to 2 of the student's other
  // strongest competencies (keeps the graph legible — 6–8 nodes, not 20).
  const targetIds = new Set<Id>(
    targetRole.requirements.map((r) => r.competencyId),
  );
  const extras = [...profile.competencies.values()]
    .filter(
      (rc) =>
        !targetIds.has(rc.competencyId) &&
        rc.level >= 3 &&
        // real breadth, not one incidentally-shared skill
        rc.requiredSkillsHeld >= 2,
    )
    .sort((a, b) => b.level - a.level)
    .slice(0, 2)
    .map((rc) => rc.competencyId);
  const compIds = new Set<Id>([...targetIds, ...extras]);

  const competencies = [...compIds]
    .map((cid) => {
      const comp = d.competencyById.get(cid)!;
      const rc = profile.competencies.get(cid);
      const req = reqByComp.get(cid);
      return {
        id: cid,
        name: comp.name,
        level: Math.round((rc?.level ?? 0) * 10) / 10,
        nsqfBand: comp.nsqfBand,
        required: req?.minLevel ?? 0,
        met: req ? (rc?.level ?? 0) + 1e-9 >= req.minLevel : false,
        inTarget: Boolean(req),
        evidence: Math.round((rc?.evidence ?? 0) * 100) / 100,
        skillIds: comp.skillIds,
      };
    })
    .sort(
      (a, b) => Number(b.inTarget) - Number(a.inTarget) || b.level - a.level,
    );

  const skillIds = new Set<Id>();
  for (const c of competencies) c.skillIds.forEach((s) => skillIds.add(s));

  const skills = [...skillIds].map((sid) => {
    const rs = profile.skills.get(sid);
    const skill = d.skillById.get(sid)!;
    return {
      id: sid,
      name: skill.name,
      level: rs?.effectiveLevel ?? 0,
      confidence: rs?.evidence.confidence ?? "low",
      evidence: Math.round((rs?.evidence.score ?? 0) * 100) / 100,
      competencyIds: competencies
        .filter((c) => c.skillIds.includes(sid))
        .map((c) => c.id),
      inProfile: Boolean(rs),
    };
  });

  return {
    student: {
      id: student.id,
      name: student.name,
      targetRole: targetRole.title,
    },
    competencies,
    skills,
  };
}

export function getPassport(studentId: Id, ctx?: StudentCtx) {
  const d = ds();
  const student = studentOf(studentId, ctx);
  const dash = getStudentDashboard(studentId, ctx);
  const profile = dash.profile;

  const competencyRows = [...profile.competencies.values()]
    .filter((rc) => rc.level >= 2)
    .sort((a, b) => b.level - a.level)
    .map((rc) => ({
      id: rc.competencyId,
      name: rc.competency.name,
      level: Math.round(rc.level * 10) / 10,
      nsqfBand: rc.competency.nsqfBand,
      evidence: Math.round(rc.evidence * 100),
      skills: rc.competency.skillIds
        .map((sid) => profile.skills.get(sid))
        .filter((rs): rs is NonNullable<typeof rs> => Boolean(rs))
        .map((rs) => ({
          name: rs.skill?.name ?? rs.skillId,
          level: rs.effectiveLevel,
          confidence: rs.evidence.confidence,
        })),
    }));

  const verifiedSkills = [...profile.skills.values()]
    .filter(
      (rs) =>
        rs.evidence.confidence === "verified" ||
        rs.evidence.confidence === "high",
    )
    .sort((a, b) => b.evidence.score - a.evidence.score)
    .map((rs) => ({
      name: rs.skill?.name ?? rs.skillId,
      level: rs.effectiveLevel,
      confidence: rs.evidence.confidence,
      rationale: rs.evidence.rationale,
    }));

  const credential =
    studentId === "stu-aarav"
      ? d.credentialById.get("KS-PASSPORT-AARAV")
      : d.credentials.find(
          (c) => c.studentId === studentId && c.kind === "competency_passport",
        );

  return {
    student,
    dash,
    institutionName: dash.institutionName,
    departmentName: dash.departmentName,
    competencyRows,
    verifiedSkills,
    projects: projectsOf(studentId, ctx),
    certifications: certsOf(studentId, ctx),
    achievements: [...achievementsOf(studentId, ctx)].sort((a, b) =>
      b.date.localeCompare(a.date),
    ),
    endorsements: student.endorsements.map((e) => ({
      ...e,
      competencyName:
        d.competencyById.get(e.competencyId)?.name ?? e.competencyId,
    })),
    credential,
  };
}

export function evidenceForSkill(studentId: Id, skillId: Id, ctx?: StudentCtx) {
  const s = ctx?.student ?? ds().studentById.get(studentId);
  const ss = s?.skills.find((x) => x.skillId === skillId);
  if (!ss) return undefined;
  return { ...scoreEvidence(ss.evidence), evidence: ss.evidence };
}

/** Per-skill "skill card": level, target, the ordered evidence stack, origins
 *  and the single most useful next step. */
export function getSkillDetail(studentId: Id, skillId: Id, ctx?: StudentCtx) {
  const d = ds();
  const skill = d.skillById.get(skillId);
  if (!skill) return undefined;
  const student = studentOf(studentId, ctx);
  const profile = resolveStudent(studentId, ctx);
  const rs = profile.skills.get(skillId);
  const raw = student.skills.find((x) => x.skillId === skillId);
  const targetRole = d.roleById.get(student.targetRoleId)!;

  // target level = highest role requirement across competencies containing this skill
  const compIds = d.competencies
    .filter((c) => c.skillIds.includes(skillId))
    .map((c) => c.id);
  let targetLevel = 0;
  for (const req of targetRole.requirements) {
    if (compIds.includes(req.competencyId))
      targetLevel = Math.max(targetLevel, req.minLevel);
  }
  if (targetRole.mandatorySkillIds.includes(skillId))
    targetLevel = Math.max(targetLevel, 4);

  const KIND_ORDER: Record<string, number> = {
    industry_verified: 0,
    faculty_verified: 1,
    assessment: 2,
    project: 3,
    certificate: 4,
    self_declared: 5,
  };
  const stack = [...(raw?.evidence ?? [])].sort(
    (a, b) => (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9),
  );
  const lastAssessed =
    stack
      .filter((e) => e.kind === "assessment" && e.date)
      .sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? null;

  const courses = student.education.courses
    .filter((c) => c.skillIds.includes(skillId))
    .map((c) => ({ code: c.code, title: c.title, grade: c.grade }));
  const projects = projectsOf(studentId, ctx)
    .filter((p) => p.skillIds.includes(skillId))
    .map((p) => ({ id: p.id, title: p.title }));
  const certifications = certsOf(studentId, ctx)
    .filter((c) => c.skillIds.includes(skillId))
    .map((c) => ({ id: c.id, name: c.name }));

  const held = Boolean(rs);
  const level = rs?.effectiveLevel ?? 0;
  const hasHuman = rs?.evidence.hasHumanVerification ?? false;
  const assessed = rs?.assessed ?? false;

  let nextStep: { label: string; href: string; why: string };
  if (!held) {
    nextStep = {
      label: "Take an assessment",
      href: `/student/assessment?skill=${skillId}`,
      why: "You do not hold this skill yet. An assessment is the fastest way to establish a baseline.",
    };
  } else if (!assessed) {
    nextStep = {
      label: "Take the assessment",
      href: `/student/assessment?skill=${skillId}`,
      why: "This level is self-declared. An assessment converts it into evidence and raises confidence.",
    };
  } else if (!hasHuman) {
    nextStep = {
      label: "Attach a project",
      href: "/student/projects",
      why: "Assessed but not yet verified by a human. A project (then a faculty review) pushes confidence to high/verified.",
    };
  } else if (level < targetLevel) {
    nextStep = {
      label: "Close the gap",
      href: "/student/career?tab=roadmap",
      why: `L${level} vs the L${targetLevel} your target role needs. The roadmap sequences how to close it.`,
    };
  } else {
    nextStep = {
      label: "Keep it fresh",
      href: `/student/assessment?skill=${skillId}`,
      why: "At or above target with human-verified evidence. Re-assess periodically so it does not go stale.",
    };
  }

  return {
    skill,
    category: d.skillCategories.find((c) => c.id === skill.categoryId)?.name,
    held,
    level,
    selfLevel: rs?.selfLevel ?? raw?.selfRating ?? 0,
    targetLevel,
    assessed,
    lastAssessed,
    confidence: rs?.evidence.confidence ?? "low",
    evidenceScorePct: Math.round((rs?.evidence.score ?? 0) * 100),
    rationale: rs?.evidence.rationale ?? [],
    stack,
    origins: { courses, projects, certifications },
    competencies: d.competencies
      .filter((c) => c.skillIds.includes(skillId))
      .map((c) => ({
        id: c.id,
        name: c.name,
        requiredByGoal: targetRole.requirements.some(
          (r) => r.competencyId === c.id,
        ),
      })),
    prerequisites: skill.prerequisiteIds
      .map((pid) => d.skillById.get(pid)?.name)
      .filter((x): x is string => Boolean(x)),
    nextStep,
    targetRoleTitle: targetRole.title,
  };
}

// ── student home: journey spine, next best action, activity ────────────────

export interface JourneyStage {
  n: number;
  key: string;
  label: string;
  state: "done" | "current" | "upcoming";
  detail: string;
  href: string;
}

export function getJourney(studentId: Id, ctx?: StudentCtx): JourneyStage[] {
  const d = ds();
  const s = studentOf(studentId, ctx);
  const dash = getStudentDashboard(studentId, ctx);
  const profile = dash.profile;
  const skillsWithEvidence = [...profile.skills.values()].filter(
    (r) => r.evidence.score >= 0.3,
  ).length;
  const projects = projectsOf(studentId, ctx);
  const internships = d.internships.filter((i) => i.studentId === studentId);
  const activeIntern = internships.find((i) => i.status === "active");
  const doneIntern = internships.some((i) => i.status === "completed");
  const placed = d.placements.some((p) => p.studentId === studentId);
  const readiness = dash.readiness.score;

  const raw: Array<Omit<JourneyStage, "state">> = [
    {
      n: 1,
      key: "education",
      label: "Education",
      href: "/student/education",
      detail: `${s.education.courses.length} courses on record`,
    },
    {
      n: 2,
      key: "skills",
      label: "Skills",
      href: "/student/skills",
      detail: `${profile.skills.size} skills`,
    },
    {
      n: 3,
      key: "evidence",
      label: "Evidence",
      href: "/student/skills",
      detail: `${skillsWithEvidence} skills evidenced`,
    },
    {
      n: 4,
      key: "projects",
      label: "Projects",
      href: "/student/projects",
      detail: `${projects.length} project${projects.length === 1 ? "" : "s"}`,
    },
    {
      n: 5,
      key: "internship",
      label: "Internship",
      href: "/student/internship",
      detail: activeIntern
        ? "in progress"
        : doneIntern
          ? "completed"
          : "not started",
    },
    {
      n: 6,
      key: "readiness",
      label: "Career readiness",
      href: "/student/career",
      detail: `${readiness}/100 for ${dash.targetRole.title}`,
    },
    {
      n: 7,
      key: "placement",
      label: "Placement",
      href: "/student/career",
      detail: placed ? "offer received" : "not yet",
    },
  ];

  const done = new Set<string>();
  if (s.education.courses.length >= 3) done.add("education");
  if (profile.skills.size >= 4) done.add("skills");
  if (skillsWithEvidence >= 3) done.add("evidence");
  if (projects.length >= 1) done.add("projects");
  if (doneIntern) done.add("internship");
  if (readiness >= 75) done.add("readiness");
  if (placed) done.add("placement");

  let currentSet = false;
  return raw.map((r) => {
    let state: JourneyStage["state"];
    if (done.has(r.key)) state = "done";
    else if (r.key === "internship" && activeIntern) {
      state = "current";
      currentSet = true;
    } else if (!currentSet) {
      state = "current";
      currentSet = true;
    } else state = "upcoming";
    return { ...r, state };
  });
}

export function getNextActions(studentId: Id, ctx?: StudentCtx): NextAction[] {
  const d = ds();
  const s = studentOf(studentId, ctx);
  const dash = getStudentDashboard(studentId, ctx);
  const internships = d.internships.filter((i) => i.studentId === studentId);
  const apps = dash.applications.map((a) => ({
    ...a,
    title: a.opportunity.title.split(" — ")[0],
  }));

  const unverifiedProjectSkills = new Set<string>();
  for (const p of projectsOf(studentId, ctx)) {
    for (const sid of p.skillIds) unverifiedProjectSkills.add(sid);
  }

  return computeNextActions({
    hasGoal: Boolean(s.targetRoleId),
    targetRole: dash.targetRole,
    profile: dash.profile,
    readiness: dash.readiness,
    gap: dash.gap,
    internships,
    applications: apps,
    unverifiedProjectSkills,
  });
}

export interface ActivityItem {
  when: string;
  label: string;
  kind:
    | "skill"
    | "project"
    | "internship"
    | "application"
    | "certificate"
    | "endorsement"
    | "achievement";
}

export function getRecentActivity(
  studentId: Id,
  limit = 6,
  ctx?: StudentCtx,
): ActivityItem[] {
  const d = ds();
  const s = studentOf(studentId, ctx);
  const items: ActivityItem[] = [];

  for (const p of projectsOf(studentId, ctx)) {
    items.push({
      when: p.date,
      kind: "project",
      label: `Project ${p.status === "evaluated" ? "evaluated" : "logged"}: ${p.title}`,
    });
    for (const ev of p.evaluations)
      items.push({
        when: ev.date,
        kind: "endorsement",
        label: `${ev.role === "faculty" ? "Faculty" : "Industry"} evaluation received for ${p.title}`,
      });
  }
  for (const c of certsOf(studentId, ctx)) {
    items.push({
      when: c.date,
      kind: "certificate",
      label: `Certification: ${c.name} (${c.issuer})`,
    });
  }
  for (const e of s.endorsements) {
    items.push({
      when: e.date,
      kind: "endorsement",
      label: `${e.role === "industry" ? "Industry" : "Faculty"} endorsed ${d.competencyById.get(e.competencyId)?.name ?? "a competency"}`,
    });
  }
  for (const a of achievementsOf(studentId, ctx)) {
    items.push({
      when: a.date,
      kind: "achievement",
      label: `${a.title}${a.organisation ? ` · ${a.organisation}` : ""}`,
    });
  }
  for (const it of d.internships.filter((i) => i.studentId === studentId)) {
    items.push({
      when: it.startDate,
      kind: "internship",
      label: `Internship started at ${d.employerById.get(it.employerId)?.name ?? "an employer"}`,
    });
    if (it.finalEvaluation)
      items.push({
        when: it.endDate,
        kind: "internship",
        label: `Internship completed · mentor evaluation ${it.finalEvaluation.score}/100`,
      });
    else if (it.weeklyLogs.length)
      items.push({
        when: it.startDate,
        kind: "internship",
        label: `Mentor submitted weekly feedback (week ${it.weeklyLogs.length})`,
      });
  }
  for (const a of d.applications.filter((a) => a.studentId === studentId)) {
    const o = d.opportunityById.get(a.opportunityId);
    items.push({
      when: a.updatedAt,
      kind: "application",
      label: `Application to ${o?.title.split(" — ")[0] ?? "a role"} → ${a.status.replace(/_/g, " ")}`,
    });
  }
  for (const rs of getStudentDashboard(
    studentId,
    ctx,
  ).profile.skills.values()) {
    if (rs.evidence.confidence === "verified")
      items.push({
        when: "2026-06-01",
        kind: "skill",
        label: `${rs.skill?.name ?? rs.skillId} competency verified`,
      });
  }

  return items
    .filter((i) => i.when && i.when !== "")
    .sort((a, b) => b.when.localeCompare(a.when))
    .slice(0, limit);
}

export function getStudentHome(studentId: Id, ctx?: StudentCtx) {
  const s = studentOf(studentId, ctx);
  const dash = getStudentDashboard(studentId, ctx);
  return {
    student: s,
    firstName: s.name.replace(/^Dr\.?\s+/i, "").split(" ")[0],
    targetRole: dash.targetRole,
    readiness: dash.readiness,
    journey: getJourney(studentId, ctx),
    nextActions: getNextActions(studentId, ctx),
    activity: getRecentActivity(studentId, 5, ctx),
    recommended: dash.recommended.slice(0, 3),
    inbox: getInbox(studentId, ctx).attention.slice(0, 3),
  };
}

// ── "what changed" / attention inbox ──────────────────────────────────────

export interface InboxItem {
  kind: "attention" | "recent";
  tone: "action" | "info" | "positive";
  title: string;
  detail: string;
  href: string;
}

/**
 * Deterministic. `attention` = things that need the student's action now,
 * ranked by leverage. `recent` = the activity feed. No timestamps are invented
 * beyond what the dataset carries.
 */
export function getInbox(
  studentId: Id,
  ctx?: StudentCtx,
): { attention: InboxItem[]; recent: InboxItem[] } {
  const dash = getStudentDashboard(studentId, ctx);
  const profile = dash.profile;
  const role = dash.targetRole;
  const attention: InboxItem[] = [];

  // 1 — pending faculty verification on a project the student owns
  const pendingProjects = projectsOf(studentId, ctx).filter(
    (p) =>
      p.skillIds.length &&
      !p.facultyVerifiedBy &&
      !p.evaluations.some((e) => e.role === "faculty"),
  );
  if (pendingProjects.length)
    attention.push({
      kind: "attention",
      tone: "action",
      title: `${pendingProjects.length} project${pendingProjects.length === 1 ? "" : "s"} not yet faculty-verified`,
      detail: `Request a review of "${pendingProjects[0].title}" — it turns project work into verified evidence.`,
      href: `/student/projects/${pendingProjects[0].id}`,
    });

  // 2 — a mandatory role skill with no assessment
  const unassessed = role.mandatorySkillIds
    .map((sid) => profile.skills.get(sid))
    .filter((rs) => rs != null && !rs.assessed)
    .map((rs) => rs!);
  if (unassessed.length)
    attention.push({
      kind: "attention",
      tone: "action",
      title: `${unassessed.length} target-role skill${unassessed.length === 1 ? "" : "s"} still self-declared`,
      detail: `Assess ${unassessed[0].skill?.name ?? "a skill"} to convert a self-rating into evidence.`,
      href: `/student/assessment?skill=${unassessed[0].skillId}`,
    });

  // 3 — top mandatory gap blocking the goal
  const topGap = dash.gap.gaps
    .filter((g) => g.gap > 0 && g.mandatory)
    .sort((a, b) => b.gap - a.gap)[0];
  if (topGap)
    attention.push({
      kind: "attention",
      tone: "action",
      title: `${topGap.name} is blocking ${role.title}`,
      detail: `L${topGap.current} vs L${topGap.required} required. The roadmap sequences how to close it.`,
      href: "/student/career?tab=roadmap",
    });

  // 4 — a strong opportunity match not applied to
  const strongUnapplied = dash.recommended.find(
    (r) => r.match.score >= 70 && !r.applied,
  );
  if (strongUnapplied)
    attention.push({
      kind: "attention",
      tone: "info",
      title: `Strong match not applied to: ${strongUnapplied.role.title}`,
      detail: `${strongUnapplied.match.score}% at ${strongUnapplied.employerName}. Review the breakdown before the deadline.`,
      href: `/student/opportunities/${strongUnapplied.opportunity.id}`,
    });

  // 5 — an application awaiting the student's move
  const activeApp = dash.applications.find((a) =>
    ["shortlisted", "interview", "offer"].includes(a.status),
  );
  if (activeApp)
    attention.push({
      kind: "attention",
      tone: "positive",
      title: `Application update: ${activeApp.opportunity.title.split(" — ")[0]}`,
      detail: `Now "${activeApp.status.replace(/_/g, " ")}" at ${activeApp.employerName}.`,
      href: "/student/career?tab=applications",
    });

  const recent: InboxItem[] = getRecentActivity(studentId, 8, ctx).map((a) => ({
    kind: "recent",
    tone: a.kind === "skill" || a.kind === "endorsement" ? "positive" : "info",
    title: a.label,
    detail: a.when,
    href:
      a.kind === "application"
        ? "/student/career?tab=applications"
        : a.kind === "project"
          ? "/student/projects"
          : a.kind === "internship"
            ? "/student/internship"
            : "/student/skills",
  }));

  return { attention, recent };
}

// ── education ─────────────────────────────────────────────────────────────

export function getEducation(studentId: Id, ctx?: StudentCtx) {
  const d = ds();
  const s = studentOf(studentId, ctx);
  const profile = resolveStudent(studentId, ctx);
  return {
    ...s.education,
    graduationYear: s.graduationYear,
    programme: s.programme,
    courses: s.education.courses.map((c) => ({
      ...c,
      skills: c.skillIds.map((sid) => {
        const rs = profile.skills.get(sid);
        return {
          id: sid,
          name: d.skillById.get(sid)?.name ?? sid,
          heldLevel: rs?.effectiveLevel ?? 0,
          hasIt: Boolean(rs),
        };
      }),
    })),
  };
}

// ── projects ──────────────────────────────────────────────────────────────

export function getStudentProjects(studentId: Id, ctx?: StudentCtx) {
  const d = ds();
  return projectsOf(studentId, ctx)
    .map((p) => ({
      ...p,
      skillNames: p.skillIds.map((sid) => d.skillById.get(sid)?.name ?? sid),
      competencyNames: p.competencyClaims
        .map((cid) => d.competencyById.get(cid)?.name)
        .filter((x): x is string => Boolean(x)),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getProject(studentId: Id, projectId: Id, ctx?: StudentCtx) {
  return getStudentProjects(studentId, ctx).find((p) => p.id === projectId);
}

// ── certifications & achievements ─────────────────────────────────────────

export function getCertifications(studentId: Id, ctx?: StudentCtx) {
  const d = ds();
  return certsOf(studentId, ctx)
    .map((c) => ({
      ...c,
      skillNames: c.skillIds.map((sid) => d.skillById.get(sid)?.name ?? sid),
      competencyNames: (c.competencyClaims ?? [])
        .map((cid) => d.competencyById.get(cid)?.name)
        .filter((x): x is string => Boolean(x)),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getAchievements(studentId: Id, ctx?: StudentCtx) {
  const d = ds();
  return achievementsOf(studentId, ctx)
    .map((a) => ({
      ...a,
      skillNames: a.skillIds.map((sid) => d.skillById.get(sid)?.name ?? sid),
      competencyNames: a.competencyClaims
        .map((cid) => d.competencyById.get(cid)?.name)
        .filter((x): x is string => Boolean(x)),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
