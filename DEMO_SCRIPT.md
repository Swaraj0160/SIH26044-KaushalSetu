# DEMO_SCRIPT — KaushalSetu · 5 minutes

URL: <https://sih26044-kaushalsetu.vercel.app>

Two entry points:

- **Enter platform** → `/login` — demo credentials (`student` / `student123`,
  etc.) or a one-click "Continue as …" persona. Use this to show real auth.
- **Explore judge demo** → `/demo` — passwordless one-click personas on a shared
  synthetic dataset. Use this to move fast between roles.

Narrative spine — **one student's journey, followed end to end:**
_Education produces skills → evidence makes them trustworthy → projects and an
internship produce more → the Competency Profile is the single source of truth →
gaps against a career goal become a sequenced plan → industry discovers the
student by evidence → experience becomes verified competency → the institution
sees the systemic pattern → academia and industry improve each other._

---

## 0:00–0:30 — The problem

- Landing page. Hero + comparison table: _"LinkedIn, Naukri, Internshala already
  do discovery. The gap is upstream — skills are unverifiable, colleges are blind
  to their gaps, industry demand never reaches the curriculum."_
- One line: **"KaushalSetu is the intelligence layer between education and
  employability — not a job board."**

## 0:30–1:15 — Home is the journey, not a dashboard

- **Enter platform → Continue as Student** (Aarav, B.Tech CSE, targets ML Engineer).
- Home: greeting, **target role**, **readiness 57 · Developing**, and the
  **7-stage journey spine** — Education → Skills → Evidence → Projects →
  Internship (**"you are here"**) → Career readiness → Placement.
- **Your Next Best Action**: _"Close your MLOps & Model Deployment gap"_ with its
  **"why"** and a single CTA. _"Deterministic — ranked over the student's goal,
  gaps, evidence, assessments, projects and journey stage. One honest move."_
- Recent activity timeline + 2–3 opportunities. _"Everything else is one click
  away, but the student is never lost."_

## 1:15–2:15 — My Journey: where skills come from, and the evidence behind them

- **Education**: degree, semester, CGPA, and **courses → the skills they
  produced**. _"Skills don't appear from nowhere — they trace to coursework,
  projects and experience."_
- **Skills & Evidence**: the **evidence ledger** — _"Python is faculty-verified
  and assessed → high confidence. Docker is self-declared only → the platform
  discounts it."_ Hover an Evidence pill for the rationale.
- **Projects**: a project shows its **skill → evidence → competency** chain and
  faculty/industry evaluations.
- **Internship**: the full **lifecycle pipeline** — Discovered → Applied →
  Shortlisted → Selected → Onboarding → Active → Milestones → Mentor feedback →
  Final evaluation → Completed → **Verified skills**. Skill delta Docker L2→L4,
  _"on completion this becomes industry-verified evidence in the Passport."_

## 2:15–3:00 — Career: one destination

- **Career** (single tabbed page). **Goal** — target role, what's blocking it,
  roles you're closest to. **Readiness** — the 0–100 score broken into weighted
  factors with the line _"Deterministic score — AI can explain it; AI never sets
  it."_ **Skill Gaps** + **Roadmap** — prerequisite-sequenced, _"every step ends
  in evidence a recruiter will trust."_ **Explore Roles** — the simulator, ML
  Engineer vs Data Scientist side by side. **Opportunities** / **Applications** —
  the pipeline, tied to the goal.

## 3:00–4:00 — Industry matching (explainable, both sides)

- **Opportunities → the VedaLabs ML Engineer card → "Why this match"**: 7
  weighted factors, mandatory competency table, "How to become ready".
- **Switch persona → Industry (Rohan) → Roles & Candidates → ML Engineer Intern.**
- Expand a candidate → **the same breakdown** + **"Explain vs <other>"** factor
  delta. Move a candidate with **Shortlist / Invite to interview / Make an offer**.
- Callout: _"Student and recruiter see the identical number from the same engine."_

## 4:00–4:40 — Institution intelligence + faculty trust

- **Switch persona → Institution (Dr. Rao)**: Command Center — mean readiness,
  department breakdown, top institutional gaps. **Skill Heatmap**: department ×
  skill grid; click a red cell → affected students **and a recommended
  institutional action**.
- **Switch persona → Faculty (Prof. Meera)** → **Verify Evidence**: **Approve /
  Request changes** on a student's project — _"this is the human-in-the-loop that
  makes the profile trustworthy."_

## 4:40–5:00 — The culmination + innovation

- **Switch to Student → My Profile → Competency Profile**: _"the single source of
  truth — every input on one page."_ → **Passport**: QR →
  `/verify/KS-PASSPORT-AARAV` (open it) — public, evidence-backed, honestly
  labelled a demo check code, not a fake blockchain.
- Close on `/judge`: the 10-step guided walkthrough, deterministic engines,
  bounded AI, NSQF/NCrF alignment, multi-tenancy.
- Final line: **"Not another internship portal — an evidence-based
  competency-intelligence layer connecting students, academia and industry."**

---

## Q&A quick answers

- **"Is the AI real?"** — Mock provider by default (deterministic). Gemini is a
  config swap. AI only explains; it never sets a score, a match, eligibility or a
  permission.
- **"Is the auth real?"** — `AuthProvider` abstraction. Demo uses fixed
  **server-side** credentials + one-click personas; credentials are never in
  client JS. `SupabaseAuthProvider` is a one-line swap.
- **"Is the data real?"** — 100% synthetic, labelled on every screen. Schema and
  analysis layer are production-shaped; swap in Supabase Postgres unchanged.
- **"Why not LinkedIn?"** — LinkedIn shows who _says_ they can do the job.
  KaushalSetu shows the evidence, tells the college why its students can't yet,
  and tells the curriculum what's coming.
- **"Can it scale?"** — Multi-tenant from the schema; stateless serverless; pure
  read analysis layer. 1 → 100 → national without a rewrite.
