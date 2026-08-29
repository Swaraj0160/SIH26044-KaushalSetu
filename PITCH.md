# PITCH — KaushalSetu (SIH26044)

10 slides. Claims are defensible; every in-app number is synthetic and labelled.

---

## 1. Problem

A portal for skill mapping, internships and placement already exists five times
over. What doesn't exist: **trust**. A recruiter can't tell a real skill from an
aspirational one; a college can't see its own systemic gaps; industry demand
never reaches the curriculum; an internship produces a PDF, not a competency.

## 2. Why existing systems fail

|                             | LinkedIn | Naukri / Internshala | College ERP      | DigiLocker / ABC |
| --------------------------- | -------- | -------------------- | ---------------- | ---------------- |
| Verifiable skills           | ✗        | ✗                    | ✗                | storage only     |
| Explainable matching        | ✗        | ✗ (keyword ATS)      | ✗                | —                |
| Institutional gap analytics | ✗        | ✗                    | placement % only | ✗                |
| Curriculum ↔ demand loop    | ✗        | ✗                    | ✗                | ✗                |

## 3. Solution

**An evidence-based competency-intelligence layer.** Students become a competency
graph. Roles become NOS-shaped competency profiles. Matching is explainable graph
coverage. Institutions get a heatmap and an action. Internships close the loop
back into the verified profile and the curriculum.

## 4. Competency Graph + Evidence Confidence

Every skill carries a confidence derived from its evidence types (self-declared →
assessment → project → certificate → faculty-verified → industry-verified). A
lone self-declaration is worth almost nothing; a verified skill holds up in every
match. This is the core differentiator.

## 5. Student

Honest readiness score, a prerequisite-aware roadmap where every step ends in
verifiable evidence, a career simulator ("which role am I closest to"), matches
that come with reasons, and a context-aware copilot that explains — never invents —
the numbers.

## 6. Industry

Post by competency, not keywords. Rank candidates on evidence-weighted fit. See
the per-factor breakdown and an "Explain vs" that shows exactly why candidate A
outranks B. The score reconciles with what the student sees.

## 7. Academia & Institutions

Department readiness, a department × skill heatmap drillable to named students and
a recommended institutional action, placement intelligence correlating readiness
with outcomes, and faculty–industry collaboration pipelines that actually update
state.

## 8. AI + innovation

`AiProvider` abstraction — Mock (default, deterministic) or Gemini (config swap).
AI is bounded to explanation and parsing; it is structurally barred from
authorization, eligibility, verification and both scores. The intelligence that
matters is deterministic and auditable.

## 9. Impact + scalability

Measurable: time-to-placement, internship→placement conversion, readiness gain,
% skills with evidence, institutional gaps closed per semester, curriculum
changes triggered by demand. Multi-tenant from the schema; stateless serverless;
1 → 100 → national without a rewrite.

## 10. Why this matters nationally

Aligned to NSQF, NOS and NCrF; designed to emit Academic Bank of Credits events;
the analytics layer National Career Service lacks. For the Ayush sector
specifically, it maps BAMS/BHMS graduates onto the non-clinical industry
competency profiles (formulation QA, regulatory, pharmacovigilance, wellness) the
sector is hiring for.

**One sentence:** _Not another internship portal — an evidence-based competency
intelligence layer connecting students, academia and industry._
