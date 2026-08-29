# CLAUDE.md — permanent development rules

Read this at the start of every session. It governs how work is done in this
repository.

## Mission

Build a world-class SIH26044 prototype: **KaushalSetu**, a portal for
academia–industry collaboration on skill mapping, internships and placement.

## Product principle

This is **NOT** a generic placement portal. The product must evolve toward:

> Competency Intelligence + Evidence + Skill Gap + Action + Industry Matching +
> Verified Experience + Institutional Intelligence

Every feature should ladder up to one of those. If a feature is just "job board
CRUD", reconsider it.

## Engineering rules

- Production quality. TypeScript strict. No `any` escape hatches without a
  written reason.
- No fake functionality. No dead buttons. No dead navigation. Every control does
  what it says.
- No secrets in source or git. Server-only secrets stay server-side.
- No unnecessary dependencies. Justify each addition; prefer the standard library
  and what is already installed.
- No fabricated data presented as real. Clearly label all demo / synthetic data
  in the UI.
- Business logic (scoring, gap analysis, ranking) is **deterministic** and lives
  in `lib/scoring/` as pure, unit-tested functions. AI may explain a result; it
  must never silently be the result.
- AI is used where it adds real value, behind the `AiProvider` interface. The app
  must always run with `AI_PROVIDER=mock` and no keys.
- Accessible (semantic HTML, keyboard, contrast), responsive, secure, testable,
  deployable.
- Keep `main` deployable at all times. Keep the app runnable after every change.

## Research rules

When a factual claim is required:

- Prefer official / primary sources.
- Distinguish established fact from inference — say which is which.
- Do **not** fabricate SIH details, government statistics, scheme names, or
  organisational facts.
- Do **not** claim an integration exists unless it is actually wired up.

## Security rules

- Secrets never enter source or git. Only `NEXT_PUBLIC_*` vars reach the browser.
- `SUPABASE_SERVICE_ROLE_KEY` and any AI key are **server-only**. `lib/storage`
  and other privileged modules use `import "server-only"`.
- All external input is validated with Zod before use (`lib/validation/`).
- Enforce authorization on every protected route / Server Action **and** in
  Postgres RLS. Never trust the client.
- Add security headers (CSP, HSTS, nosniff, frame/referrer policy) centrally
  before serving real data.
- Uploaded files: validate type/size, store in Supabase Storage with per-user
  RLS, serve via short-lived signed URLs, never execute.
- See `SECURITY.md` for the full baseline and the honestly-labelled future work.

## Git rules

- Work on `main` for setup; use short-lived feature branches once the product
  build starts. Keep `main` green and deployable.
- Logical, well-messaged commits. No noise commits, no giant dumps.
- **Never** `git push --force`, `git reset --hard` (without explicit go-ahead),
  rewrite pushed history, or delete branches unexpectedly.
- Never commit `.env`, `.env.local`, `.env.*.local`, `.vercel/`, keys or tokens.
- Remote is `origin` → `https://github.com/Swaraj0160/SIH26044-KaushalSetu` (private).
  Do not change its visibility or create other repos.

## Deployment rules

- Target: **Vercel** (project `sih26044-kaushalsetu`, linked), Node 24, auto-deploy
  from `main`; PRs get preview deployments.
- Env vars are set in the Vercel dashboard (encrypted), never via CLI flags that
  echo values, never committed.
- `npm run build` must pass locally before relying on a deploy.
- Local `vercel build` on Windows fails on a symlink EPERM step — this is an OS
  limitation, not a project fault; the Linux build servers are unaffected.
- Do not deploy a broken `main`. Do not deploy the unfinished product for its own
  sake.

## AI rules

- Product code depends only on the `AiProvider` interface (`lib/ai/`).
- Default provider is `MockAiProvider` (deterministic, offline). The app must
  always work with no AI key.
- `GeminiAiProvider` activates only when `AI_PROVIDER=gemini` and `GEMINI_API_KEY`
  are both present; otherwise the factory falls back to mock.
- AI keys are server-only. AI output is never presented as verified fact and
  never replaces deterministic business logic.

## Testing rules

- After significant changes run: `npm run lint`, `npm run typecheck`,
  `npm run test`, `npm run build` (and `npm run test:e2e` for flows).
- Tests must be real. No assertions that can't fail, no snapshot-only "coverage".
- Unit tests are deterministic and offline (mock AI, no live DB). DB-touching
  logic is tested against a test database or with the query layer mocked.
- Add/extend tests with each feature; keep the smoke e2e passing.

## Autonomous development rules

When given the master build prompt:

- Work through tasks systematically; keep the documentation and checklist current.
- Make reasonable engineering decisions autonomously — do not stop to ask about
  ordinary choices (file layout, naming, which helper to write, minor library
  picks already consistent with `STACK_DECISION.md`).
- Fix errors and keep going rather than halting at the first failure.
- Run `lint`, `typecheck`, `test`, and `build` after significant changes.
- Commit logical milestones with clear messages. Do not create noise commits.

## Destructive-operation rule — STOP and ask first

Before any of:

- deleting substantial code or a feature area
- dropping databases or writing destructive / non-reversible migrations
- `git push --force`, `git reset --hard`, history rewrites, branch deletion
- changing repository visibility
- removing major functionality
- rotating or revoking shared credentials

...stop and get explicit confirmation.

## House facts

- Package manager: **npm**. Node **24** (`.nvmrc`).
- ORM: **Drizzle** (+ drizzle-kit). DB/Auth/Storage: **Supabase**.
- Styling: **Tailwind v4** (CSS-first, tokens in `app/globals.css`), **shadcn/ui**
  via `components.json`.
- Env: everything through `lib/env.ts`; app boots with an empty `.env.local`.
- Health: `/api/health` (JSON) and `/health` (page) must keep working.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
