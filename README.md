# KaushalSetu — SIH26044

**An evidence-based competency intelligence layer connecting students, academia and industry.**

Smart India Hackathon 2026 · Problem Statement **SIH26044** ("Portal for
Academia–Industry Collaboration for Skill Mapping, Internships and Placement") ·
Ministry of Ayush · Category: Software.

**Live demo:** <https://sih26044-kaushalsetu.vercel.app> → _Enter platform_
(`/login`, demo credentials or one-click persona) · _Explore judge demo_
(`/demo`, one click, no registration) · **Technical showcase:** `/judge`

> This is **not** an internship portal. It measures student competencies, makes
> skills trustworthy through an evidence model, exposes gaps with a
> prerequisite-aware roadmap, matches people to industry **with an explanation**,
> turns internship experience into verified competency, and gives institutions
> systemic skill-gap analytics tied to live industry demand.

## Product shape — one journey, not a wall of dashboards

The student experience is organised around a single spine —
**Education → Skills → Evidence → Projects → Internship → Career readiness →
Placement** — surfaced everywhere as a 7-stage journey stepper that always shows
"you are here". Navigation collapses to four destinations:

| Group          | Contains                                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Home**       | Orientation: greeting, target role, readiness, journey spine, one deterministic **Next Best Action**, recent activity, 2–3 opportunities |
| **My Journey** | Education · Skills & Evidence · Projects · Internship · Certifications · Achievements                                                    |
| **Career**     | One page, tabbed: Goal · Readiness · Skill Gaps · Roadmap · Explore Roles (simulator) · Opportunities · Applications                     |
| **My Profile** | Competency Profile (source of truth) · Passport (QR-verifiable culmination)                                                              |

Every other role has an equivalent one-line mental model — Industry _find &
develop talent_, Faculty _verify & connect_, Institution _understand & improve
readiness_, Admin _govern the ecosystem_. A global command palette (`⌘K` / `Ctrl+K`)
jumps to any page or quick action.

## Authentication

`AuthProvider` abstraction (`lib/auth/`). `DemoAuthProvider` ships with the demo —
fixed **server-side** credentials, never in client JS — and a passwordless
one-click persona path for judges. `SupabaseAuthProvider` is a drop-in stub;
swapping is a one-line change in `lib/auth/session.ts`. Session is an
httpOnly cookie; `requireRole()` guards every workspace route (unauthenticated →
`/login`, wrong role → your own home).

| Role        | Username      | Password         |
| ----------- | ------------- | ---------------- |
| Student     | `student`     | `student123`     |
| Industry    | `industry`    | `industry123`    |
| Faculty     | `faculty`     | `faculty123`     |
| Institution | `institution` | `institution123` |
| Admin       | `admin`       | `admin123`       |

## What's built

| Area                       |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Student**                | Journey-first Home + Next Best Action engine · **editable career goal** (recomputes readiness / gaps / roadmap / matches / journey) · Education (courses → skills, add courses) · competency graph · evidence ledger · **per-skill Skill Card** (level vs target, evidence stack, origins, next step) · honest readiness score · adaptive skill assessment **whose result writes real evidence** · skill gaps + sequenced roadmap · career simulator · explainable opportunity match · **add / edit / remove projects, certifications, achievements** (each recomputes through the engines) · full internship lifecycle pipeline · **"What changed" attention inbox** · Competency Passport (QR-verifiable) · grounded Career Copilot |
| **Industry / Recruiter**   | Competency-defined postings · evidence-weighted candidate ranking with per-factor breakdown and "Explain vs A → B" · talent search across the pool                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| **Faculty**                | Industry engagement · functional collaboration pipeline · evidence verification queue with **Approve / Request changes**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Institution / Ministry** | Command center · department readiness · **department × skill heatmap** drillable to named students + recommended action · **Action Center: record an intervention from a heatmap gap → track planned/active/completed → term-over-term "did the gap move?"** · placement intelligence · industry skill-demand intelligence                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Admin**                  | Skill/role taxonomy · employer verification · **live matching-weight tuner** · audit log                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Public**                 | Landing page · one-click judge personas · `/judge` showcase · `/verify/[credentialId]`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

## Core engines (deterministic, `lib/engines/`)

- **Evidence Confidence** — a skill is only as strong as the evidence behind it.
- **Matching** — `Σ weightᵢ·factorᵢ`, fully explained; same function for both market sides.
- **Readiness** — deterministic 0–100; AI explains it, never sets it.
- **Skill-Gap + Roadmap** — prerequisite-aware; every step ends in verifiable evidence.
- **Demand aggregation** — trending / emerging / declining skills from the opportunity corpus.
- **Next Best Action** — deterministic ranking over goal, gaps, evidence, assessments,
  projects, applications and journey stage → the single highest-leverage move, with its "why".

39 unit tests (engine invariants, dataset coherence, hero narratives,
student↔recruiter score reconciliation, demo auth, journey spine, Next Best
Action) · 19 Playwright e2e (landing, auth + role redirects, judge, verify,
student journey walk, career tabs, **editable goal recompute**, **add-project →
skill-evidence**, internship lifecycle, achievements / certifications, faculty
approve / request-changes, command palette, recruiter ranking, heatmap
drilldown).

### Editable demo data — how it works without a database

The demo has no DB (it must boot with an empty `.env.local`). The signed-in
student can still **genuinely edit their record** — career goal, projects,
certifications, achievements, courses, assessment results — via a per-session
signed cookie (`lib/session-store.ts`) applied over the base dataset per request
(`lib/data/viewer.ts`). Every deterministic engine recomputes from the edited
state. It is honestly scoped: **this browser session only, cleared on sign-out
and on redeploy, not shared with other roles' views.** A production build swaps
`lib/session-store.ts` for real writes; `lib/data` and the engines do not change.

## Design language

A modern Indian **digital public service** system, synthesised from
[UX4G](https://www.ux4g.gov.in/) (token-driven government design discipline) and
the [GOV.UK Design System](https://design-system.service.gov.uk/) (complex
services should feel simple; restrained type; colour is functional; strong
keyboard focus) — an original KaushalSetu identity, not a copy of either.

- **Tokens** (`app/globals.css`): `--ks-*` are the source of truth (colour,
  semantic, surface, border, text); the Tailwind-facing names alias them.
- **Palette:** deep **teal** primary (institutional, tied to Ayush/wellness) —
  deliberately _not_ generic SaaS indigo; saffron accent, used sparingly; a warm
  paper ground, not cool slate. Semantic colours always pair with an icon/label.
- Square-er corners, hairline borders, almost-flat elevation — no glass, no
  card-wall shadows. Restrained institutional type scale (headings never
  enormous). GOV.UK-style 3px high-contrast keyboard focus. A restrained
  SIH26044 / Ministry of Ayush context strip on every authenticated screen,
  honestly labelled _"prototype — not an official government service"_.

## Tech stack

Next.js 16 (App Router, RSC) · React 19 · TypeScript strict · Tailwind v4 ·
Drizzle ORM + PostgreSQL (Supabase, schema authored) · Zod · Vitest · Playwright ·
Vercel. AI: `AiProvider` abstraction — `MockAIProvider` (default, deterministic)
plus `GeminiAIProvider` (config swap). Rationale: [`STACK_DECISION.md`](./STACK_DECISION.md).

## Run locally

```bash
npm install
cp .env.example .env.local   # every value may stay blank
npm run dev                  # http://localhost:3000
```

The app boots with **zero configuration** — deterministic mock AI, a seeded
synthetic in-memory dataset, demo-persona auth. No Supabase or Gemini key needed
for the full demo. Component status: [`/health`](http://localhost:3000/health).

## Commands

`npm run dev | build | start | lint | typecheck | test | test:e2e`
· `npm run db:generate | db:migrate | db:seed | db:studio` (production DB path).
Full reference: [`DEVELOPMENT.md`](./DEVELOPMENT.md).

## Documentation

| File                                                                                                                                     |                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [`SIH_STRATEGY.md`](./SIH_STRATEGY.md)                                                                                                   | Problem, competitive analysis, algorithms, adoption, risks, why-win/why-lose                  |
| [`UX_REDESIGN_PROPOSAL.md`](./UX_REDESIGN_PROPOSAL.md)                                                                                   | Journey-first information architecture, per-role mental models, sitemap, flows, design system |
| [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md)                                                                                                     | Exact 5-minute demo flow with clicks                                                          |
| [`PITCH.md`](./PITCH.md)                                                                                                                 | 10-slide deck outline                                                                         |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md)                                                                                                   | Mermaid diagrams: system, data model, engines, AI, authz, multi-tenancy                       |
| [`RESEARCH.md`](./RESEARCH.md)                                                                                                           | SIH26044 research, NSQF/NOS/NCrF alignment, judging patterns                                  |
| [`SECURITY.md`](./SECURITY.md)                                                                                                           | Secret handling, client/server split, authz, rate limiting, uploads, audit                    |
| [`DEVELOPMENT.md`](./DEVELOPMENT.md)                                                                                                     | Local setup, demo mode, DB path, troubleshooting                                              |
| [`STACK_DECISION.md`](./STACK_DECISION.md) · [`SETUP_STATUS.md`](./SETUP_STATUS.md) · [`PREFLIGHT_COMPLETE.md`](./PREFLIGHT_COMPLETE.md) | Environment & stack                                                                           |
| [`CLAUDE.md`](./CLAUDE.md)                                                                                                               | Permanent engineering rules                                                                   |

## Honesty

All people, employers, and numbers in the app are **synthetic**, generated
deterministically for demonstration, and labelled as such on every screen. No
real or government data is used. Credential verification is a deterministic check
code against a demo registry — not a cryptographic signature, blockchain record,
or government-issued proof. Sector figures cited in docs are attributed in
`RESEARCH.md`.
