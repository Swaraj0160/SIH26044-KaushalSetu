# SIH_STRATEGY — SIH26044 · KaushalSetu

## Executive summary

KaushalSetu is an **evidence-based competency-intelligence layer** connecting
students, academia and industry. It is not an internship portal. It measures
student competencies, makes skills trustworthy through an evidence model, exposes
gaps with a prerequisite-aware roadmap, matches people to industry with a full
explanation, converts internship experience into verified competency, and gives
institutions systemic skill-gap analytics tied to live industry demand.

Deployed prototype: <https://sih26044-kaushalsetu.vercel.app> · one-click judge
demo, no registration.

## Problem analysis

The literal ask — a portal for skill mapping, internships, placement — is a
solved category. The unsolved problem, and the one a Ministry owns:

1. **Skills on a resume are unverifiable.** Trust, not discovery, is the bottleneck.
2. **Institutions are blind to their own systemic skill gaps** — they know
   placement %, not which competencies are missing where.
3. **Industry demand never reaches curriculum.** The feedback loop is broken.
4. **Internship experience is not captured as competency** — it produces a PDF.
5. **Matching is a black box** — keyword ATS ranking nobody can interrogate.

Ayush-specific: the ~₹1 lakh-crore sector is now the largest non-clinical
employer of BAMS/BHMS graduates (formulation QA, regulatory affairs,
pharmacovigilance, wellness operations); Ayush colleges do not map students to
those competency profiles.

## Existing solutions & competitive analysis

| System                   | Strength                   | Why it doesn't solve SIH26044                                                             |
| ------------------------ | -------------------------- | ----------------------------------------------------------------------------------------- |
| LinkedIn                 | Network, discovery         | Self-declared skills, social endorsements, no institutional analytics, no curriculum loop |
| Naukri / Internshala     | Listing volume, apply flow | Keyword ATS, black-box ranking, no competency model, no academia side                     |
| College placement ERP    | Drives, eligibility        | Single-college CRUD, no skill intelligence, no demand signal                              |
| HackerRank etc.          | Real tested scores         | Point solution — score not connected to roles, gaps, institutions                         |
| DigiLocker / ABC / APAAR | Credential + credit ledger | Storage only — no matching, gap analysis or analytics                                     |

**The unfilled gap:** evidence-weighted competency profiles + explainable
matching + institution-level gap analytics + a closed internship→profile→curriculum loop.

## Core innovation

1. **Evidence Confidence** — every skill scored by the evidence behind it
   (self-declared → assessment → project → certificate → faculty-verified →
   industry-verified). A lone self-declaration is capped near zero and visibly
   discounted in every downstream number.
2. **Competency Graph** — student and role are both graphs of competencies →
   skills → evidence. Matching is graph coverage, not string overlap.
3. **Explainable Matching Engine** — deterministic weighted score with a
   per-factor breakdown, an "Explain vs" candidate comparison, and a "how to
   become ready" list. Same function on both sides of the market.
4. **Internship → Verified Competency loop** — completion writes a structured
   skill delta into the Competency Passport and lifts institutional readiness.
5. **Institutional Skill Heatmap** — department × skill grid, drillable to named
   students and a recommended institutional action.

## Differentiators (one line each)

- Trust layer, not a resume database.
- The same match number reconciles for the student and the recruiter.
- Institutions get an action, not just a percentage.
- AI explains; deterministic engines decide.
- Framework-aligned (NSQF / NOS / NCrF), not an invented taxonomy.

## Target users & journeys

- **Student** — passport, honest readiness, roadmap, explainable matches, copilot.
- **Recruiter** — competency-defined postings, evidence-weighted ranking, "why A > B".
- **Faculty** — verify evidence, run collaboration pipeline, industry engagement.
- **Institution / Ministry** — heatmap, systemic gaps, placement intelligence, demand.

## Competency framework

NSQF-style 1–8 proficiency. NOS/QP-shaped role profiles. Competency Passport
designed to emit NCrF / Academic Bank of Credits events in production. No claim
of being an official government record.

## Data strategy

Demo runs on one deterministic, seeded, fully synthetic, causally-linked dataset
(66 students, 16 employers, 12 roles, 44 skills, 20 competencies, 50+ opportunities,
120+ applications, internships, collaborations, credentials, placements). Every
screen labels it synthetic. Production swaps in Drizzle + Supabase Postgres
behind the same interface (`lib/db/schema.ts` authored).

## Matching algorithm

`score = Σ weightᵢ · factorᵢ`, factors in [0,1]:
mandatory competency coverage 40% · skill proficiency 20% · evidence confidence
15% · experience 10% · education eligibility 5% · career interest 5% ·
assessment coverage 5%. Weights are configurable (Admin persona → Matching Config,
live recompute).

## Readiness algorithm

`readiness = Σ weightᵢ · factorᵢ`: competency coverage 30% · skill proficiency
20% · assessment 18% · evidence 12% · projects 10% · experience 10%. Deterministic.
AI never sets it.

## AI strategy

`AiProvider` abstraction: `MockAIProvider` (deterministic, offline, default) +
`GeminiAIProvider` (typed scaffold). `AI_PROVIDER=gemini` + `GEMINI_API_KEY`
switches with no code change. AI is bounded to explanation/parsing/narration and
is banned from authz, eligibility, verification, and the two scores.

## Security

Server-side role guards on every workspace route. Client/server secret split
(`import "server-only"`). Zod on all external input. Production: application-layer
guards + Postgres RLS filtered by `institution_id`. See `SECURITY.md`.

## Scalability

1 institution → 100 → national. Multi-tenant from the schema up. Stateless
serverless functions on Vercel; the analysis layer is pure reads. No premature
microservices.

## Government adoption path

Aligns to NSQF/NOS/NCrF; emits ABC/APAAR credit events; complements National
Career Service with the analytics layer it lacks. Pilot with one Ayush institute
(AIIA) + one engineering institute, then scale by state.

## Impact metrics (what a deployment would report)

Time-to-placement, internship→placement conversion, readiness gain start→offer,
% of skills with verifiable evidence, closed institutional gaps per semester,
curriculum changes triggered by demand signals.

## Risks & mitigations

| Risk               | Mitigation                                                          |
| ------------------ | ------------------------------------------------------------------- |
| Evidence gaming    | Human verification tiers dominate the confidence score; audit log   |
| Cold-start data    | Seeded reference taxonomy + assessment bank ship with the platform  |
| AI over-reliance   | AI structurally barred from all decisions; deterministic core       |
| Institution buy-in | Immediate value: heatmap + action on day one, no integration needed |
| Scale cost         | Stateless serverless; analysis is pure functions, cache-friendly    |

## Future scope

Real Gemini integration · W3C Verifiable Credentials + ABC events · NCS / SSC
data blending · adaptive assessment item bank at scale · employer-side
skills-taxonomy contribution · Hindi / Marathi localisation.

## Why this can win

Working prototype, legible innovation in the first minute, a coherent 5-minute
story, honest data labelling, depth on 6 flagship experiences, and a defensible
answer to "why not LinkedIn".

## Why this could lose

If the demo is rushed and the judge only sees "another dashboard"; if the
evidence model isn't explained clearly; if the Ayush angle is under-played. The
`DEMO_SCRIPT.md` is built to prevent exactly this.
