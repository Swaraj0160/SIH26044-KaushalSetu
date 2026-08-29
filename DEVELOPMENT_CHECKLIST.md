# DEVELOPMENT_CHECKLIST

## Setup phase (2026-08-30)

- [x] Environment verified — OS, Node 24.11.0, npm 11.6.1, Git 2.55.0, Docker, Python
- [x] Git verified — repo initialised on `main`, identity configured
- [ ] GitHub verified — **`gh` not installed / no remote** (see `SETUP_STATUS.md` → ACTION REQUIRED)
- [x] Vercel verified — CLI 59.10.0 installed, authenticated as `swaraj0160`
- [x] Node verified — local `24.11.0` matches Vercel `24.x`; pinned via `.nvmrc` + `engines`
- [x] Project initialized — Next.js 16.3.3, App Router, TS strict, Tailwind v4
- [x] Dependencies installed — small tree; `package-lock.json` committed
- [x] Environment validation — `lib/env.ts` (`@t3-oss/env-nextjs` + Zod), boots with no config
- [x] AI abstraction — `AiProvider` + `MockAiProvider` (default) + `GeminiAiProvider` (scaffold)
- [x] Database architecture — Drizzle + `postgres.js` (lazy), placeholder schema, migration generated
- [x] Testing — Vitest (unit, 8 passing) + Playwright (Chromium installed, 3 e2e passing)
- [x] Lint — `npm run lint` passes (ESLint flat config)
- [x] Typecheck — `npm run typecheck` passes
- [x] Build — `npm run build` passes; `/`, `/health`, `/api/health`
- [ ] GitHub push — **blocked on GitHub CLI / remote** (Phase 14)
- [x] Vercel readiness — CLI + auth OK, `vercel.json` added, local prod build green

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
