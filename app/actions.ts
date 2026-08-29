"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { recordApplied } from "@/lib/applied";
import { demoAuth } from "@/lib/auth/demo-provider";
import { homePathFor, personaByKey } from "@/lib/auth/personas";
import { createSession, destroySession } from "@/lib/auth/session";
import { setOverride } from "@/lib/overrides";

export interface SignInState {
  error?: string;
}

/** Manual sign-in (username + password). Used by the /login form. */
export async function signIn(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const identifier = String(formData.get("identifier") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!identifier || !password)
    return { error: "Enter a username and password." };
  const user = await demoAuth.signIn(identifier, password);
  if (!user) return { error: "Invalid demo credentials." };
  await createSession(user);
  redirect(homePathFor(user.role));
}

/** One-click "continue as …" from the sign-in screen or judge-demo picker. */
export async function signInAs(formData: FormData) {
  const personaKey = String(formData.get("persona") ?? "");
  const user = await demoAuth.signInPersona(personaKey);
  if (!user) redirect("/login");
  await createSession(user);
  redirect(homePathFor(user.role));
}

export async function signOut() {
  await destroySession();
  redirect("/");
}

// Back-compat aliases for the judge-demo picker (/demo) and shell "exit".
export async function enterDemoAs(formData: FormData) {
  const key = String(formData.get("persona") ?? "");
  if (!personaByKey.has(key)) redirect("/demo");
  return signInAs(formData);
}
export const exitDemo = signOut;

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
