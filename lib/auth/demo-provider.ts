import "server-only";

import { PERSONAS, personaByKey } from "@/lib/auth/personas";
import type { AuthProvider, AuthUser } from "@/lib/auth/provider";

/**
 * DEMO authentication for the prototype. Fixed credentials, evaluated only on the
 * server. Clearly labelled "Demo environment" in the UI. NOT production auth.
 */
const CREDENTIALS: Record<string, { password: string; personaKey: string }> = {
  student: { password: "student123", personaKey: "student-aarav" },
  industry: { password: "industry123", personaKey: "recruiter-rohan" },
  faculty: { password: "faculty123", personaKey: "faculty-meera" },
  institution: { password: "institution123", personaKey: "institution-rao" },
  admin: { password: "admin123", personaKey: "admin-super" },
};

/** Public list for the sign-in screen's "continue as…" shortcuts. */
export const DEMO_LOGINS = [
  { username: "student", label: "Student", personaKey: "student-aarav" },
  { username: "industry", label: "Industry", personaKey: "recruiter-rohan" },
  { username: "faculty", label: "Faculty", personaKey: "faculty-meera" },
  {
    username: "institution",
    label: "Institution",
    personaKey: "institution-rao",
  },
  { username: "admin", label: "Admin", personaKey: "admin-super" },
] as const;

function toUser(personaKey: string): AuthUser | null {
  const p = personaByKey.get(personaKey);
  if (!p) return null;
  return {
    id: `demo:${p.key}`,
    role: p.role,
    name: p.name,
    email: `${p.key}@demo.kaushalsetu.in`,
    refId: p.refId,
    personaKey: p.key,
  };
}

export class DemoAuthProvider implements AuthProvider {
  readonly name = "demo" as const;

  async signIn(identifier: string, password: string): Promise<AuthUser | null> {
    const key = identifier.trim().toLowerCase();
    // allow logging in by username OR by persona key (judge-demo selector)
    const cred = CREDENTIALS[key];
    if (cred && cred.password === password) return toUser(cred.personaKey);
    return null;
  }

  /** Judge-demo one-click: no password, resolves a persona key directly. */
  async signInPersona(personaKey: string): Promise<AuthUser | null> {
    return toUser(personaKey);
  }

  async resolveSession(token: string): Promise<AuthUser | null> {
    // token = persona key (opaque to the rest of the app)
    return toUser(token);
  }

  issueSession(user: AuthUser): string {
    return user.personaKey;
  }
}

export const demoAuth = new DemoAuthProvider();
export { PERSONAS };
