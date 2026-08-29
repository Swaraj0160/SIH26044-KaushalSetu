# KaushalSetu — SIH26044

**Portal for Academia–Industry Collaboration for Skill Mapping, Internships and Placement.**

- Smart India Hackathon 2026 · Problem Statement **SIH26044** · Category: Software
- Organisation: Ministry of Ayush

## Current status

**Pre-flight complete — the product has not been built yet.**

This repository currently contains a validated development environment only:
a Next.js 16 + TypeScript scaffold with the database, auth, storage, AI-provider
and testing architecture in place, a working health check, and green
lint / typecheck / unit / e2e / build. It is connected to GitHub
(`origin/main`) and linked to a Vercel project. No product features exist yet
(no dashboards, no matching engine, no schema beyond a placeholder table).
See [`PREFLIGHT_COMPLETE.md`](./PREFLIGHT_COMPLETE.md) for the readiness matrix.

The next phase builds the product toward: **competency intelligence + evidence +
skill-gap analysis + guided action + industry matching + verified experience +
institutional intelligence** — not a generic placement portal.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
shadcn/ui · Drizzle ORM + PostgreSQL (Supabase) · Supabase Auth & Storage ·
Zod · React Hook Form · Recharts · Vitest · Playwright · Vercel.

Full rationale: [`STACK_DECISION.md`](./STACK_DECISION.md).

## Quick start

```bash
npm install
cp .env.example .env.local   # every value may stay blank
npm run dev                  # http://localhost:3000
```

The app boots with **no configuration**: deterministic mock AI, no database.
Component status is at [`/health`](http://localhost:3000/health) and
[`/api/health`](http://localhost:3000/api/health).

## Commands

| Command                                            | Purpose                                 |
| -------------------------------------------------- | --------------------------------------- |
| `npm run dev` / `build` / `start`                  | Next.js dev / production build / serve  |
| `npm run lint` / `typecheck` / `format`            | Quality gates                           |
| `npm run test` / `test:e2e`                        | Unit (Vitest) / end-to-end (Playwright) |
| `npm run db:generate` / `db:migrate` / `db:studio` | Drizzle migrations & studio             |

See [`DEVELOPMENT.md`](./DEVELOPMENT.md) for the full list and environment-variable reference.

## Environment variables

Declared and validated in `lib/env.ts`; template in [`.env.example`](./.env.example).
All are optional for local boot. Summary:

- `NEXT_PUBLIC_APP_URL`
- `AI_PROVIDER` (`mock` | `gemini`), `GEMINI_API_KEY`
- `DATABASE_URL`, `DIRECT_URL` (Supabase Postgres)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Deployment plan

Target: **Vercel** (Node 24 runtime), auto-deploy from `main`.
Supabase hosts Postgres, Auth and Storage. Deployment is prepared but the
unfinished product is **not** deployed yet — see `SETUP_STATUS.md` for what is
verified and what still needs manual action.

## Documentation

| File                                                     | Contents                                               |
| -------------------------------------------------------- | ------------------------------------------------------ |
| [`SETUP_STATUS.md`](./SETUP_STATUS.md)                   | Machine, toolchain, auth, build status, action items   |
| [`STACK_DECISION.md`](./STACK_DECISION.md)               | Every technology choice and why                        |
| [`DEVELOPMENT.md`](./DEVELOPMENT.md)                     | Local setup, scripts, structure, DB/AI strategy        |
| [`SECURITY.md`](./SECURITY.md)                           | Secret handling, client/server boundary, validation    |
| [`CLAUDE.md`](./CLAUDE.md)                               | Permanent engineering rules for autonomous development |
| [`DEVELOPMENT_CHECKLIST.md`](./DEVELOPMENT_CHECKLIST.md) | Setup checklist                                        |
| [`PREFLIGHT_COMPLETE.md`](./PREFLIGHT_COMPLETE.md)       | Consolidated readiness matrix + action items           |

## Licence

Prototype developed for Smart India Hackathon 2026. Not for production use.
