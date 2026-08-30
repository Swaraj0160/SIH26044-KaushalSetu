/**
 * Demo personas + role→home routing. Pure data (no cookies, no server-only) so
 * both server and client code can read persona labels and home paths.
 */

import { getDataset } from "@/lib/demo/dataset";
import type { Id, Role } from "@/lib/domain/types";

export interface Persona {
  key: string;
  role: Role;
  name: string;
  subtitle: string;
  refId: Id;
  blurb: string;
}

export const PERSONAS: Persona[] = [
  {
    key: "student-aarav",
    role: "student",
    name: "Aarav Sharma",
    subtitle: "B.Tech CSE · COEP",
    refId: "stu-aarav",
    blurb:
      "Strong ML fundamentals, an active internship, and a clear deployment gap. The main student walkthrough.",
  },
  {
    key: "student-ananya",
    role: "student",
    name: "Dr. Ananya Nair",
    subtitle: "BAMS · AIIA",
    refId: "stu-ananya",
    blurb:
      "The Ministry of Ayush angle: a BAMS graduate moving into industry QA, with classical strengths and GMP/lab gaps.",
  },
  {
    key: "recruiter-rohan",
    role: "recruiter",
    name: "Rohan Mehta",
    subtitle: "Head of Talent · VedaLabs AI",
    refId: "rec-persona",
    blurb:
      "Hiring an ML Engineer intern. Sees an explainable, evidence-weighted candidate ranking — not a keyword ATS.",
  },
  {
    key: "faculty-meera",
    role: "faculty",
    name: "Prof. Meera Krishnan",
    subtitle: "Associate Professor & Industry Relations Chair · COEP",
    refId: "fac-persona",
    blurb:
      "Runs an active live-project collaboration and verifies student evidence.",
  },
  {
    key: "institution-rao",
    role: "institution_admin",
    name: "Dr. S. Rao",
    subtitle: "Placement & Competency Intelligence Cell · COEP",
    refId: "inst-coep",
    blurb:
      "The academia-facing centrepiece: department readiness, the skill heatmap, and systemic gap analytics.",
  },
  {
    key: "admin-super",
    role: "super_admin",
    name: "Platform Administrator",
    subtitle: "KaushalSetu · governance",
    refId: "super",
    blurb:
      "Taxonomy, employer verification, matching-weight configuration, audit log.",
  },
];

export const personaByKey = new Map(PERSONAS.map((p) => [p.key, p]));

export function homePathFor(role: Role): string {
  return {
    student: "/student",
    recruiter: "/industry",
    faculty: "/faculty",
    institution_admin: "/institution",
    super_admin: "/admin",
  }[role];
}

export function personaEmployerId(persona: { role: Role; refId: Id }): Id {
  const d = getDataset();
  if (persona.role === "recruiter") {
    return d.recruiterById.get(persona.refId)?.employerId ?? "emp-vedalabs";
  }
  throw new Error("Not a recruiter persona");
}

export function personaInstitutionId(persona: { role: Role; refId: Id }): Id {
  if (persona.role === "institution_admin") return persona.refId;
  if (persona.role === "faculty") {
    return (
      getDataset().facultyById.get(persona.refId)?.institutionId ?? "inst-coep"
    );
  }
  throw new Error("Persona has no institution");
}

export function actingStudentId(persona: { role: Role; refId: Id }): Id {
  if (persona.role !== "student") throw new Error("Not a student persona");
  return persona.refId;
}
