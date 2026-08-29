# SECURITY

Baseline security rules for **SIH26044 — KaushalSetu**. These apply from the
setup phase onward and are enforced in review.

## Secrets

- **Never** commit secrets. `.gitignore` ignores `.env` and `.env.*` and allows
  only `.env.example` (which contains empty placeholders — no real values).
- Real values go in `.env.local` (git-ignored) locally, and in the Vercel /
  hosting provider's encrypted environment settings in deployed environments.
- Do not pass secrets as CLI flags (they leak into shell history and process
  lists). Use the provider dashboard or an interactive prompt.
- No secret is ever logged, echoed, or returned in an HTTP response body.

## Client vs server boundary

- Only `NEXT_PUBLIC_*` variables may reach the browser. Everything else is
  server-only.
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row-Level Security and is **server-only**.
  `lib/storage/index.ts` is marked `import "server-only"` so any accidental
  client import fails the build.
- The browser Supabase client (`lib/auth/supabase/client.ts`) uses the anon key
  only.
- All environment access is funnelled through `lib/env.ts`; `@t3-oss/env-nextjs`
  throws if server vars are read in a client context.

## Input validation

- All external input (form submissions, route handler bodies, query params,
  webhook payloads) is validated with **Zod** before use. Helpers live in
  `lib/validation/`.
- Business rules (scoring, gap analysis, ranking) are deterministic pure
  functions in `lib/scoring/` — never driven by raw AI output.

## HTTP surface

- The only routes that exist are `/`, `/health`, `/api/health`. No unused or
  speculative endpoints.
- `/api/health` deliberately omits internal error detail (DB error messages are
  kept server-side) and returns `503` only to signal degraded state.
- Secure response headers (CSP, HSTS, `X-Content-Type-Options`, frame options,
  referrer policy) are added centrally in `next.config.ts` / middleware in the
  master build phase, before any real data is served.

## Authentication architecture (planned)

- Supabase Auth via `@supabase/ssr`. Separate browser / server clients already
  exist (`lib/auth/supabase/`).
- Session refresh in Next.js middleware; every protected route, layout and Server
  Action re-checks the session server-side.
- Email/password + OTP to start; OAuth providers added only if needed.

## Authorization architecture (planned)

- **Role model:** `student`, `faculty`, `recruiter`, `institution_admin`,
  `platform_admin`. Role stored on a `profiles` row keyed by `auth.users.id`.
- **Two enforcement layers, both required:**
  1. Application layer — a `requireRole()` / `requireUser()` guard in Server
     Actions and route handlers; UI never the only gate.
  2. Database layer — Postgres **Row-Level Security** policies on every table so a
     leaked/forged client token still cannot read or write another tenant's rows.
- Institution-scoped data is filtered by `institution_id` in RLS, not just in
  queries.
- The service-role key is used only in trusted server jobs that have already done
  their own authorization checks.

## Rate limiting strategy (planned)

- Not implemented in the setup phase (no public mutating endpoints yet).
- Plan: a small fixed-window / token-bucket limiter keyed by IP + user id, backed
  by Postgres (or Upstash Redis if volume warrants), applied in middleware to:
  auth endpoints, AI-invoking routes, file uploads, and any write-heavy API.
- AI routes additionally get a per-user daily quota to bound cost.

## File upload security plan

- Uploads go to **Supabase Storage** buckets (`evidence`, `avatars`), never the
  app server's filesystem.
- Validate on the server: MIME type allow-list, extension check, max size,
  and (for images) dimension / re-encode where practical.
- Per-user path prefixes + Storage RLS so users can only access their own
  objects. Downloads via short-lived **signed URLs**, not public buckets.
- Never serve uploaded content from the app origin in a way that could execute
  (correct `Content-Type`, `Content-Disposition: attachment` for non-images).
- Antivirus / content scanning is out of scope for the prototype — documented as
  a production gap, not silently skipped.

## Audit logging strategy (planned)

- An append-only `audit_log` table: `(id, actor_id, action, subject_type,
subject_id, metadata jsonb, ip, created_at)`.
- Written for security-relevant events: sign-in / sign-out, role changes,
  evidence verification decisions, data exports, admin actions.
- No secrets or full PII payloads in the log — identifiers and action names only.
- Readable only by `platform_admin` (enforced by RLS).

## Dependencies

- Keep the tree small. Add a dependency only when it earns its place.
- `npm audit` is run in review. Current known items:
  - 4 × moderate via `drizzle-kit` → `@esbuild-kit/*` → old `esbuild`
    (GHSA-67mh-4wv8-2f99). **Dev-only CLI**, esbuild dev-server issue not
    reachable through drizzle-kit. Tracked; resolved by `drizzle-kit@1.x` when
    stable. Not auto-fixed (breaking downgrade).
- Lockfile (`package-lock.json`) is committed. CI uses `npm ci`.

## Data honesty

- Any synthetic, seeded, or demo data shown in the UI must be clearly labelled as
  such. No fabricated statistics or fake integrations presented as real.

## Reporting

This is a hackathon prototype, not a production service. For anything sensitive
discovered during development, raise it directly with the team rather than
filing a public issue.
