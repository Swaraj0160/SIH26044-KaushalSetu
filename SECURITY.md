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

## Auth (when enabled)

- Supabase Auth via `@supabase/ssr`. Session refresh via middleware; server-side
  authorization checks on every protected route and Server Action.
- Role model (student / faculty / recruiter / institution admin) enforced both in
  application code and in Postgres RLS policies.

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
