/**
 * Assembled, memoised demo dataset + lookup indexes.
 *
 * This is the single in-memory "database" the demo build runs on. It is
 * deterministic (seeded) and fully synthetic — the UI labels it as such.
 * A production build swaps this module for Drizzle-backed queries behind the
 * same `lib/data` interface.
 */

import { generate, type DemoData } from "./generate";
import {
  competencies,
  competencyById,
  learningById,
  learningResources,
  roleById,
  roles,
  skillById,
  skillCategories,
  skills,
} from "./taxonomy";
import type { Id } from "@/lib/domain/types";

export interface Dataset extends DemoData {
  // taxonomy
  skills: typeof skills;
  skillCategories: typeof skillCategories;
  competencies: typeof competencies;
  roles: typeof roles;
  learningResources: typeof learningResources;
  // indexes
  skillById: typeof skillById;
  competencyById: typeof competencyById;
  roleById: typeof roleById;
  learningById: typeof learningById;
  studentById: Map<Id, DemoData["students"][number]>;
  employerById: Map<Id, DemoData["employers"][number]>;
  institutionById: Map<Id, DemoData["institutions"][number]>;
  departmentById: Map<Id, DemoData["departments"][number]>;
  facultyById: Map<Id, DemoData["faculty"][number]>;
  recruiterById: Map<Id, DemoData["recruiters"][number]>;
  opportunityById: Map<Id, DemoData["opportunities"][number]>;
  credentialById: Map<Id, DemoData["credentials"][number]>;
}

let cache: Dataset | null = null;

export function getDataset(): Dataset {
  if (cache) return cache;
  const data = generate();

  // Fill education.institution / department (generator only knows ids).
  const instName = new Map(data.institutions.map((i) => [i.id, i.name]));
  const deptName = new Map(data.departments.map((d) => [d.id, d.name]));
  for (const s of data.students) {
    s.education.institution = instName.get(s.institutionId) ?? "—";
    s.education.department = deptName.get(s.departmentId) ?? "—";
  }

  cache = {
    ...data,
    skills,
    skillCategories,
    competencies,
    roles,
    learningResources,
    skillById,
    competencyById,
    roleById,
    learningById,
    studentById: new Map(data.students.map((s) => [s.id, s])),
    employerById: new Map(data.employers.map((e) => [e.id, e])),
    institutionById: new Map(data.institutions.map((i) => [i.id, i])),
    departmentById: new Map(data.departments.map((d) => [d.id, d])),
    facultyById: new Map(data.faculty.map((f) => [f.id, f])),
    recruiterById: new Map(data.recruiters.map((r) => [r.id, r])),
    opportunityById: new Map(data.opportunities.map((o) => [o.id, o])),
    credentialById: new Map(data.credentials.map((c) => [c.id, c])),
  };
  return cache;
}

/** Test/debug helper. */
export function resetDataset(): void {
  cache = null;
}
