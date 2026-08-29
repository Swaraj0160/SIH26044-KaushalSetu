"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { recordApplied } from "@/lib/applied";
import { setOverride } from "@/lib/overrides";
import { DEMO_COOKIE, homePathFor, personaByKey } from "@/lib/session";

export async function enterDemoAs(formData: FormData) {
  const key = String(formData.get("persona") ?? "");
  const persona = personaByKey.get(key);
  if (!persona) redirect("/demo");
  const jar = await cookies();
  jar.set(DEMO_COOKIE, key, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect(homePathFor(persona.role));
}

export async function exitDemo() {
  const jar = await cookies();
  jar.delete(DEMO_COOKIE);
  redirect("/");
}

export async function applyToOpportunity(formData: FormData) {
  const id = String(formData.get("opportunityId") ?? "");
  if (id) await recordApplied(id);
  revalidatePath("/student", "layout");
}

export async function setOverrideAction(formData: FormData) {
  const key = String(formData.get("key") ?? "");
  const value = String(formData.get("value") ?? "");
  const revalidate = String(formData.get("revalidate") ?? "/");
  if (key) await setOverride(key, value);
  revalidatePath(revalidate, "layout");
}
