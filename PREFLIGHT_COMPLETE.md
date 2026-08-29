# PREFLIGHT_COMPLETE

Pre-flight for **SIH26044 — KaushalSetu**, completed **2026-08-30**.
Product development has **not** started. This file is the single source of truth
for what is ready and what still needs you.

Legend: **READY** · **NOT CONFIGURED** (deferred, needs future credentials) ·
**ACTION REQUIRED** (needs you now) · **BLOCKED**

## Readiness matrix

| Area                  | State              | Notes                                                                                                                                                                                                         |
| --------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Environment / machine | **READY**          | Windows 11 (26200), Git Bash + PowerShell, ~573 GB free                                                                                                                                                       |
| Node.js               | **READY**          | v24.11.0 local = Vercel `24.x`; pinned via `.nvmrc` + `engines >=20.9`                                                                                                                                        |
| npm                   | **READY**          | 11.6.1; `package-lock.json` committed; `npm ci` used by CI                                                                                                                                                    |
| Git                   | **READY**          | Repo on `main`; `.gitattributes` normalises EOL; clean tree                                                                                                                                                   |
| GitHub                | **READY**          | `gh` 2.98.0 installed; `origin` → `github.com/Swaraj0160/SIH26044-KaushalSetu` (private); setup commit pushed; `main` tracks `origin/main`. `gh auth login` still pending (optional, for PR/issue automation) |
| Vercel                | **READY**          | CLI 59.10.0, authed `swaraj0160`; project `sih26044-kaushalsetu` linked + connected to the GitHub repo; `vercel.json` minimal                                                                                 |
| Local prod build      | **READY**          | `npm run build` green (Next 16.3.3, Turbopack); routes `/`, `/health`, `/api/health`                                                                                                                          |
| Vercel build (cloud)  | **READY**          | Compatible — same `next build`. Local `vercel build` on Windows stops at a symlink `EPERM` (OS limitation only)                                                                                               |
| Database architecture | **READY**          | Drizzle + `postgres.js`, lazy client (`getDb()`), `prepare:false` + `max:1` for Supabase pooler; placeholder schema; migration `0000` generated; `db:generate/migrate/push/seed/studio` scripts               |
| Database (live)       | **NOT CONFIGURED** | No `DATABASE_URL` yet. App boots fine; DB calls throw a clear error. Needs a Supabase project                                                                                                                 |
| Supabase Auth         | **READY** (arch)   | Browser + server `@supabase/ssr` clients in `lib/auth/`; middleware/guards are master-phase                                                                                                                   |
| Supabase Storage      | **READY** (arch)   | Server-only admin client (`import "server-only"`), bucket names defined; buckets/RLS are master-phase                                                                                                         |
| Supabase (live)       | **NOT CONFIGURED** | Needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`                                                                                                                |
| AI abstraction        | **READY**          | `AiProvider` + `MockAiProvider` (default, deterministic, offline) + `GeminiAiProvider` (typed scaffold) + factory with fallback                                                                               |
| AI (Gemini live)      | **NOT CONFIGURED** | Needs `GEMINI_API_KEY` + `AI_PROVIDER=gemini`. Runs on mock until then                                                                                                                                        |
| Env management        | **READY**          | `lib/env.ts` (`@t3-oss/env-nextjs` + Zod); all vars optional for boot; `SKIP_ENV_VALIDATION` honoured; `.env.example` present; `.env*` git-ignored                                                            |
| Environments          | **READY**          | `NODE_ENV` dev/test/production distinguished; Vercel preview vs production via dashboard env scoping                                                                                                          |
| Testing — unit        | **READY**          | Vitest 4, 8/8 passing; jsdom default, `@vitest-environment node` for server-only                                                                                                                              |
| Testing — e2e         | **READY**          | Playwright 1.62, Chromium installed, 3/3 passing (health API, home, health page)                                                                                                                              |
| Lint / format         | **READY**          | ESLint flat config (`eslint-config-next`) + Prettier; both clean; generated dirs ignored                                                                                                                      |
| TypeScript            | **READY**          | strict; `tsc --noEmit` clean; `next.config.ts` fails build on type errors                                                                                                                                     |
| Security baseline     | **READY**          | No secrets tracked; client/server split enforced; `SECURITY.md` covers authn/authz, rate limiting, uploads, audit logging (honestly marked planned)                                                           |
| Health system         | **READY**          | `/api/health` (JSON) + `/health` (page); reports app/db/supabase/AI status; no secrets exposed; works with no credentials; 503 only when a configured DB is unreachable                                       |
| CI                    | **READY**          | `.github/workflows/ci.yml`: lint → typecheck → test → build on push/PR to `main`                                                                                                                              |
| Docs                  | **READY**          | README, SETUP_STATUS, STACK_DECISION, SECURITY, DEVELOPMENT, CLAUDE, DEVELOPMENT_CHECKLIST, this file                                                                                                         |
| Autonomy config       | **READY**          | `CLAUDE.md` has mission, product principle, engineering / security / research / git / deployment / AI / testing rules, autonomous-dev rules, destructive-op stop conditions                                   |

## ACTION REQUIRED (you, now — none are blocking the master build)

1. **Supabase project** — create it; put the connection + keys in `.env.local`
   (local) and the Vercel project's env settings (deploy):
   `DATABASE_URL` (pooled, 6543), `DIRECT_URL` (direct, 5432),
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`.
2. **Gemini API key** — when you want real AI: set `GEMINI_API_KEY` and
   `AI_PROVIDER=gemini` (local + Vercel). Provide the key when you're ready.
3. _(optional)_ `gh auth login` — for CLI-driven PRs/issues. `git push`/`pull`
   already work via Git Credential Manager.
4. _(optional)_ Enable **Windows Developer Mode** to make local `vercel build`
   succeed. Not needed for real deployments.

## NOT CONFIGURED YET (deliberate — future credentials or product phase)

- Live PostgreSQL / Supabase connection, Auth session wiring, Storage buckets + RLS.
- Real Gemini integration (`@google/genai` not installed by design).
- Domain schema and every product surface (dashboards, competency graph, matching
  engine, assessments, analytics, credential system, landing page).
- Production deployment (waits on Supabase env + master build).
- Security headers, middleware, rate limiter, audit log table (master build).

## VALIDATION (this pre-flight run)

| Check          | Result                                                         |
| -------------- | -------------------------------------------------------------- |
| Git            | PASS — `main` clean, tracks `origin/main`                      |
| GitHub         | PASS — remote connected, commit pushed, private repo unchanged |
| Vercel         | PASS — authed + project linked (no deployment performed)       |
| Lint           | PASS                                                           |
| Typecheck      | PASS                                                           |
| Unit tests     | PASS — 8/8                                                     |
| E2E            | PASS — 3/3 (Chromium)                                          |
| Build          | PASS — `next build`                                            |
| Security check | PASS — no secrets tracked; `.env*`, `.vercel/` ignored         |

## GitHub state

- `origin` → `https://github.com/Swaraj0160/SIH26044-KaushalSetu.git` (private, pre-existing, was empty)
- `main` → `origin/main`, working tree clean
- Remote contains: source, config, tests, migrations, CI workflow, all docs

## Next phase

**Ready for the SIH26044 Master Build Prompt.**
Do not begin it automatically.
