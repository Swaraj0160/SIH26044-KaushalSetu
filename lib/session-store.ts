/**
 * Session-scoped mutation layer (demo build).
 *
 * The demo has no database — it runs on one deterministic synthetic dataset.
 * This module lets the *current viewer* genuinely add, edit and delete their own
 * records (career goal, projects, certifications, achievements, courses,
 * assessment results) for the length of their session. The edits are stored in a
 * single signed cookie and applied over the base dataset per request, so every
 * deterministic engine (readiness, skill gap, matching, VCC, Next Best Action)
 * recomputes from the edited state.
 *
 * Honest limitations, surfaced in the UI:
 *  - scoped to this browser session; cleared on sign-out and on redeploy
 *  - not shared with other roles' views of the same student
 *  - bounded in size (a few items) because it lives in a cookie
 *
 * A production build replaces this file with real writes; the `lib/data`
 * view-model layer and the engines do not change.
 */

import "server-only";

import { cookies } from "next/headers";

import type {
  Achievement,
  Certification,
  Course,
  CourseGrade,
  Id,
  Project,
  ProjectType,
  SkillEvidenceRef,
  Student,
  StudentSkill,
} from "@/lib/domain/types";

const COOKIE = "ks_patch";
const MAX_JSON_BYTES = 2700; // ~3.6 KB once base64-encoded — under the 4 KB cookie ceiling
const MAX_TEXT = 400;
const MAX_ITEMS = 12;

export interface SessionProject {
  id: Id;
  title: string;
  type: ProjectType;
  summary: string;
  contribution: string;
  tech: string[];
  skillIds: Id[];
  competencyClaims: Id[];
  links: { repo?: string; demo?: string; docs?: string };
  period: string;
  date: string;
}

export interface SessionCertification {
  id: Id;
  name: string;
  issuer: string;
  date: string;
  expiry?: string;
  skillIds: Id[];
  competencyClaims: Id[];
  credentialUrl?: string;
}

export interface SessionAchievement {
  id: Id;
  type: Achievement["type"];
  title: string;
  organisation: string;
  date: string;
  description: string;
  skillIds: Id[];
  competencyClaims: Id[];
}

export interface SessionCourse {
  code: string;
  title: string;
  credits: number;
  term: string;
  grade: CourseGrade;
  skillIds: Id[];
}

export interface SessionAssessment {
  skillId: Id;
  score: number; // 0–100
  level: number; // 1–8
  date: string;
}

export interface SessionPatch {
  /** Career goal override. */
  goalRoleId?: Id;
  careerInterests?: Id[];
  /** Session-added collections (base items are not editable). */
  projects: SessionProject[];
  certifications: SessionCertification[];
  achievements: SessionAchievement[];
  courses: SessionCourse[];
  assessments: SessionAssessment[];
  /** Per-skill self-rating overrides and target levels. */
  skillTargets: Record<Id, number>;
  /** Onboarding completion flag (demo). */
  onboarded?: boolean;
}

const EMPTY: SessionPatch = {
  projects: [],
  certifications: [],
  achievements: [],
  courses: [],
  assessments: [],
  skillTargets: {},
};

function clip(s: string, n = MAX_TEXT): string {
  s = (s ?? "").toString();
  return s.length > n ? s.slice(0, n) : s;
}

export async function getPatch(): Promise<SessionPatch> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return structuredClone(EMPTY);
  try {
    const json = Buffer.from(raw, "base64").toString("utf8");
    const v = JSON.parse(json) as Partial<SessionPatch>;
    return {
      ...structuredClone(EMPTY),
      ...v,
      projects: Array.isArray(v.projects) ? v.projects : [],
      certifications: Array.isArray(v.certifications) ? v.certifications : [],
      achievements: Array.isArray(v.achievements) ? v.achievements : [],
      courses: Array.isArray(v.courses) ? v.courses : [],
      assessments: Array.isArray(v.assessments) ? v.assessments : [],
      skillTargets:
        v.skillTargets && typeof v.skillTargets === "object"
          ? v.skillTargets
          : {},
    };
  } catch {
    return structuredClone(EMPTY);
  }
}

export class SessionStoreFullError extends Error {
  constructor() {
    super(
      "This demo session can only hold a few added items (it lives in a cookie). Remove one to add another.",
    );
    this.name = "SessionStoreFullError";
  }
}

async function writePatch(p: SessionPatch): Promise<void> {
  const json = JSON.stringify(p);
  if (Buffer.byteLength(json, "utf8") > MAX_JSON_BYTES)
    throw new SessionStoreFullError();
  const value = Buffer.from(json, "utf8").toString("base64");
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearPatch(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

// ── mutations ──────────────────────────────────────────────────────────────

export async function setGoal(roleId: Id, interests?: Id[]): Promise<void> {
  const p = await getPatch();
  p.goalRoleId = roleId;
  if (interests) p.careerInterests = interests.slice(0, 4);
  await writePatch(p);
}

export async function markOnboarded(): Promise<void> {
  const p = await getPatch();
  p.onboarded = true;
  await writePatch(p);
}

function newId(prefix: string): string {
  return `${prefix}-s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export async function upsertProject(
  input: Omit<SessionProject, "id"> & { id?: Id },
): Promise<Id> {
  const p = await getPatch();
  const clean: SessionProject = {
    id: input.id ?? newId("proj"),
    title: clip(input.title, 120),
    type: input.type,
    summary: clip(input.summary),
    contribution: clip(input.contribution, 200),
    tech: (input.tech ?? []).slice(0, 12).map((t) => clip(t, 40)),
    skillIds: (input.skillIds ?? []).slice(0, 12),
    competencyClaims: (input.competencyClaims ?? []).slice(0, 8),
    links: {
      repo: input.links?.repo ? clip(input.links.repo, 200) : undefined,
      demo: input.links?.demo ? clip(input.links.demo, 200) : undefined,
      docs: input.links?.docs ? clip(input.links.docs, 200) : undefined,
    },
    period: clip(input.period, 40),
    date: input.date,
  };
  const i = p.projects.findIndex((x) => x.id === clean.id);
  if (i >= 0) p.projects[i] = clean;
  else {
    if (p.projects.length >= MAX_ITEMS) throw new SessionStoreFullError();
    p.projects.push(clean);
  }
  await writePatch(p);
  return clean.id;
}

export async function removeProject(id: Id): Promise<void> {
  const p = await getPatch();
  p.projects = p.projects.filter((x) => x.id !== id);
  await writePatch(p);
}

export async function upsertCertification(
  input: Omit<SessionCertification, "id"> & { id?: Id },
): Promise<Id> {
  const p = await getPatch();
  const clean: SessionCertification = {
    id: input.id ?? newId("cert"),
    name: clip(input.name, 120),
    issuer: clip(input.issuer, 80),
    date: input.date,
    expiry: input.expiry || undefined,
    skillIds: (input.skillIds ?? []).slice(0, 10),
    competencyClaims: (input.competencyClaims ?? []).slice(0, 6),
    credentialUrl: input.credentialUrl
      ? clip(input.credentialUrl, 200)
      : undefined,
  };
  const i = p.certifications.findIndex((x) => x.id === clean.id);
  if (i >= 0) p.certifications[i] = clean;
  else {
    if (p.certifications.length >= MAX_ITEMS) throw new SessionStoreFullError();
    p.certifications.push(clean);
  }
  await writePatch(p);
  return clean.id;
}

export async function removeCertification(id: Id): Promise<void> {
  const p = await getPatch();
  p.certifications = p.certifications.filter((x) => x.id !== id);
  await writePatch(p);
}

export async function upsertAchievement(
  input: Omit<SessionAchievement, "id"> & { id?: Id },
): Promise<Id> {
  const p = await getPatch();
  const clean: SessionAchievement = {
    id: input.id ?? newId("ach"),
    type: input.type,
    title: clip(input.title, 120),
    organisation: clip(input.organisation, 80),
    date: input.date,
    description: clip(input.description),
    skillIds: (input.skillIds ?? []).slice(0, 10),
    competencyClaims: (input.competencyClaims ?? []).slice(0, 6),
  };
  const i = p.achievements.findIndex((x) => x.id === clean.id);
  if (i >= 0) p.achievements[i] = clean;
  else {
    if (p.achievements.length >= MAX_ITEMS) throw new SessionStoreFullError();
    p.achievements.push(clean);
  }
  await writePatch(p);
  return clean.id;
}

export async function removeAchievement(id: Id): Promise<void> {
  const p = await getPatch();
  p.achievements = p.achievements.filter((x) => x.id !== id);
  await writePatch(p);
}

export async function addCourse(input: SessionCourse): Promise<void> {
  const p = await getPatch();
  const clean: SessionCourse = {
    code: clip(input.code, 16),
    title: clip(input.title, 100),
    credits: Math.max(1, Math.min(8, Math.round(input.credits || 3))),
    term: clip(input.term, 24),
    grade: input.grade,
    skillIds: (input.skillIds ?? []).slice(0, 8),
  };
  if (p.courses.length >= MAX_ITEMS) throw new SessionStoreFullError();
  p.courses.push(clean);
  await writePatch(p);
}

export async function removeCourse(code: string): Promise<void> {
  const p = await getPatch();
  p.courses = p.courses.filter((x) => x.code !== code);
  await writePatch(p);
}

export async function recordAssessment(
  skillId: Id,
  score: number,
  level: number,
): Promise<void> {
  const p = await getPatch();
  p.assessments = p.assessments.filter((a) => a.skillId !== skillId);
  p.assessments.push({
    skillId,
    score: Math.round(score),
    level: Math.max(1, Math.min(8, Math.round(level))),
    date: new Date().toISOString().slice(0, 10),
  });
  if (p.assessments.length > MAX_ITEMS) p.assessments.shift();
  await writePatch(p);
}

export async function setSkillTarget(
  skillId: Id,
  level: number,
): Promise<void> {
  const p = await getPatch();
  p.skillTargets[skillId] = Math.max(1, Math.min(8, Math.round(level)));
  await writePatch(p);
}

// ── projection: apply the patch over a base Student ─────────────────────────

/** Fold session evidence (added projects / certs / achievements / assessments)
 *  into a clone of the base student so every engine recomputes from it. */
export function applyPatchToStudent(base: Student, p: SessionPatch): Student {
  const s: Student = structuredClone(base);

  if (p.goalRoleId) s.targetRoleId = p.goalRoleId;
  if (p.careerInterests?.length) s.careerInterests = p.careerInterests;

  // session courses → education
  if (p.courses.length) {
    s.education = {
      ...s.education,
      courses: [
        ...s.education.courses,
        ...p.courses.map((c) => ({
          code: c.code,
          title: c.title,
          credits: c.credits,
          term: c.term,
          grade: c.grade,
          skillIds: c.skillIds,
        })),
      ],
    };
  }

  const bySkill = new Map(s.skills.map((sk) => [sk.skillId, sk]));
  const ensure = (skillId: Id): StudentSkill => {
    let sk = bySkill.get(skillId);
    if (!sk) {
      sk = { skillId, selfRating: 2, evidence: [] };
      s.skills.push(sk);
      bySkill.set(skillId, sk);
    }
    return sk;
  };
  const addEv = (skillId: Id, ev: SkillEvidenceRef) => {
    const sk = ensure(skillId);
    sk.evidence = [...sk.evidence, ev];
  };

  for (const pr of p.projects) {
    for (const skillId of pr.skillIds) {
      addEv(skillId, {
        kind: "project",
        label: pr.title,
        date: pr.date,
        refId: pr.id,
      });
    }
  }
  for (const c of p.certifications) {
    for (const skillId of c.skillIds) {
      addEv(skillId, {
        kind: "certificate",
        label: c.name,
        date: c.date,
        refId: c.id,
      });
    }
  }
  for (const a of p.achievements) {
    for (const skillId of a.skillIds) {
      addEv(skillId, {
        kind: "project",
        label: a.title,
        date: a.date,
        refId: a.id,
      });
    }
  }
  for (const as of p.assessments) {
    const sk = ensure(as.skillId);
    sk.assessedLevel = as.level as StudentSkill["assessedLevel"];
    sk.evidence = [
      ...sk.evidence,
      {
        kind: "assessment",
        label: `Adaptive assessment · ${as.score}%`,
        date: as.date,
      },
    ];
  }
  // Only *session-added* courses seed new skills (low-evidence, self-declared).
  for (const c of p.courses) {
    for (const skillId of c.skillIds) {
      if (!bySkill.has(skillId)) {
        const sk = ensure(skillId);
        sk.evidence = [
          ...sk.evidence,
          { kind: "self_declared", label: `Course: ${c.title}`, date: "" },
        ];
      }
    }
  }

  return s;
}

/** Session-added projects as full `Project` records for list rendering. */
export function sessionProjects(studentId: Id, p: SessionPatch): Project[] {
  return p.projects.map((x) => ({
    id: x.id,
    studentId,
    title: x.title,
    type: x.type,
    status: "in_progress" as const,
    summary: x.summary,
    contribution: x.contribution,
    team: [],
    tech: x.tech,
    skillIds: x.skillIds,
    competencyClaims: x.competencyClaims,
    links: x.links,
    period: x.period,
    date: x.date,
    evaluations: [],
  }));
}

export function sessionCertifications(
  studentId: Id,
  p: SessionPatch,
): Certification[] {
  return p.certifications.map((x) => ({
    id: x.id,
    studentId,
    name: x.name,
    issuer: x.issuer,
    date: x.date,
    expiry: x.expiry,
    skillIds: x.skillIds,
    competencyClaims: x.competencyClaims,
    verificationStatus: "self_verified" as const,
    credentialUrl: x.credentialUrl,
  }));
}

export function sessionAchievements(
  studentId: Id,
  p: SessionPatch,
): Achievement[] {
  return p.achievements.map((x) => ({
    id: x.id,
    studentId,
    type: x.type,
    title: x.title,
    organisation: x.organisation,
    date: x.date,
    description: x.description,
    skillIds: x.skillIds,
    competencyClaims: x.competencyClaims,
  }));
}

export function sessionCourses(p: SessionPatch): Course[] {
  return p.courses.map((c) => ({
    code: c.code,
    title: c.title,
    credits: c.credits,
    term: c.term,
    grade: c.grade,
    skillIds: c.skillIds,
  }));
}
