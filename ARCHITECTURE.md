# ARCHITECTURE — KaushalSetu

## System

```mermaid
flowchart TD
  U[Browser] -->|HTTPS| V[Vercel · Next.js 16 App Router]
  V --> RSC[Server Components + Route Handlers]
  RSC --> DATA[lib/data · analysis layer<br/>pure reads, stable return types]
  DATA --> ENG[lib/engines · deterministic<br/>evidence · profile · matching · readiness · skill-gap · demand]
  DATA --> SRC{data source<br/>swappable}
  SRC -->|demo build| DEMO[lib/demo · seeded synthetic dataset]
  SRC -->|production| DB[(PostgreSQL · Supabase<br/>Drizzle ORM · schema authored)]
  RSC --> AI[lib/ai · AiProvider]
  AI --> MOCK[MockAIProvider · default]
  AI --> GEM[GeminiAIProvider · config swap]
  RSC --> SESS[demo persona cookie]
  SESS -.production.-> SB[Supabase Auth + RLS]
  ENG -->|never touches| AI
```

## Data model (production schema — `lib/db/schema.ts`, authored)

```mermaid
erDiagram
  INSTITUTIONS ||--o{ DEPARTMENTS : has
  INSTITUTIONS ||--o{ STUDENTS : enrols
  DEPARTMENTS ||--o{ STUDENTS : groups
  STUDENTS ||--o{ STUDENT_SKILLS : declares
  SKILLS ||--o{ STUDENT_SKILLS : referenced_by
  STUDENT_SKILLS ||--o{ SKILL_EVIDENCE : backed_by
  SKILLS }o--o{ COMPETENCIES : composes
  COMPETENCIES ||--o{ ROLE_REQUIREMENTS : required_by
  ROLES_CATALOG ||--o{ ROLE_REQUIREMENTS : defines
  EMPLOYERS ||--o{ OPPORTUNITIES : posts
  ROLES_CATALOG ||--o{ OPPORTUNITIES : instantiated_as
  STUDENTS ||--o{ APPLICATIONS : submits
  OPPORTUNITIES ||--o{ APPLICATIONS : receives
  APPLICATIONS ||--o| INTERNSHIPS : becomes
  INTERNSHIPS ||--o{ SKILL_EVIDENCE : produces
  STUDENTS ||--o{ CREDENTIALS : holds
  STUDENTS ||--o{ PLACEMENT_OUTCOMES : results_in
  INSTITUTIONS ||--o{ COLLABORATIONS : partners
  EMPLOYERS ||--o{ COLLABORATIONS : partners
  USERS ||--o{ AUDIT_LOGS : acts
```

Every tenant-scoped table carries `institution_id`; production enforces
Row-Level Security on it.

## Matching engine

```mermaid
flowchart LR
  S[Student] --> RP[resolveProfile<br/>effective level + evidence + competency roll-up]
  R[Role / Opportunity] --> M[computeMatch]
  RP --> M
  M --> F1[mandatory competency coverage · 40%]
  M --> F2[skill proficiency · 20%]
  M --> F3[evidence confidence · 15%]
  M --> F4[experience · 10%]
  M --> F5[education eligibility · 5%]
  M --> F6[career interest · 5%]
  M --> F7[assessment coverage · 5%]
  F1 & F2 & F3 & F4 & F5 & F6 & F7 --> SUM[Σ weightᵢ·factorᵢ → score 0–100]
  SUM --> EXP[per-factor breakdown · strengths · missing · how-to-become-ready]
```

The identical function serves the student feed and the recruiter ranking.

## Evidence Confidence

```mermaid
flowchart LR
  E[evidence items] --> W[weight per kind<br/>self 0.05 · assessment 0.28 · project 0.22<br/>certificate 0.15 · faculty 0.30 · industry 0.40]
  W --> D[diminishing returns per repeat kind]
  D --> SC[score 0–1]
  SC --> B{bands}
  B --> L[low] & MO[moderate] & H[high] & VER[verified<br/>requires a human verifier]
```

## AI architecture

```mermaid
flowchart TD
  APP[product code] -->|depends only on| IFACE[AiProvider interface]
  IFACE --> MOCK[MockAIProvider<br/>deterministic · offline · default]
  IFACE --> GEM[GeminiAIProvider<br/>AI_PROVIDER=gemini + GEMINI_API_KEY]
  COPILOT[Career Copilot] --> ENGOUT[deterministic engine output]
  ENGOUT --> IFACE
  IFACE -.->|phrasing only| ANSWER[grounded answer]
  subgraph banned
    AUTHZ[authorization] & ELIG[eligibility] & VERIFY[verification] & SCORE[match / readiness score]
  end
  IFACE -. never .-> banned
```

## Auth & authorization

```mermaid
flowchart TD
  REQ[request] --> MW[middleware / layout]
  MW --> P{persona / session}
  P -->|none| DEMO[/demo]
  P -->|wrong role| HOME[own workspace home]
  P -->|ok| GUARD[requireRole in the page]
  GUARD --> RENDER[server component renders]
  RENDER -.production.-> RLS[Postgres RLS filters by institution_id]
```

Demo build: signed persona cookie + `requireRole()` on every workspace route.
Production: Supabase Auth (`@supabase/ssr`) + application guards + RLS.

## Multi-tenancy

```mermaid
flowchart LR
  T1[Institution A] --> ROW[(rows tagged institution_id=A)]
  T2[Institution B] --> ROW2[(rows tagged institution_id=B)]
  ROW & ROW2 --> RLS[RLS policy: institution_id = current user's institution]
  RLS --> APP[same code path, isolated data]
  APP --> NAT[national roll-up: platform_admin bypass with audit]
```

## Deployment / data flow

```mermaid
flowchart LR
  GH[GitHub main] -->|push| VC[Vercel build · next build]
  VC --> PROD[Production deployment]
  PR[pull request] --> PREV[Preview deployment]
  PROD --> FN[serverless functions · Node 24]
  FN --> RESP[HTML / JSON]
  ENV[env vars in Vercel dashboard] -.-> FN
```

## Key decisions

| Decision                                     | Why                                                         |
| -------------------------------------------- | ----------------------------------------------------------- |
| Data source behind `lib/data`                | Demo runs zero-setup; production schema drops in unchanged  |
| Deterministic engines, config-driven weights | Auditable, testable, reproducible; not a model              |
| AI abstraction, mock default                 | Works with no key; Gemini is configuration                  |
| Drizzle over Prisma                          | Serverless cold-start; tiny runtime; plain SQL migrations   |
| Persona cookie for the demo                  | Judges need one-click access; production auth is scaffolded |
| Synthetic dataset, labelled everywhere       | Honest; no fabricated government data                       |
