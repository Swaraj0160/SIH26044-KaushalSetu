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
