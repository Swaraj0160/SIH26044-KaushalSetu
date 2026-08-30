/**
 * Builds the per-request `StudentCtx` from the current viewer's session edits
 * (career goal, added projects / certifications / achievements, assessment
 * results). Student pages pass the result into the `lib/data` view-models so
 * every deterministic engine recomputes from the edited state.
 *
 * If the viewer has made no edits, this returns `{}` and the data layer falls
 * straight through to the base synthetic dataset — identical behaviour.
 */

import "server-only";

import type { StudentCtx } from "@/lib/data";
import { getDataset } from "@/lib/demo/dataset";
import {
  applyPatchToStudent,
  getPatch,
  sessionAchievements,
  sessionCertifications,
  sessionProjects,
  type SessionPatch,
} from "@/lib/session-store";

function isEmpty(p: SessionPatch): boolean {
  return (
    !p.goalRoleId &&
    !p.careerInterests?.length &&
    p.projects.length === 0 &&
    p.certifications.length === 0 &&
    p.achievements.length === 0 &&
    p.courses.length === 0 &&
    p.assessments.length === 0 &&
    Object.keys(p.skillTargets).length === 0
  );
}

export async function getStudentCtx(studentId: string): Promise<StudentCtx> {
  const patch = await getPatch();
  if (isEmpty(patch)) return {};

  const d = getDataset();
  const base = d.studentById.get(studentId);
  if (!base) return {};

  return {
    student: applyPatchToStudent(base, patch),
    projects: [
      ...d.projects.filter((p) => p.studentId === studentId),
      ...sessionProjects(studentId, patch),
    ],
    certifications: [
      ...d.certifications.filter((c) => c.studentId === studentId),
      ...sessionCertifications(studentId, patch),
    ],
    achievements: [
      ...d.achievements.filter((a) => a.studentId === studentId),
      ...sessionAchievements(studentId, patch),
    ],
  };
}

export interface SessionEditSummary {
  goalChanged: boolean;
  addedProjects: number;
  addedCertifications: number;
  addedAchievements: number;
  recordedAssessments: number;
  total: number;
}

export async function getSessionEditSummary(): Promise<SessionEditSummary> {
  const p = await getPatch();
  const total =
    (p.goalRoleId ? 1 : 0) +
    p.projects.length +
    p.certifications.length +
    p.achievements.length +
    p.assessments.length +
    p.courses.length;
  return {
    goalChanged: Boolean(p.goalRoleId),
    addedProjects: p.projects.length,
    addedCertifications: p.certifications.length,
    addedAchievements: p.achievements.length,
    recordedAssessments: p.assessments.length,
    total,
  };
}
