/**
 * Auth architecture (setup phase)
 * --------------------------------
 * Provider: Supabase Auth via `@supabase/ssr`.
 *
 *   - `./supabase/server`  -> server-side client (RSC / route handlers / actions)
 *   - `./supabase/client`  -> browser client (client components)
 *
 * Session refresh via Next.js middleware and route guards is added in the master
 * build phase, together with the role model (student / faculty / recruiter /
 * institution admin). Nothing here assumes auth is configured — callers get an
 * explicit error when the Supabase env vars are absent.
 */
export { createSupabaseServerClient } from "./supabase/server";
export { createSupabaseBrowserClient } from "./supabase/client";
export { isSupabaseConfigured } from "@/lib/env";
