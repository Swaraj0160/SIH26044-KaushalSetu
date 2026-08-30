# DEPLOYMENT — KaushalSetu

## Target

- **Platform:** Vercel — project `sih26044-kaushalsetu` (org `swaraj0160s-projects`), linked via `.vercel/project.json`.
- **Runtime:** Node 24 (`.nvmrc`), Next.js 16 App Router, Turbopack build.
- **Production URL:** <https://sih26044-kaushalsetu.vercel.app>
- **Auto-deploy:** every push to `main`. Pull requests get preview deployments.

## Zero-config by design

The app boots with an **empty `.env.local`**:

- AI → `MockAIProvider` (deterministic, offline). `AI_PROVIDER=gemini` + `GEMINI_API_KEY` switches to `GeminiAIProvider`.
- Data → one seeded synthetic in-memory dataset (`lib/demo/`). No database connection.
- Auth → `DemoAuthProvider` (fixed **server-side** credentials + one-click personas). `ks_session` httpOnly cookie.
- Editable demo data → per-session signed cookie (`ks_patch`, `lib/session-store.ts`), applied per request. Cleared on sign-out and on redeploy.

No secret is required to run or deploy the prototype. `SUPABASE_SERVICE_ROLE_KEY` / `GEMINI_API_KEY` are server-only and set in the Vercel dashboard (encrypted) if/when used — never committed, never passed as echoing CLI flags.

## Deploy

```bash
npm run build          # must pass locally first
vercel deploy --prod --yes
```

- Local `vercel build` on Windows fails on a symlink `EPERM` step — an OS limitation, not a project fault. The Linux build servers are unaffected; use `npm run build` locally and `vercel deploy --prod` (server-side build).
- Do not deploy a red `main`. Run the full gate first:

```bash
npm run lint && npm run typecheck && npm test && npm run test:e2e && npm run build
```

## Verify a production deploy

The canonical alias `sih26044-kaushalsetu.vercel.app` is public. The
deployment-specific `*-<hash>-swaraj0160s-projects.vercel.app` URL sits behind
Vercel Deployment Protection and will 302 to a Vercel auth wall — always verify
against the alias.

```bash
B=https://sih26044-kaushalsetu.vercel.app
for p in / /login /demo /judge /api/health /verify/KS-PASSPORT-AARAV /nope-404; do
  curl -s -o /dev/null -w "%{http_code}  $p\n" "$B$p"
done
```

Expected: `200 /`, `200 /login`, `200 /demo`, `200 /judge`, `200 /api/health`,
`200 /verify/KS-PASSPORT-AARAV`, `404 /nope-404`. Protected routes (`/student`,
`/industry`, …) return `307` → `/login` when unauthenticated.

- `GET /api/health` must return `{"application":"ok", ..., "ai":{"provider":"mock"}}`.
- The in-app Claude browser blocks Vercel's `/_next/static/immutable/*` chunks
  (`ERR_BLOCKED_BY_CLIENT`), so screenshots of the deployed site render unstyled
  **in that tool only**. Verify visuals with a local `next start` on the identical
  build artifact; real browsers are unaffected.

## Demo credentials

| Role        | Username      | Password         |
| ----------- | ------------- | ---------------- |
| Student     | `student`     | `student123`     |
| Industry    | `industry`    | `industry123`    |
| Faculty     | `faculty`     | `faculty123`     |
| Institution | `institution` | `institution123` |
| Admin       | `admin`       | `admin123`       |

Or `/login` → one-click "Continue as …", or `/demo` → the narrative persona picker.

## Rollback

`vercel rollback <deployment-url>` or promote a previous deployment from the
Vercel dashboard. `main` history is never rewritten; a bad deploy is fixed
forward or rolled back, not force-pushed over.
