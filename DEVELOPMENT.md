# DEVELOPMENT

How to run and work on **SIH26044 — KaushalSetu** locally.

## Prerequisites

- Node.js `>= 20.9` (repo targets **Node 24** — see `.nvmrc`; local dev is on
  `24.11.0`, which matches Vercel's current runtime).
- npm `>= 10` (developed with `11.6.1`).
- Optional: Docker (not required), a Supabase project (not required to boot).

## First run

```bash
npm install
cp .env.example .env.local   # all values may stay blank
npm run dev                  # http://localhost:3000
```

With an empty `.env.local` the app runs in **mock mode**: deterministic AI, no
database. Visit `/health` or `/api/health` to see component status.

## Scripts

| Script                     | What it does                                     |
| -------------------------- | ------------------------------------------------ |
| `npm run dev`              | Next dev server                                  |
| `npm run build`            | Production build (Turbopack)                     |
| `npm run start`            | Serve the production build                       |
| `npm run lint`             | ESLint (flat config)                             |
| `npm run lint:fix`         | ESLint with `--fix`                              |
| `npm run typecheck`        | `tsc --noEmit`                                   |
| `npm run format`           | Prettier write                                   |
| `npm run format:check`     | Prettier check (CI)                              |
| `npm run test`             | Vitest (unit) once                               |
| `npm run test:watch`       | Vitest watch mode                                |
| `npm run test:coverage`    | Vitest with v8 coverage                          |
| `npm run test:e2e`         | Playwright (starts `npm run dev` automatically)  |
| `npm run test:e2e:install` | Download Playwright browsers (one-time)          |
| `npm run db:generate`      | Generate a SQL migration from `lib/db/schema.ts` |
| `npm run db:migrate`       | Apply pending migrations                         |
| `npm run db:push`          | Push schema directly (dev only)                  |
| `npm run db:studio`        | Drizzle Studio                                   |

## Environment variables

Defined and validated in `lib/env.ts`. Full list with comments in `.env.example`.

| Variable                        | Scope  | Required?                                | Notes                                                 |
| ------------------------------- | ------ | ---------------------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`           | client | no (defaults to `http://localhost:3000`) | Absolute base URL                                     |
| `AI_PROVIDER`                   | server | no (`mock`)                              | `mock` or `gemini`                                    |
| `GEMINI_API_KEY`                | server | only if `AI_PROVIDER=gemini`             | Falls back to mock if absent                          |
| `DATABASE_URL`                  | server | no                                       | Supabase **pooled** conn (port 6543), `prepare=false` |
| `DIRECT_URL`                    | server | no                                       | Supabase **direct** conn (port 5432), for migrations  |
| `NEXT_PUBLIC_SUPABASE_URL`      | client | no                                       | Supabase project URL                                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | no                                       | Public anon key                                       |
| `SUPABASE_SERVICE_ROLE_KEY`     | server | no                                       | **Server-only.** Bypasses RLS                         |
| `SKIP_ENV_VALIDATION`           | build  | no                                       | Set `1` to skip env validation during image builds    |

## Project structure

```
app/                    routes (App Router)
  api/health/route.ts   machine-readable health probe
  health/page.tsx       human-readable diagnostics page
components/ui/           shadcn/ui components (added on demand)
lib/
  ai/                   AiProvider interface + Mock + Gemini(scaffold) + factory
  auth/                 Supabase server/browser clients
  db/                   Drizzle client (lazy), placeholder schema, health check
  storage/              server-only Supabase admin client (buckets defined later)
  validation/           Zod helpers
  scoring/              deterministic business logic (fills in later)
  utils/                cn() and small helpers
  env.ts               validated environment access
hooks/                  React hooks
types/                  shared types
tests/                  Vitest unit tests + setup
e2e/                    Playwright specs
drizzle/                generated SQL migrations (committed)
scripts/                one-off maintenance / seed scripts
```

## Database connection strategy

1. Create a Supabase project.
2. From **Project Settings → Database**:
   - `DATABASE_URL` = the **Transaction pooler** connection string (port `6543`),
     append `?pgbouncer=true` if the UI provides it; the client already sets
     `prepare: false`.
   - `DIRECT_URL` = the **Direct connection** string (port `5432`).
3. `npm run db:generate` to create a migration, `npm run db:migrate` to apply.
4. `npm run db:seed` to insert baseline rows (safe to re-run).
5. `GET /api/health` will then report `database: "ok"` with a latency figure.

Standalone scripts (`drizzle.config.ts`, `scripts/seed.ts`) load `.env.local`
then `.env` via `scripts/load-env.ts` (Next.js loads `.env.local` on its own).

Until step 1, everything still runs; DB-backed features throw a clear
"DATABASE_URL is not set" error rather than failing at startup.

## Migrations & seed

| Command               | Effect                                                            |
| --------------------- | ----------------------------------------------------------------- |
| `npm run db:generate` | Diff `lib/db/schema.ts` → new SQL file in `drizzle/`              |
| `npm run db:migrate`  | Apply pending migrations (uses `DIRECT_URL`)                      |
| `npm run db:push`     | Push schema without a migration file — **dev throwaway DBs only** |
| `npm run db:seed`     | Run `scripts/seed.ts` — idempotent, no-ops without `DATABASE_URL` |
| `npm run db:studio`   | Browse data in Drizzle Studio                                     |

Migrations in `drizzle/` are committed. Never edit an already-applied migration —
add a new one.

## AI provider

- Default `mock`: `MockAiProvider` — deterministic, offline, no key.
- To use Gemini later: `npm i @google/genai`, implement `lib/ai/gemini-provider.ts`,
  set `AI_PROVIDER=gemini` and `GEMINI_API_KEY`. No other code changes.

## Troubleshooting / recovery

### The database is unavailable

- Expected before Supabase is configured. The app still boots; `/api/health`
  reports `database: "not_configured"`; DB calls throw
  `"DATABASE_URL is not set"`.
- If it _was_ working: check the Supabase project isn't paused, verify
  `DATABASE_URL` (pooler, 6543) and `DIRECT_URL` (direct, 5432), confirm
  `prepare: false` is still set in `lib/db/index.ts` (required behind PgBouncer).
- Migrations failing with prepared-statement errors → you're pointing
  `db:migrate` at the pooler; it must use `DIRECT_URL`.

### Gemini is unavailable

- No key, quota exhausted, or API error → set `AI_PROVIDER=mock` (or just unset
  `GEMINI_API_KEY`). The factory falls back to mock automatically when the key is
  missing; for quota/errors, flip the env var and redeploy.
- Never block a user flow on a live AI call — degrade to mock or a cached result.

### Vercel deployment fails

- **Build error:** reproduce locally with `npm run build`. If that's green, check
  the Vercel build log for a missing env var (see below).
- **`vercel build` fails locally on Windows** with `EPERM ... symlink`: this is a
  known Windows limitation, not a project problem. Use `npm run build` locally;
  the Linux build servers handle symlinks fine. (Enabling Windows Developer Mode
  also fixes local `vercel build`.)
- **Runtime 500s after deploy:** almost always a missing/incorrect env var in the
  Vercel project settings, or a DB call from an Edge runtime (keep DB routes on
  `runtime = "nodejs"`).
- Roll back from the Vercel dashboard (Deployments → previous → Promote); never
  force-push to "fix" a deploy.

### Environment variables are missing

- `lib/env.ts` validates on boot and prints exactly which vars are wrong.
- All vars are optional for local dev — a missing one degrades a feature, it does
  not crash startup.
- Container/CI image builds that shouldn't need real values: set
  `SKIP_ENV_VALIDATION=1`.
- Never hardcode a value to get past validation; add it to `.env.local` (local)
  or the Vercel dashboard (deployed).

## Testing

- **Unit** (`tests/`): default environment is `jsdom`. Files that touch
  server-only env must start with `/** @vitest-environment node */`.
- **E2E** (`e2e/`): `npm run test:e2e`. First run needs
  `npm run test:e2e:install` to fetch browsers.

## Deployment (readiness only — do not deploy the unfinished product)

- Vercel CLI installed and authenticated as `swaraj0160` (`vercel whoami`).
- Project **linked**: `swaraj0160s-projects/sih26044-kaushalsetu`, connected to
  the GitHub repo. `.vercel/` holds the project id and is git-ignored.
- `vercel pull --yes --environment=preview` refreshes local project settings +
  `.vercel/.env.preview.local` (git-ignored).
- Set real env vars in the Vercel dashboard (encrypted), not via CLI flags.
- `vercel.json` pins `framework: nextjs` and enables deploys from `main`.
- Local production build (`npm run build`) is green. Once `main` is pushed,
  Vercel auto-builds; PRs get preview deployments.
- **Before a production deploy:** set `DATABASE_URL`, `DIRECT_URL`,
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` (and `GEMINI_API_KEY` if using Gemini) in the
  Vercel project — see `PREFLIGHT_COMPLETE.md` → ACTION REQUIRED.
