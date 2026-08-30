"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  addIntervention,
  advanceIntervention,
  removeIntervention,
} from "@/lib/interventions";
import { getPersona } from "@/lib/auth/session";
import { personaInstitutionId } from "@/lib/session";

export async function recordInterventionAction(
  formData: FormData,
): Promise<void> {
  const persona = await getPersona();
  if (!persona || persona.role !== "institution_admin") redirect("/login");
  const institutionId = personaInstitutionId(persona);

  const departmentId = String(formData.get("departmentId") ?? "");
  const departmentName = String(formData.get("departmentName") ?? "");
  const skillId = String(formData.get("skillId") ?? "");
  const skillName = String(formData.get("skillName") ?? "");
  const action = String(formData.get("action") ?? "").slice(0, 300);
  const cohortSize = Math.max(
    0,
    Math.min(2000, Number(formData.get("cohortSize") ?? 0)),
  );
  const owner = String(
    formData.get("owner") ?? "Placement & Competency Cell",
  ).slice(0, 80);
  if (!skillId || !departmentId || !action) redirect("/institution/heatmap");

  await addIntervention({
    institutionId,
    departmentId,
    departmentName,
    skillId,
    skillName,
    title: `${skillName} — ${departmentName}`,
    action,
    owner,
    cohortSize,
    expectedImpact: `~+${Math.max(4, Math.round(cohortSize / 15))}% department readiness on ${skillName} over one term`,
  });
  revalidatePath("/institution", "layout");
  redirect("/institution/interventions?created=1");
}

export async function advanceInterventionAction(
  formData: FormData,
): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) await advanceIntervention(id);
  revalidatePath("/institution", "layout");
}

export async function removeInterventionAction(
  formData: FormData,
): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) await removeIntervention(id);
  revalidatePath("/institution", "layout");
}
