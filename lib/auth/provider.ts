/**
 * Authentication abstraction.
 *
 * The app depends only on `AuthProvider` + `AuthUser`. The prototype uses
 * `DemoAuthProvider` (fixed server-side credentials, no external service). A
 * `SupabaseAuthProvider` can replace it later without any UI change — same
 * interface, same `AuthUser` shape.
 */

import type { Id, Role } from "@/lib/domain/types";

export interface AuthUser {
  /** stable id for the account */
  id: string;
  role: Role;
  name: string;
  email: string;
  /** the domain record this account acts as (student / recruiter / …) */
  refId: Id;
  /** persona key kept for the judge-demo narrative selector */
  personaKey: string;
}

export interface AuthProvider {
  readonly name: "demo" | "supabase";
  /** Returns the user for valid credentials, else null. */
  signIn(identifier: string, password: string): Promise<AuthUser | null>;
  /** Resolves a session token (opaque string) to a user, else null. */
  resolveSession(token: string): Promise<AuthUser | null>;
  /** Mints the session token stored in the cookie for a signed-in user. */
  issueSession(user: AuthUser): string;
}
