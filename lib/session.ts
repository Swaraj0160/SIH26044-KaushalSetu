/**
 * Back-compat shim. The auth layer now lives in `lib/auth/*`:
 *   - `lib/auth/provider.ts`     — AuthProvider / AuthUser abstraction
 *   - `lib/auth/demo-provider.ts`— fixed demo credentials (server-only)
 *   - `lib/auth/supabase-provider.ts` — production scaffold
 *   - `lib/auth/session.ts`      — cookie session + getPersona/getAuthUser
 *   - `lib/auth/personas.ts`     — persona data + role→home routing
 *
 * Existing imports of `@/lib/session` keep working via these re-exports.
 */

export {
  PERSONAS,
  personaByKey,
  homePathFor,
  personaEmployerId,
  personaInstitutionId,
  actingStudentId,
  type Persona,
} from "@/lib/auth/personas";

export {
  getPersona,
  requireAuth as requirePersona,
  getAuthUser,
  SESSION_COOKIE as DEMO_COOKIE,
} from "@/lib/auth/session";
