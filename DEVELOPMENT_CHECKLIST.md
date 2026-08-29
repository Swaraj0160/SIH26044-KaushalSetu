# DEVELOPMENT_CHECKLIST

## Setup + pre-flight phase (2026-08-30)

- [x] Environment verified — OS, Node 24.11.0, npm 11.6.1, Git 2.55.0, Docker, Python
- [x] Git verified — repo on `main`, identity configured, `.gitattributes` normalises EOL
- [x] GitHub verified — `gh` 2.98.0 installed; remote `origin` connected; setup commit pushed; `main` tracks `origin/main`
- [x] Vercel verified — CLI 59.10.0, authenticated `swaraj0160`, project `sih26044-kaushalsetu` linked to the repo
- [x] Node verified — local `24.11.0` matches Vercel `24.x`; pinned via `.nvmrc` + `engines`
- [x] Project initialized — Next.js 16.3.3, App Router, TS strict, Tailwind v4
- [x] Dependencies installed — small tree; `package-lock.json` committed
- [x] Environment validation — `lib/env.ts` (`@t3-oss/env-nextjs` + Zod), boots with no config; `scripts/load-env.ts` for CLIs
- [x] AI abstraction — `AiProvider` + `MockAiProvider` (default) + `GeminiAiProvider` (scaffold) + factory
- [x] Database architecture — Drizzle + `postgres.js` (lazy), placeholder schema, migration generated, seed script
- [x] Testing — Vitest (unit, 8 passing) + Playwright (Chromium installed, 3 e2e passing)
- [x] Lint — `npm run lint` passes (ESLint flat config)
- [x] Typecheck — `npm run typecheck` passes
- [x] Build — `npm run build` passes; `/`, `/health`, `/api/health`
- [x] GitHub push — setup commit on `origin/main`, working tree clean
- [x] Vercel readiness — CLI + auth OK, project linked, `vercel.json` minimal, local `npm run build` green
- [x] Security check — no secrets tracked; `.env*` / `.vercel/` ignored; `SECURITY.md` updated
- [x] Docs — README, SETUP_STATUS, STACK_DECISION, SECURITY, DEVELOPMENT, CLAUDE, DEVELOPMENT_CHECKLIST, PREFLIGHT_COMPLETE

## Master build phase (not started)

- [ ] Domain research (SIH26044) and information architecture
- [ ] Database schema + RLS policies + storage buckets
- [ ] Auth middleware, role model, route guards
- [ ] Real Gemini provider implementation
- [ ] Competency intelligence / evidence / skill-gap / matching features
- [ ] Institutional analytics
- [ ] Full accessibility + responsive pass
- [ ] E2E coverage of critical flows
- [ ] Production deployment to Vercel
