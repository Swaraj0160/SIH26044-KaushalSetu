# SETUP_STATUS

Environment inspection for **SIH26044 — KaushalSetu**.
Generated during the setup phase on **2026-08-30**; updated in the pre-flight
phase the same day (GitHub connected, Vercel linked, `gh` installed).
See `PREFLIGHT_COMPLETE.md` for the consolidated readiness matrix.

## 1. Machine

| Item              | Value                                             |
| ----------------- | ------------------------------------------------- |
| OS                | Windows 11 Home Single Language, build 10.0.26200 |
| Shell used        | Git Bash (MINGW64) + PowerShell                   |
| Working directory | `C:\Users\asus\Desktop\SIH\SIH26044-KaushalSetu`  |
| Free disk (C:)    | ~577 GB free of 925 GB                            |

## 2. Toolchain

| Tool              | Version  | Status                                                              |
| ----------------- | -------- | ------------------------------------------------------------------- |
| Node.js           | v24.11.0 | OK — matches Vercel's current `24.x` runtime                        |
| npm               | 11.6.1   | OK (package manager for this repo)                                  |
| Git               | 2.55.0   | OK                                                                  |
| Python            | 3.12.7   | OK (not required by the app)                                        |
| Docker            | 29.6.2   | OK (available, not required yet)                                    |
| corepack          | 0.34.0   | Available                                                           |
| GitHub CLI (`gh`) | 2.98.0   | Installed via winget; not `gh auth`-logged (git push works via GCM) |
| Vercel CLI        | 59.10.0  | Installed globally; authenticated as `swaraj0160`                   |
| pnpm              | —        | Not installed (npm is used; not needed)                             |
| tsx               | 4.23.x   | Added — runs `scripts/seed.ts`                                      |

## 3. Repository

| Item              | Value                                                                     |
| ----------------- | ------------------------------------------------------------------------- |
| Git repo          | Initialised on branch `main`                                              |
| Remote            | `origin` → `https://github.com/Swaraj0160/SIH26044-KaushalSetu` (private) |
| Remote state      | Was **empty**; setup commit pushed. `main` tracks `origin/main`           |
| Git identity      | `Swaraj Ingale <swaraj0160@gmail.com>` (global config)                    |
| Credential helper | Git Credential Manager (`manager`) — has a cached github.com credential   |

## 4. Authentication

| Service           | Status                                                                    |
| ----------------- | ------------------------------------------------------------------------- |
| Vercel CLI        | **Authenticated** as `swaraj0160`; project `sih26044-kaushalsetu` linked  |
| GitHub (git)      | **Working** — HTTPS push/pull succeed via Git Credential Manager          |
| GitHub (`gh` CLI) | **Not logged in** — optional; run `gh auth login` for PR/issue automation |

No credentials, tokens, or secrets were printed, stored, or committed.
`.env.local` and `.vercel/` (both containing a short-lived Vercel OIDC token) are
git-ignored and untracked.

## 5. Application build (setup scaffold)

| Check                           | Result                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| `npm run lint`                  | PASS                                                                                          |
| `npm run typecheck`             | PASS                                                                                          |
| `npm run test` (Vitest)         | PASS — 8/8                                                                                    |
| `npm run test:e2e` (Playwright) | PASS — 3/3 (Chromium)                                                                         |
| `npm run build` (Next 16)       | PASS — routes: `/`, `/health`, `/api/health`                                                  |
| `/api/health` live probe        | 200 — `database: not_configured`, `ai: mock`                                                  |
| `npm run db:generate`           | PASS — produced `drizzle/0000_init_health_check.sql` offline                                  |
| `npm run db:seed`               | PASS — graceful no-op without `DATABASE_URL`                                                  |
| `vercel build` (local, Windows) | Compiles fully; fails only on a Windows symlink `EPERM` step (OS limitation, not the project) |

## 6. ACTION REQUIRED (your manual steps)

Nothing blocks the master build phase. The remaining manual items are all about
providing **future credentials**:

1. **Supabase** — create a project, then set in `.env.local` (local) and the
   Vercel project (deploy): `DATABASE_URL`, `DIRECT_URL`,
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`. Template in `.env.example`.
2. **Gemini** — when ready, set `GEMINI_API_KEY` and `AI_PROVIDER=gemini`. Until
   then the app uses the deterministic mock provider.
3. **`gh auth login`** _(optional)_ — only needed if you want Claude to open PRs /
   issues from the CLI. Plain `git push`/`pull` already work.
4. **Windows Developer Mode** _(optional)_ — enables local `vercel build`
   (symlink step). Not needed for real deploys.

Done during pre-flight (no action needed): `gh` installed, GitHub remote
connected + setup commit pushed, Vercel CLI authenticated, Vercel project linked
to the GitHub repo.
