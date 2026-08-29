# STACK_DECISION

Final technology decisions for **SIH26044 — KaushalSetu**, made during the setup
phase (2026-08-30) after checking current stable releases and cross-compatibility.

## Summary

| Concern          | Choice                                                                     | Installed version               |
| ---------------- | -------------------------------------------------------------------------- | ------------------------------- |
| Framework        | Next.js (App Router)                                                       | `16.3.3`                        |
| UI runtime       | React                                                                      | `19.2.8`                        |
| Language         | TypeScript (strict)                                                        | `5.9.x`                         |
| Styling          | Tailwind CSS v4 (CSS-first `@theme`)                                       | `4.3.x`                         |
| Component system | shadcn/ui (Radix + Tailwind), `components.json` ready                      | added on demand                 |
| Icons            | lucide-react                                                               | `1.37.x`                        |
| Charts           | Recharts                                                                   | `3.x`                           |
| DB access / ORM  | Drizzle ORM + drizzle-kit                                                  | `0.45.x` / `0.31.x`             |
| PG driver        | `postgres` (postgres.js)                                                   | `3.4.x`                         |
| Database         | PostgreSQL via Supabase                                                    | (external)                      |
| Auth             | Supabase Auth via `@supabase/ssr`                                          | `0.12.x`                        |
| Storage          | Supabase Storage (server-only admin client)                                | `@supabase/supabase-js 2.x`     |
| Validation       | Zod                                                                        | `4.x`                           |
| Env validation   | `@t3-oss/env-nextjs` + Zod                                                 | `0.13.x`                        |
| Forms            | React Hook Form + `@hookform/resolvers`                                    | `7.x` / `5.x`                   |
| Unit tests       | Vitest + Testing Library + jsdom                                           | `4.x`                           |
| E2E tests        | Playwright                                                                 | `1.62.x`                        |
| Lint / format    | ESLint (flat config, `eslint-config-next`) + Prettier                      | `9.x` / `3.x`                   |
| Deployment       | Vercel                                                                     | CLI `59.x`                      |
| AI               | Provider abstraction; MockAIProvider (default) + GeminiProvider (scaffold) | —                               |
| Package manager  | npm                                                                        | `11.6.1`                        |
| Node runtime     | Node 24 (local `24.11.0`, Vercel `24.x`)                                   | pinned via `.nvmrc` + `engines` |

## Rationale and compatibility notes

### Next.js 16.3 + React 19 + TypeScript

- Next.js **16** is the current LTS line; `16.3.3` is a security release (2026-08-25).
- App Router only. Server Components / Route Handlers / Server Actions cover the
  backend needs — no separate API server.
- `next build` uses Turbopack by default in 16; `turbopack.root` is pinned in
  `next.config.ts` so it does not walk up into the home directory for a lockfile.
- React Compiler is enabled (`reactCompiler: true`, `babel-plugin-react-compiler`).

### Tailwind v4 + shadcn/ui

- Tailwind v4 is stable and is what shadcn/ui targets for new projects. Config is
  CSS-first: tokens live in `app/globals.css` under `@theme inline`, no
  `tailwind.config.*` file.
- `components.json` is pre-created (new-york style, zinc base, lucide icons) so
  `npx shadcn@latest add <component>` works immediately in the master build phase.
- With npm + React 19, `shadcn add` may need `--legacy-peer-deps` for some
  transitive peers; this is a known, benign npm/React 19 interaction.

### Drizzle over Prisma

- The app runs on Vercel serverless functions where **cold start** matters.
  Drizzle's runtime is ~7 KB and initialises in ~10–20 ms; Prisma's engine adds
  ~90 ms+ per cold start. For a demo that must feel instant, Drizzle wins.
- Drizzle + drizzle-kit gives SQL-shaped queries, TypeScript-native schema, and
  plain `.sql` migrations that are easy to review — a good fit for a hackathon
  where the schema will churn.
- `postgres.js` is configured with `prepare: false` (required behind Supabase's
  transaction pooler / PgBouncer) and `max: 1` (one socket per invocation).
- Trade-off accepted: no Prisma Studio. `drizzle-kit studio` covers the same need.

### Supabase for Auth + Storage + Postgres

- One managed provider for the database, authentication and file storage keeps
  the moving parts low. `@supabase/ssr` is the current, supported way to wire
  Supabase Auth into the Next.js App Router (separate browser / server clients).
- The **service-role key is server-only** and is never referenced from client
  code (`lib/storage` is guarded with `import "server-only"`).

### Zod 4 + `@t3-oss/env-nextjs`

- All environment access goes through `lib/env.ts`. Server vs client vars are
  separated; missing values are `.optional()` so the app boots with nothing set.
- `SKIP_ENV_VALIDATION=1` is honoured for container/CI image builds.

### AI provider abstraction

- Product code depends only on the `AiProvider` interface (`lib/ai/types.ts`).
- `MockAiProvider` is deterministic (FNV-1a seeded), offline, always available —
  the default. `GeminiAiProvider` is a typed scaffold; the `@google/genai` SDK is
  intentionally **not** a dependency yet.
- `AI_PROVIDER=gemini` + `GEMINI_API_KEY` switches providers with no code change;
  if the key is absent the factory falls back to mock.

## Known advisories (tracked, not blocking)

- `npm audit` reports 4 **moderate**, all from `drizzle-kit` → `@esbuild-kit/*` →
  old `esbuild` (GHSA-67mh-4wv8-2f99). This is a **dev-only CLI** dependency and
  the advisory concerns esbuild's dev server, which drizzle-kit does not expose.
  Resolution path: adopt `drizzle-kit@1.x` once it leaves beta. Not force-fixed to
  avoid a breaking downgrade.

## Explicitly deferred to the master build phase

Domain schema, RLS policies, storage buckets, auth middleware / route guards,
role model, the real Gemini integration, and every product surface.
