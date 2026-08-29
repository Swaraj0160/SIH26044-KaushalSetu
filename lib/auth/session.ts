import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { demoAuth } from "@/lib/auth/demo-provider";
import { personaByKey, type Persona } from "@/lib/auth/personas";
import type { AuthProvider, AuthUser } from "@/lib/auth/provider";

export const SESSION_COOKIE = "ks_session";

/** The active auth provider. Swap to SupabaseAuthProvider here in production. */
export const auth: AuthProvider = demoAuth;

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 8,
};

export async function createSession(user: AuthUser): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, auth.issueSession(user), COOKIE_OPTS);
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return auth.resolveSession(token);
}

/**
 * Back-compat: the app was built around `Persona`. A session resolves to the
 * same persona object, so existing pages keep working unchanged.
 */
export async function getPersona(): Promise<Persona | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? (personaByKey.get(token) ?? null) : null;
}

export async function requireAuth(): Promise<Persona> {
  const p = await getPersona();
  if (!p) redirect("/login");
  return p;
}

export { type Persona };
