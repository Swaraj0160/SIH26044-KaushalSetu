# KaushalSetu — SIH26044

**An evidence-based competency intelligence layer connecting students, academia and industry.**

Smart India Hackathon 2026 · Problem Statement **SIH26044** ("Portal for
Academia–Industry Collaboration for Skill Mapping, Internships and Placement") ·
Ministry of Ayush · Category: Software.

**Live demo:** <https://sih26044-kaushalsetu.vercel.app> → _Explore judge demo_
(one click, no registration) · **Technical showcase:** `/judge`

> This is **not** an internship portal. It measures student competencies, makes
> skills trustworthy through an evidence model, exposes gaps with a
> prerequisite-aware roadmap, matches people to industry **with an explanation**,
> turns internship experience into verified competency, and gives institutions
> systemic skill-gap analytics tied to live industry demand.

## What's built

| Area                       |                                                                                                                                                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Student**                | Competency graph · evidence ledger · honest readiness score · adaptive skill assessment · skill gaps + sequenced roadmap · career simulator · explainable opportunity match · Competency Passport (QR-verifiable) · internship workspace · grounded Career Copilot |
| **Industry / Recruiter**   | Competency-defined postings · evidence-weighted candidate ranking with per-factor breakdown and "Explain vs A → B" · talent search across the pool                                                                                                                 |
| **Faculty**                | Industry engagement · functional collaboration pipeline · evidence verification queue                                                                                                                                                                              |
| **Institution / Ministry** | Command center · department readiness · **department × skill heatmap** drillable to named students + recommended action · placement intelligence · industry skill-demand intelligence                                                                              |
| **Admin**                  | Skill/role taxonomy · employer verification · **live matching-weight tuner** · audit log                                                                                                                                                                           |
| **Public**                 | Landing page · one-click judge personas · `/judge` showcase · `/verify/[credentialId]`                                                                                                                                                                             |

## Core engines (deterministic, `lib/engines/`)

- **Evidence Confidence** — a skill is only as strong as the evidence behind it.
- **Matching** — `Σ weightᵢ·factorᵢ`, fully explained; same function for both market sides.
- **Readiness** — deterministic 0–100; AI explains it, never sets it.
- **Skill-Gap + Roadmap** — prerequisite-aware; every step ends in verifiable evidence.
- **Demand aggregation** — trending / emerging / declining skills from the opportunity corpus.

27 unit tests (engine invariants, dataset coherence, hero narratives,
student↔recruiter score reconciliation) · 7 Playwright e2e (landing, judge,
verify, student flow, recruiter ranking, heatmap drilldown).

## Tech stack

Next.js 16 (App Router, RSC) · React 19 · TypeScript strict · Tailwind v4 ·
Drizzle ORM + PostgreSQL (Supabase, schema authored) · Zod · Vitest · Playwright ·
Vercel. AI: `AiProvider` abstraction — `MockAIProvider` (default, deterministic)

- `GeminiAIProvider` (config swap). Rationale: [`STACK_DECISION.md`](./STACK_DECISION.md).

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

| File                                                                                                                                     |                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`SIH_STRATEGY.md`](./SIH_STRATEGY.md)                                                                                                   | Problem, competitive analysis, algorithms, adoption, risks, why-win/why-lose |
| [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md)                                                                                                     | Exact 5-minute demo flow with clicks                                         |
| [`PITCH.md`](./PITCH.md)                                                                                                                 | 10-slide deck outline                                                        |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md)                                                                                                   | Mermaid diagrams: system, data model, engines, AI, authz, multi-tenancy      |
| [`RESEARCH.md`](./RESEARCH.md)                                                                                                           | SIH26044 research, NSQF/NOS/NCrF alignment, judging patterns                 |
| [`SECURITY.md`](./SECURITY.md)                                                                                                           | Secret handling, client/server split, authz, rate limiting, uploads, audit   |
| [`DEVELOPMENT.md`](./DEVELOPMENT.md)                                                                                                     | Local setup, demo mode, DB path, troubleshooting                             |
| [`STACK_DECISION.md`](./STACK_DECISION.md) · [`SETUP_STATUS.md`](./SETUP_STATUS.md) · [`PREFLIGHT_COMPLETE.md`](./PREFLIGHT_COMPLETE.md) | Environment & stack                                                          |
| [`CLAUDE.md`](./CLAUDE.md)                                                                                                               | Permanent engineering rules                                                  |

## Honesty

All people, employers, and numbers in the app are **synthetic**, generated
deterministically for demonstration, and labelled as such on every screen. No
real or government data is used. Credential verification is a deterministic check
code against a demo registry — not a cryptographic signature, blockchain record,
or government-issued proof. Sector figures cited in docs are attributed in
`RESEARCH.md`.
