# RESEARCH — SIH26044

Problem statement **SIH26044** — "Portal for Academia–Industry collaboration for
Skill Mapping, Internships and Placement". Organisation: **Ministry of Ayush**
(nodal institute: All India Institute of Ayurveda). Category: **Software**.
Theme: **Miscellaneous**. Prize ₹1,00,000. SIH 2026.

Sources are listed at the end. Where a fact is an inference or a design choice it
is marked _(inference)_ / _(our choice)_.

## 1. What the problem actually is

The literal ask — "a portal for skill mapping, internships and placement" — is a
solved category on the surface (LinkedIn, Naukri, Internshala, college ERPs). The
real, unsolved problem underneath, and the one a Ministry cares about:

- **Skills on a resume are unverifiable.** A recruiter cannot tell a real "Python,
  AWS, Ayurvedic formulation QA" from an aspirational one. Trust is the bottleneck,
  not discovery.
- **Institutions are blind to their own systemic skill gaps.** A college knows its
  placement % but not _which competencies_ are missing across which departments,
  or how that compares to live industry demand.
- **Industry demand signals never reach the curriculum.** SSCs write NOS slowly;
  the feedback loop from "what employers ask for this quarter" to "what a
  department teaches" is broken.
- **Internship experience is not captured as competency.** A finished internship
  produces a certificate PDF, not a structured, verified skill delta.
- **For the Ayush sector specifically**: the sector is projected at ~₹1 lakh crore
  and the _largest_ employer of BAMS/BHMS graduates who leave clinical practice is
  now industry — formulation, quality control, regulatory affairs, medical affairs,
  Ayurvedic telemedicine, wellness operations. Ayush colleges are not set up to
  map students to those non-clinical competency profiles.

**Conclusion (our positioning):** build a **trusted competency-intelligence
layer**, not a resume-discovery portal.

## 2. Competitive gap analysis

| System                                  | What it does well                     | Why it does not solve SIH26044                                                                                 |
| --------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| LinkedIn                                | Network, discovery, employer branding | Self-declared skills, "endorsements" are social not evidential, no institutional analytics, no curriculum loop |
| Naukri / Internshala                    | Volume of listings, apply flow        | Keyword ATS matching, black-box ranking, no competency model, no verification, no academia side                |
| College placement ERP                   | Drives / eligibility / offers         | Single-college, CRUD, no skill intelligence, no industry demand signal                                         |
| Skill-assessment SaaS (HackerRank etc.) | Real tested scores                    | Point solution — score is not connected to roles, gaps, institutions, or a national framework                  |
| DigiLocker / ABC / APAAR                | Credential storage, credit ledger     | Storage only — no matching, no gap analysis, no analytics                                                      |

**The gap nobody fills:** _evidence-weighted_ competency profiles + _explainable_
matching + _institution-level_ gap analytics + a _closed loop_ from internship
outcome back into the verified profile and forward into curriculum signals.

**One-line answer to "why does this need to exist":**
_LinkedIn tells you who says they can do the job; KaushalSetu shows you the
evidence that they can, tells the college why its students can't yet, and tells
the curriculum what industry will need next._

## 3. Competency framework alignment

We align terminology with India's existing frameworks rather than inventing one:

- **NSQF** (National Skills Qualification Framework) — outcome/competency-based,
  levels 1–10 (a move to an 8-level model is under discussion). We use an
  **NSQF-style 1–8 proficiency scale** per skill and roll competencies up to an
  NSQF band. _(our mapping)_
- **NOS / QP** (National Occupational Standards / Qualification Packs) — authored
  by Sector Skill Councils. Our `Role` entity mirrors a QP: mandatory NOS-style
  competencies + skills, preferred skills, tools, behavioural competencies.
- **NCrF + Academic Bank of Credits (ABC/APAAR)** — credits from internships,
  projects, apprenticeships are creditised into a national ledger. Our
  **Competency Passport** and internship-outcome loop are designed to _emit_
  NCrF-style credit events (documented as a future integration, not faked).
- **National Career Service (NCS)** — government job-exchange; our demand-signal
  module is the analytics layer NCS lacks.

## 4. What SIH judges reward (and penalise)

From SIH mentor/winner write-ups and stated judging criteria:

- **Working prototype > slides.** A basic but real flow beats a grand mock.
- **Fit to the exact problem statement**, not buzzword density.
- **Innovation that is legible in the first minute.**
- **Feasibility + scalability + real-world impact**, defended in Q&A.
- **Clean, structured demo narrative.**

Penalised: black-box "AI does everything", dead buttons, obviously fake data,
50 shallow screens, claims the team can't defend (blockchain, "govt-verified").

**Our response:** deterministic explainable engines (AI only explains), a scripted
5-minute coherent story, one-click judge demo, honest "Demo / synthetic data"
labels, depth on 6 flagship experiences.

## 5. Flagship differentiators (what we will actually build)

1. **Evidence Confidence** — every skill carries a confidence derived from which
   evidence types back it (self-declared → assessment → project → certificate →
   faculty-verified → industry-verified). Low-evidence skills are visibly discounted.
2. **Competency Graph** — student and role are both graphs of competencies →
   skills → evidence; matching is graph coverage, not string overlap.
3. **Explainable Matching Engine** — deterministic weighted score with a full
   per-factor breakdown and a "how to become ready" action list. Same engine
   powers student "For You" and recruiter candidate ranking.
4. **Career Simulator** — pick a target role, see current vs required competencies,
   gaps, a generated development plan, and projected readiness; compare roles
   side-by-side; "which role am I closest to".
5. **Institutional Skill Heatmap** — department × skill grid (strong / moderate /
   critical), drill-down to affected students and a recommended institutional
   action. The academia-facing centrepiece.
6. **Industry Skill-Demand Intelligence** — trending / emerging / declining skills
   and role demand from the opportunity corpus, every chart explained, dataset
   labelled simulated.
7. **Internship → Verified Competency loop** — completing an internship writes a
   structured, verified skill delta into the Competency Passport and lifts
   institutional readiness.

## 6. Scope decisions for the prototype

- **No live database in the demo build.** A single deterministic synthetic dataset
  (`lib/demo/`) powers everything; the full Drizzle/Postgres schema is authored and
  documented for credibility and is the production path. This keeps the judge demo
  instant and zero-setup on Vercel. _(our choice)_
- **Demo-mode auth**: persona picker sets a signed cookie; server-side role guards
  enforce access. Production auth (Supabase) is scaffolded and documented.
- **AI = MockAIProvider** composing explanations from real engine output. Gemini is
  a config swap. No AI in any scoring / authz path.
- **No fabricated government statistics.** Sector figures are cited; all in-app
  numbers are labelled synthetic.

## Sources

- Smart India Hackathon 2026 problem-statement catalogues (community mirrors):
  <https://github.com/NoBugNinja/Smart-India-Hackathon-SIH-2026-Problem-Statements>
- NSDA — About NSQF: <https://www.nsda.gov.in/nsqf.html>
- NCVET — NSQF notification: <https://ncvet.gov.in/national-skills-qualification-framework/nsqf-notification/>
- National Skills Network — NSQF level descriptors:
  <https://nationalskillsnetwork.in/national-skills-qualification-framework-nsqf-level-descriptors-and-competency-based-learning/>
- Ministry of Education — NCrF & APAAR: <https://www.education.gov.in/en/nep/ncrf-apaar>
- Drishti IAS — National Credit Framework:
  <https://www.drishtiias.com/daily-updates/daily-news-analysis/national-credit-framework-1>
- Ministry of Ayush: <https://en.wikipedia.org/wiki/Ministry_of_Ayush>
- Scope of AYUSH / BAMS careers (sector size, industry as largest non-clinical employer):
  <https://meducination.com/scope-of-ayush-in-india/>
- SIH preparation / judging criteria write-ups:
  <https://thenewviews.com/how-to-win-smart-india-hackathon/>,
  <https://www.placementpreparation.io/blog/smart-india-hackathon-guide/>
