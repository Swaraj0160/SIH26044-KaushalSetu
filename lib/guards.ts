import { redirect } from "next/navigation";

import { homePathFor, type Persona } from "@/lib/auth/personas";
import { getPersona } from "@/lib/auth/session";
import type { Role } from "@/lib/domain/types";

/** Require a signed-in session with one of the given roles. */
export async function requireRole(...roles: Role[]): Promise<Persona> {
  const persona = await getPersona();
  if (!persona) redirect("/login");
  if (!roles.includes(persona.role)) redirect(homePathFor(persona.role));
  return persona;
}

export async function currentStudentId(): Promise<string> {
  const persona = await requireRole("student");
  return persona.refId;
}
