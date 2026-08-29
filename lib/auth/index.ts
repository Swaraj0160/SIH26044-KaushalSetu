/**
 * Auth layer.
 *
 * Active in the prototype: **DemoAuthProvider** — fixed server-side credentials,
 * no external service (`demo-provider.ts`). Swap `auth` in `session.ts` to
 * `SupabaseAuthProvider` for production; the UI does not change.
 *
 *   provider.ts          — AuthProvider / AuthUser contract
 *   demo-provider.ts     — demo credentials + one-click persona sign-in
 *   supabase-provider.ts — production scaffold
 *   session.ts           — cookie session, getPersona / getAuthUser, requireAuth
 *   personas.ts          — persona data + role → home routing
 *   supabase/*           — @supabase/ssr browser + server clients (production)
 */

export type { AuthProvider, AuthUser } from "./provider";
export { DEMO_LOGINS } from "./demo-provider";
export {
  auth,
  createSession,
  destroySession,
  getAuthUser,
  getPersona,
  requireAuth,
  SESSION_COOKIE,
} from "./session";
export { PERSONAS, personaByKey, homePathFor, type Persona } from "./personas";

export { createSupabaseServerClient } from "./supabase/server";
export { createSupabaseBrowserClient } from "./supabase/client";
export { isSupabaseConfigured } from "@/lib/env";
