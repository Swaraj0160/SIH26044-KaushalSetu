/**
 * Demo session.
 *
 * The demo build has no real authentication — judges pick a persona and we set a
 * signed-ish cookie. Server components/actions read it and enforce role access.
 * PRODUCTION NOTE: `lib/auth/supabase/*` is the real path; this module is the
 * clearly-labelled demo stand-in and is the only place role identity is read.
 */

import { cookies } from "next/headers";

import { getDataset } from "@/lib/demo/dataset";
import type { Id, Role } from "@/lib/domain/types";

export const DEMO_COOKIE = "ks_persona";

export interface Persona {
  key: string;
  role: Role;
  name: string;
  subtitle: string;
  /** Domain id the persona acts as. */
  refId: Id;
  blurb: string;
}

export const PERSONAS: Persona[] = [
  {
    key: "student-aarav",
    role: "student",
    name: "Aarav Sharma",
    subtitle: "B.Tech CSE · COEP · targeting ML Engineer",
    refId: "stu-aarav",
    blurb:
      "Strong ML fundamentals, an active internship, and a clear deployment gap. The main student walkthrough.",
  },
  {
    key: "student-ananya",
    role: "student",
    name: "Dr. Ananya Nair",
    subtitle: "BAMS · AIIA · targeting Ayurvedic Formulation QA Analyst",
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

export async function getPersona(): Promise<Persona | null> {
  const jar = await cookies();
  const key = jar.get(DEMO_COOKIE)?.value;
  return key ? (personaByKey.get(key) ?? null) : null;
}

export async function requirePersona(): Promise<Persona> {
  const p = await getPersona();
  if (!p) throw new Error("NO_PERSONA");
  return p;
}

/** Resolve the acting student id for a student persona (or throw). */
export function actingStudentId(persona: Persona): Id {
  if (persona.role !== "student") throw new Error("Not a student persona");
  return persona.refId;
}

export function homePathFor(role: Role): string {
  return {
    student: "/student",
    recruiter: "/recruiter",
    faculty: "/faculty",
    institution_admin: "/institution",
    super_admin: "/admin",
  }[role];
}

/** For recruiter persona → the employer they belong to. */
export function personaEmployerId(persona: Persona): Id {
  const d = getDataset();
  if (persona.role === "recruiter") {
    return d.recruiterById.get(persona.refId)?.employerId ?? "emp-vedalabs";
  }
  throw new Error("Not a recruiter persona");
}

export function personaInstitutionId(persona: Persona): Id {
  if (persona.role === "institution_admin") return persona.refId;
  if (persona.role === "faculty") {
    return (
      getDataset().facultyById.get(persona.refId)?.institutionId ?? "inst-coep"
    );
  }
  throw new Error("Persona has no institution");
}
