import { redirect } from "next/navigation";

import { getPersona, homePathFor, type Persona } from "@/lib/session";
import type { Role } from "@/lib/domain/types";

/** Require a persona with one of the given roles, else bounce to their own home. */
export async function requireRole(...roles: Role[]): Promise<Persona> {
  const persona = await getPersona();
  if (!persona) redirect("/demo");
  if (!roles.includes(persona.role)) redirect(homePathFor(persona.role));
  return persona;
}

export async function currentStudentId(): Promise<string> {
  const persona = await requireRole("student");
  return persona.refId;
}
