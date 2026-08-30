# PRODUCT_TRANSFORMATION_BLUEPRINT — KaushalSetu

**Status: analysis complete; implementation in progress.**

The audit below is unchanged from the review draft. Implementation against it has
started — see **§ Implementation log** at the very end for what has shipped.

Method: read the six strategy docs; walked the running application (production build,
every role, ~30 screens, desktop + mobile); mapped routes, engines, components and the
faculty/institution source; researched SIH26044 and eleven reference products (Handshake,
12twenty, Degreed, Linear, Notion, Coursera, LinkedIn + Symplicity CSM, Eightfold, Gloat,
Fuel50/Suitable). Where a reference product interior is behind auth, I used its help centre,
product pages, changelogs and public write-ups.

---

## 1. Executive Summary

KaushalSetu is **already past the "generic placement portal" stage.** The Phase 5–6
rebuild gave it the right skeleton: a journey spine, a deterministic Next Best Action, an
evidence-confidence model, an explainable matching engine that reconciles for both sides of
the market, an institutional skill heatmap, and an internship→verified-competency loop. The
strategy documents are sharp and the positioning ("trust layer, not a resume database") is
defensible. **Do not rebuild any of that.**

What it is **not** yet is a product a student would open on day one of college and still be
opening in final year. It is a _demo skeleton_: the screens exist and the engines are real,
but the data is shallow (5 courses, 2 projects, 12 skills for the flagship student), almost
nothing is editable (you cannot change your career goal, add a project, or post a role),
core SIH-named capabilities are thin or missing (aptitude/soft-skill assessment, mentorship,
apprenticeship, faculty FDP/consultancy/research, document management, government
integration), and the visual identity is competent-but-anonymous indigo SaaS with weak
data-visualisation and oversized mobile cards.

**The transformation is therefore not a redesign — it is a densification and a completion.**
Keep the IA and the engines. Make every surface _do_ something (create, edit, verify,
progress). Fill the four-year lifecycle so the product is useful in year 1, not just at
placement. Add the five capabilities SIH judges will look for and that are genuinely
missing. Give it a distinctive, trustworthy visual identity with real craft. And build the
judge demo _into_ the product as a guided path, not a separate slideshow.

**The centre of the product** — the thing that must be true within 60 seconds of a judge
looking at it — is: _the same competency-and-evidence number is computed once and shown,
identically and explained, to the student, the recruiter, the faculty verifier and the
institution; and completing real work (an internship, a verified project) visibly moves it._
Everything else is in service of that.

**Proposed North Star:** **Verified Competency Coverage (VCC)** — the share of a student's
target-role competencies that are backed by at least assessment-grade evidence. It is the
only metric that rises only when the whole chain works, and it means something to all four
personas at once.

---

## 2. Current Product Diagnosis

### 2.1 What is genuinely good (keep, do not touch)

| Area                                                 | Why it works                                                                                                                                                                 |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Journey spine** (`getJourney`, `<JourneyStepper>`) | 7 ordered stages, one "current", "you are here" everywhere. This is the single best decision in the product.                                                                 |
| **Next Best Action** (`lib/engines/next-action.ts`)  | Deterministic ranked candidates → one action + a "why" + a CTA. Exactly the right pattern; it just needs a richer candidate set.                                             |
| **Evidence Confidence** (`lib/engines/evidence.ts`)  | Per-kind weights, diminishing returns, human-verification tiers dominate. Legible and defensible. Mirrors Degreed's rating hierarchy (Skill Review > Manager > Peer > Self). |
| **Explainable matching** (`lib/engines/matching.ts`) | `Σ wᵢ·factorᵢ`, per-factor breakdown, "Explain vs A→B", _same function both sides_, reconciled number. This is the differentiator.                                           |
| **Matching Config** (`/admin/matching`)              | Live weight sliders recomputing a real sample. "No black box" made physical.                                                                                                 |
| **Institutional heatmap** (`/institution/heatmap`)   | Department × skill, drill to named students **and a recommended action**. Analytics → action, not analytics → shrug.                                                         |
| **Internship lifecycle** (`/student/internship`)     | Discovered→…→Verified skills pipeline; skill delta; mentor ratings; final evaluation writes to the Passport.                                                                 |
| **Adaptive assessment** (`/student/assessment`)      | Real adaptive MCQ engine with confidence items and instant explained feedback.                                                                                               |
| **Honest data labelling**                            | "Demo / synthetic data" on every screen; no fake blockchain / government claims. Judges reward this.                                                                         |
| **Deterministic-core / AI-explains discipline**      | AI structurally barred from scores, authz, eligibility, verification.                                                                                                        |

### 2.2 What is weak, broken, or a demo shortcut

| #   | Problem                                                                                                                                                                                                                                                                                | Evidence from the walkthrough                                                                            |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| D1  | **Almost nothing is editable.** No "change career goal" control on the Career→Goal tab despite "change goal →" links pointing at it. No "add project", "add certification", "add achievement", "log an experience". No "create/edit posting" for recruiters. The product is read-only. | Career→Goal tab shows the target role but offers no edit affordance. Postings list has no "new posting". |
| D2  | **Content depth is demo-thin.** Aarav has 5 courses, 2 projects, 12 skills, 1 certification, 1 endorsement. A 4-year student has ~40 courses and 8–15 projects. The journey looks empty in years 1–3.                                                                                  | `/student/education` (5 courses), `/student/projects` (2).                                               |
| D3  | **Profile and Passport substantially duplicate.** Both show readiness, evidence %, the competency list. Distinction ("working view" vs "shareable credential") is real but thin.                                                                                                       | `/student/profile` and `/student/passport` side by side.                                                 |
| D4  | **The Skills page and the Profile page render the same competency graph.** Two routes, one visualisation, no added meaning on the second.                                                                                                                                              | `/student/skills` graph === `/student/profile` graph.                                                    |
| D5  | **Assessment is invisible.** Not in the sidebar. Reachable only via command palette, Next Best Action, or deep link. It is a core SIH requirement.                                                                                                                                     | `app-shell.tsx` NAV has no assessment entry.                                                             |
| D6  | **Career Copilot is an over-weighted destination.** A full-page chat as a peer of every feature signals "if the UI confuses you, ask the bot."                                                                                                                                         | `/student/copilot` is a top-level nav item under CAREER.                                                 |
| D7  | **Skills have no detail view.** The evidence ledger is one long scroll. No per-skill page with history, target level, last-assessed date, "how to raise this". §17 of your own brief asks for exactly this.                                                                            | `/student/skills` — skills are not links.                                                                |
| D8  | **Applications are read-only progress bars.** No timeline, no notes, no "next step", no link back to the match breakdown or the gap.                                                                                                                                                   | Career→Applications tab.                                                                                 |
| D9  | **Talent search is role-only.** Cannot filter "verified Docker, Pune, graduating 2026". No saved searches, no shortlists as first-class objects.                                                                                                                                       | `/recruiter/talent`.                                                                                     |
| D10 | **No notifications anywhere.** Assessment due, verification requested, milestone, application update, deadline — none surface. The product cannot pull a user back.                                                                                                                    | No notification UI in any role.                                                                          |
| D11 | **Onboarding does not exist.** New users are dropped into a fully-populated demo persona. There is no "set up your profile in 4 steps".                                                                                                                                                | `/login` → straight to a populated Home.                                                                 |
| D12 | **Data-visualisation is primitive.** Demand "trends" are lists of `▲ 97%` with no time series. Placement scatter plots are tiny. The competency graph labels overlap.                                                                                                                  | `/demand`, `/institution/placements`, `/student/skills` graph.                                           |
| D13 | **Mobile is a shrunk desktop.** Stat cards are enormous (one "66" fills a third of the screen); bottom-nav labels wrap ("Employer / Verification"); the "Search ⌘K" button wastes header space on a device with no ⌘.                                                                  | Mobile viewport, `/admin` and `/student`.                                                                |
| D14 | **Copy leaks implementation detail.** `/judge` says "FNV-1a-free, monotonic, deterministic" — meaningless and slightly alarming to a non-engineer judge.                                                                                                                               | `/judge` "Core innovation" section.                                                                      |
| D15 | **`<title>` is doubled.** "Sign in · KaushalSetu · KaushalSetu", "Technical Showcase · KaushalSetu" — layout template and page both append the brand.                                                                                                                                  | Browser tab on `/login`, `/judge`.                                                                       |
| D16 | **`/login` silently redirects an already-authenticated visitor** to their dashboard, with no "you're signed in as X — switch / sign out" panel. (You hit this yourself.)                                                                                                               | `app/login/page.tsx:25`.                                                                                 |
| D17 | **Two postings named identically** ("Machine Learning Engineer", both internships) in the recruiter list with no employer/team/id disambiguation.                                                                                                                                      | `/recruiter/opportunities`.                                                                              |
| D18 | **Demand data is internally incoherent for the narrative.** "SQL surging +97%" while "Python for Data declining −36%" on a platform whose flagship student targets ML Engineer.                                                                                                        | `/demand`.                                                                                               |
| D19 | **Funnel is non-monotonic.** Industry Home talent pipeline shows Offer (4) > Applied (3). A funnel that widens reads as a data bug.                                                                                                                                                    | `/industry` Home.                                                                                        |
| D20 | **No document management.** Resume, transcript, offer letters, internship certificates, project reports — nowhere to store, version, or share them with a signed URL. SIH names this explicitly.                                                                                       | Absent.                                                                                                  |

### 2.3 Structural verdict

The architecture is **right**. `lib/data` (view-models) over `lib/engines` (deterministic)
over a swappable source is a clean seam; the Drizzle schema is authored; the `AuthProvider`
abstraction is in place. Nothing in the foundation needs to be torn out. The work is at the
**surface layer** (make it interactive, make it dense, make it beautiful) and the
**capability layer** (add the five missing pieces). This is a _finish-the-product_ project,
not a _restart_.

---

## 3. UX Problems

1. **Read-only paralysis (D1).** A career platform where you cannot set your own career goal
   is a viewer, not a tool. Every "your X" screen must have a create/edit path.
2. **Empty-journey problem (D2, D11).** Years 1–3 of the spine look barren because there is
   no year-1 content model and no onboarding to seed it. A first-year has no internship and
   that is _correct_ — the UI must celebrate foundational progress (courses → first skills →
   first assessment → first mini-project), not show four grey "upcoming" stages.
3. **Duplication tax (D3, D4).** Profile ≈ Passport; Skills graph = Profile graph. Users
   pay attention twice for the same information and conclude the product is padded.
4. **Discoverability holes (D5).** The single most SIH-relevant verb — "assess me" — is
   hidden. Assessment should be a first-class destination _and_ a contextual CTA on every
   skill.
5. **Chat-as-navigation (D6).** Copilot competes with the IA instead of assisting inside it.
6. **Dead-ends (D7, D8).** Skills and Applications are terminal — you look, you cannot act,
   you cannot drill. Every list item should open a detail with actions.
7. **No pull (D10).** Nothing brings a user back next week. Without a notification/"what
   changed" surface, retention depends on the user remembering to visit.
8. **Mobile is an afterthought (D13).**
9. **Trust-through-polish gap (D12, D14).** Weak charts and leaked jargon undercut the
   "we are rigorous" message the product is built on.

---

## 4. UI Problems

1. **Anonymous visual identity.** Clean, but it is the default shadcn/Tailwind indigo look.
   Nothing about a screenshot says "KaushalSetu". No signature component, no distinctive
   data-ink style, no typographic personality, no motion language beyond a 6px rise.
2. **Weak data-viz.** Force-directed competency graph with overlapping labels and unclear
   encoding; "trend" data shown as percentage lists; micro-scatterplots. For a product
   whose entire claim is "we make competency legible", the charts are the least legible part.
3. **Density mismatch (§34).** Student Home is appropriately calm. But Skills, Institution
   analytics, and the recruiter candidate view — which _should_ be dense and scannable — are
   loose, single-column, and require heavy scrolling. Mobile is the inverse: far too sparse.
4. **Inconsistent component vocabulary.** "Skill graph & evidence" (page H1) vs "Skills &
   Evidence" (nav). Badges: `success`/`info`/`warning`/`muted`/`danger`/`accent` used
   without a documented semantic. Stat cards, list rows, and "chain" chips each have 2–3
   variants.
5. **No empty/loading craft.** `loading.tsx` is grey pulse blocks; empty states are a
   sentence of muted text. Reference products (Linear, Notion) treat these as brand moments.
6. **Icons are Unicode glyphs** (`◆ ▤ ✦ ■ ▲ ❖ ★ ◎ ✺ ▣`). They read as placeholder. A real
   icon set (even a small hand-built SVG set) is table stakes for "premium".

---

## 5. Navigation Problems

1. **Student nav is 11 links across 4 groups + Home.** Better than the old 10-flat, but
   "Career" and "Career Copilot" as siblings, and "Competency Profile" + "Passport" as
   siblings, still over-count destinations. Target: **4 primary + a utility cluster.**
2. **Assessment missing from nav (D5).**
3. **`/demand` is shared between Industry and Institution nav** with the same label but it is
   a different job for each. Fine to share the page; it needs role-framed context.
4. **Legacy student routes still resolve** (`/student/gaps` etc. now redirect — good) but
   `/student/opportunities/[id]` and `/recruiter/opportunities/[id]` are the only detail
   pages in the product; everything else is a list. The information architecture is
   list-heavy and detail-light.
5. **No global "create" affordance.** Linear/Notion put a persistent "New" action in the
   chrome. KaushalSetu has no way to start _anything_ from anywhere.
6. **Command palette is nav-only for 4 of 5 roles.** Only `student` has `QUICK_ACTIONS`.
7. **Switch-role lives in the sidebar footer as "⟲ Switch role" → `/demo`.** For a judge
   this is the most-used control in the product and it is tiny and bottom-left.

---

## 6. Information Architecture Problems

1. **The Competency Profile is described as "the single source of truth" but is not the hub
   of navigation.** It is one link among eleven. If it is the source of truth, the whole
   student experience should visibly _flow into and out of it_.
2. **Passport vs Profile is an IA smell**, not just a UI one — two nodes for one concept.
3. **"Career" holds seven tabs** (Goal / Readiness / Skill Gaps / Roadmap / Explore Roles /
   Opportunities / Applications). Goal+Readiness+Skill Gaps+Roadmap are one continuous idea
   ("where I stand against my goal and how to close it"); Opportunities+Applications are
   another ("acting on it"). Seven peer tabs flatten that structure.
4. **Evidence has no home.** It is a column on the Skills page and a concept in the copy,
   but there is no "Evidence" surface where a student sees _all_ their evidence, its
   verification state, and what is missing — even though "Evidence Confidence" is
   differentiator #1.
5. **Experiences ≠ Internships.** The model only knows "internships". Part-time work,
   research assistantships, teaching assistantships, volunteering, freelance, open-source —
   all of which produce competency — have nowhere to live. 12twenty and Symplicity both
   model this as a general "Experience / Outcome" object with a _type_.
6. **Learning has no home.** The gap→roadmap points at learning resources but there is no
   "my learning" surface tracking what was started/finished and which gap it closed.
   Coursera's entire IA is built on this; KaushalSetu names it in the loop diagram and then
   doesn't build it.

---

## 7. Feature Audit

Legend: ✅ solid · 🟡 exists but thin/partial · 🔴 missing · ✂️ remove/merge

### Student

| Feature                            | State    | Note                                                                         |
| ---------------------------------- | -------- | ---------------------------------------------------------------------------- |
| Journey Home + Next Best Action    | ✅       | Richen the NBA candidate set; add "this week" framing                        |
| Education (courses → skills)       | 🟡       | Only 5 courses; no add/edit; no faculty/academic-project link surfaced       |
| Skills list + evidence ledger      | 🟡       | No detail page, no target level, no last-assessed, no "raise this"           |
| Competency graph                   | ✅       | Fix label overlap; make it the Profile hero, not duplicated on Skills        |
| Evidence (as a surface)            | 🔴       | Differentiator #1 has no dedicated view                                      |
| Assessment (adaptive)              | 🟡       | Real engine; hidden from nav; only technical skills — no aptitude/soft-skill |
| Projects                           | 🟡       | 2 items; no add/edit; lifecycle fields exist in type but UI is thin          |
| Internship lifecycle               | ✅       | Strong; generalise to "Experiences" with a type                              |
| Certifications                     | 🟡       | Read-only; no upload; no issuer-verify path                                  |
| Achievements                       | 🟡       | Read-only; no add                                                            |
| Career: Goal                       | 🔴(edit) | Cannot actually set/change the goal                                          |
| Career: Readiness / Gaps / Roadmap | ✅       | Consolidate into one "Standing" view                                         |
| Career: Explore Roles (simulator)  | ✅       | Keep as a tab                                                                |
| Career: Opportunities              | 🟡       | List only; good match breakdown on detail                                    |
| Career: Applications               | 🟡       | Read-only bars; no timeline, no notes                                        |
| Competency Profile                 | 🟡       | Duplicates graph + Passport; should be the hub                               |
| Competency Passport                | 🟡       | Merge into Profile as a "shared view"; keep QR verify                        |
| Career Copilot                     | ✂️       | Demote from destination to contextual assist                                 |
| Learning tracker                   | 🔴       | Named in the loop, not built                                                 |
| Mentorship                         | 🔴       | SIH-named; absent                                                            |
| Documents                          | 🔴       | SIH-named; absent                                                            |
| Notifications / "what changed"     | 🔴       | Absent                                                                       |
| Onboarding                         | 🔴       | Absent                                                                       |

### Industry / Recruiter

| Feature                                       | State | Note                                                               |
| --------------------------------------------- | ----- | ------------------------------------------------------------------ |
| Home talent pipeline                          | 🟡    | Non-monotonic funnel; fix data + add "awaiting you" queue          |
| Postings (competency-defined)                 | 🟡    | No create/edit; two identical titles                               |
| Candidate ranking + per-factor + "Explain vs" | ✅    | The crown jewel                                                    |
| Stage actions (shortlist/interview/offer)     | ✅    | Recently added                                                     |
| Talent search                                 | 🟡    | Role-only; no attribute filters, no saved searches                 |
| Skill-Demand Signals                          | 🟡    | Weak viz; incoherent demo data                                     |
| Request assessment / interview scheduling     | 🔴    | "Invite to interview" is a status flip, not an action              |
| Mentorship / project sponsorship offers       | 🔴    | SIH-named academia–industry collaboration; absent on industry side |

### Faculty

| Feature                                           | State | Note                                                                                        |
| ------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------- |
| Overview (engagement score, queues)               | ✅    | Fine                                                                                        |
| Evidence verification (Approve / Request changes) | ✅    | Recently added; strong                                                                      |
| Collaboration pipeline                            | 🟡    | 4-column board; advance-stage works; no create, no FDP/consultancy/research typing surfaced |
| FDP / consultancy / research collaboration        | 🟡    | `CollaborationType` exists; not differentiated in UI                                        |
| Mentor a student / evaluate a project             | 🟡    | Faculty evaluations exist in data; no faculty-initiated flow                                |

### Institution

| Feature                                 | State | Note                                                             |
| --------------------------------------- | ----- | ---------------------------------------------------------------- |
| Command Center                          | ✅    | Good; department readiness + top gaps + "cross-reference demand" |
| Skill Heatmap → students → action       | ✅    | Flagship; keep                                                   |
| Cohorts (students table)                | ✅    | Fine; add filter/sort/export                                     |
| Placement Intelligence                  | 🟡    | Right idea; weak charts                                          |
| Industry Demand                         | 🟡    | Shared page; weak viz                                            |
| "Act on a gap" (create an intervention) | 🔴    | It recommends an action; you cannot record/track one             |

### Admin

| Feature                              | State | Note                     |
| ------------------------------------ | ----- | ------------------------ |
| Overview                             | ✅    | Clean                    |
| Taxonomy (roles/skills/competencies) | 🟡    | Read-only; fine for demo |
| Employer verification                | ✅    | Queue works              |
| Matching Config (live sliders)       | ✅    | Excellent                |
| Audit log                            | ✅    | Present                  |

### Public / cross-cutting

| Feature                                      | State | Note                                                                                   |
| -------------------------------------------- | ----- | -------------------------------------------------------------------------------------- |
| Landing                                      | ✅    | Clear, honest, well-structured                                                         |
| Judge mode                                   | 🟡    | Good walkthrough copy; leaks jargon; is a separate page, not an in-product guided tour |
| `/verify/[id]`                               | ✅    | Deterministic check code, honestly labelled                                            |
| Global search (⌘K)                           | 🟡    | Nav-only, student-only quick actions                                                   |
| Notifications                                | 🔴    | —                                                                                      |
| Integration readiness (DigiLocker/APAAR/NCS) | 🔴    | Claimed as future in docs; nothing shown, not even a stub/roadmap surface              |

---

## 8. SIH Requirement Mapping

The official PS text beyond the title is not published in the SIH mirrors; this matrix uses
the title + `RESEARCH.md`'s sourced interpretation + the standard skilling-portal
expectation set (NSQF/NOS/NCrF, NAPS, NCS, APAAR).

| Official requirement                                           | Current KaushalSetu                                          | Gap                              | Recommended change                                                                                                                                  | Priority | Reason                                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------- |
| **Skill mapping** (student skills ↔ roles)                     | Competency graph, `resolveProfile`, role QP model            | Editing + breadth thin           | Editable skills; 40+ course catalogue seeding                                                                                                       | MUST     | Core of the PS                                                                    |
| **Skill assessment — technical**                               | Adaptive MCQ engine                                          | Hidden; few skills               | Promote to nav; expand item bank; per-skill CTA                                                                                                     | MUST     | Named requirement; already built                                                  |
| **Aptitude assessment**                                        | 🔴                                                           | No aptitude test                 | Add a short aptitude battery (numerical/logical/verbal) feeding a separate "aptitude" evidence type                                                 | SHOULD   | Explicitly named; low effort, high demo value                                     |
| **Soft-skill assessment**                                      | Behavioural competencies exist in role model; no instrument  | 🔴                               | Add situational-judgement items + faculty/peer behavioural endorsement                                                                              | SHOULD   | Named; Ayush employers (regulatory, medical affairs) weight communication heavily |
| **Skill profiling / digital portfolio**                        | Profile + Passport                                           | Duplication; not shareable-first | Merge; public shareable link (Handshake pattern); PDF export                                                                                        | MUST     | "Digital portfolio" is explicit                                                   |
| **Skill gap analysis**                                         | `computeSkillGap`, prerequisite-aware roadmap                | ✅                               | Keep; surface "gap → learning → project → evidence" as one tracked flow                                                                             | KEEP     | Strong                                                                            |
| **Learning / upskilling**                                      | Resource links in roadmap                                    | 🟡 no tracking                   | "My Learning" surface: started/finished, which gap closed                                                                                           | SHOULD   | Closes the loop the docs describe                                                 |
| **Certification**                                              | Certifications page                                          | Read-only, no upload/verify      | Upload + issuer-verify state + skill linkage requirement                                                                                            | SHOULD   | Named                                                                             |
| **Career guidance**                                            | Copilot + Explore Roles + readiness                          | Copilot over-weighted            | Demote copilot to assist; keep Explore Roles                                                                                                        | KEEP     | Adequate once reframed                                                            |
| **Internships**                                                | Full lifecycle + workspace                                   | ✅                               | Generalise to Experiences(type); add discovery filters                                                                                              | KEEP     | Best-built area                                                                   |
| **Projects**                                                   | Projects + `[id]`                                            | Thin; no add                     | Add/edit; make lifecycle fields visible; team roles                                                                                                 | MUST     | Named; primary evidence source                                                    |
| **Apprenticeships (NAPS)**                                     | 🔴                                                           | Not modelled                     | Add "apprenticeship" as an Experience type + an NAPS-style contract stub                                                                            | NICE     | Named in PS family;低-effort as a type                                            |
| **Industry matching**                                          | Explainable engine both sides                                | ✅                               | Keep; add attribute filters to talent search                                                                                                        | KEEP     | Differentiator                                                                    |
| **Applications + tracking**                                    | Read-only bars                                               | 🟡                               | Application detail: timeline, notes, linked match+gap, next step                                                                                    | MUST     | "Tracking" is explicit                                                            |
| **Mentorship**                                                 | 🔴                                                           | Absent                           | Mentor object: faculty or industry mentor ↔ student, sessions, notes, linked to a goal/experience                                                   | SHOULD   | Named; ties academia–industry                                                     |
| **Academia–industry collaboration**                            | Faculty collaboration board                                  | 🟡 typing                        | Differentiate FDP / live project / consultancy / research / curriculum-input; industry-initiated offers                                             | SHOULD   | Named; currently one-sided                                                        |
| **Faculty opportunities (FDP / consultancy / research)**       | `CollaborationType` in data                                  | 🟡 UI                            | Faculty "Opportunities" tab: FDPs to join, consultancy RFPs, research calls                                                                         | SHOULD   | Named; faculty side is thinnest role                                              |
| **Placement / recruitment**                                    | Recruiter flow + institution placement intelligence          | 🟡 no posting create             | Recruiter: create/edit posting; institution: drive/eligibility view                                                                                 | SHOULD   | Named                                                                             |
| **Institution analytics**                                      | Command Center + heatmap + placement intel                   | ✅                               | Better viz; "record an intervention"                                                                                                                | KEEP     | Flagship                                                                          |
| **Industry analytics**                                         | Demand signals                                               | 🟡 viz                           | Real trend series; role-demand; skill co-occurrence                                                                                                 | SHOULD   | Named                                                                             |
| **Role-based access**                                          | `requireRole`, 5 roles, guards + redirects                   | ✅                               | Keep; add a real "switch"/multi-role affordance                                                                                                     | KEEP     | Solid                                                                             |
| **Document management**                                        | 🔴                                                           | Absent                           | Documents surface per user: resume/transcript/certificates/offer letters; typed; signed-URL share; versioned                                        | SHOULD   | Explicit; also underpins verification                                             |
| **Security**                                                   | Server guards, `server-only`, Zod, RLS (prod), honest labels | ✅ (demo-appropriate)            | Add headers/CSP + rate-limit before "real data" (already in SECURITY.md as future)                                                                  | KEEP     | Documented honestly                                                               |
| **Integration readiness** (DigiLocker / APAAR-ABC / NCS / SSC) | Claimed future in docs                                       | 🔴 nothing shown                 | An "Integrations" surface (admin) listing each with status "planned", and Passport "emit NCrF credit event" as a visible (stubbed, labelled) action | SHOULD   | Judges ask "how does this fit the ecosystem"                                      |

**Net:** the PS's _matching / analytics / evidence_ spine is well covered. The gaps are
**assessment breadth (aptitude/soft-skill), mentorship, learning tracking, documents,
faculty opportunities, and a visible integration story.** None is large.

---

## 9. Competitive Research (summary)

| Product                                 | One-line role model                           | The one thing to steal                                                                                                                                                                                                       | The one thing to avoid                                                                                                                        |
| --------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Handshake**                           | "Show up, get hired" — student career network | 2026 profile redesign puts **career interests first**; **public shareable profile link** as your "digital careers identity"; dedicated student app                                                                           | It is fundamentally a discovery marketplace; endorsements are social; no institutional gap analytics                                          |
| **12twenty**                            | University-first Career Cloud (5 hubs)        | **Experiential Learning as a first-class lifecycle** with configurable questionnaires + faculty approver roles + hours/evaluations; **Outcome analytics** that turns first-destination data into minutes-not-weeks reporting | Enterprise ERP surface area; heavy admin configuration                                                                                        |
| **Degreed**                             | Skills-graph learning platform                | **8-point scale + explicit rating-source hierarchy** (Skill Review > Manager > Peer > Self) shown on the skill card; **adaptive Bayesian skill review** with **endorsers**                                                   | Consumer-grade "rate yourself" nudges without evidence can inflate; enterprise L&D framing                                                    |
| **Symplicity CSM / Outcome / Pathways** | Student-success platform                      | **Pathways** = advisor-defined structured skill-development plans with measurable success; **claim skills against experiences + reflection**                                                                                 | Breadth = complexity; feels like compliance software                                                                                          |
| **Linear**                              | The system for product development            | **Keyboard-first, command palette for every action**, minimal chrome, colour used _only_ for status/priority, no decoration, instant transitions, "New" always available                                                     | Dark-mode-native aesthetic is not right for a government/education product; issue-tracker density                                             |
| **Notion**                              | The workspace where teams think               | **Views over routes** (one page, switchable views); nested hierarchy; **peek/side-panel** to open an item without losing context; slash-command create                                                                       | Infinite flexibility → blank-page paralysis; not a fit for a guided journey                                                                   |
| **Coursera**                            | Learn the skill, get the credential           | **Sequenced paths with visible progress**; every item declares **"skills you'll gain"**; **role-based collections** ("prepare for a career in…"); "Continue learning" card                                                   | Content marketplace; upsell surface; not evidence-verified                                                                                    |
| **LinkedIn**                            | Professional identity + network               | Clean **identity blocks** (Education / Experience / Skills / Projects / Certifications / Honors) that any recruiter parses instantly                                                                                         | Self-declared skills; "endorsements" are a popularity contest; no gap or curriculum loop — _this is exactly what KaushalSetu must not become_ |
| **Eightfold / Gloat**                   | Talent-intelligence / internal marketplace    | **Skill adjacency** (who could grow into this role) and **inferred skills** from history; a **marketplace** framing (projects, gigs, mentors, moves)                                                                         | Black-box deep-learning inference — the opposite of KaushalSetu's "every point attributable" promise                                          |
| **Fuel50 / Suitable**                   | Career pathing / co-curricular records        | **Co-curricular record** — verified non-academic achievement as a transcript; career "pathways" with adjacency                                                                                                               | HR-suite lock-in                                                                                                                              |

Cross-cutting pattern in every strong product: **one identity object, many lenses; progress
is always visible; every artefact declares which skills it develops; creation is one action
away.**

---

## 10. Handshake — deeper

- **What makes it easy to understand:** the whole product answers one question — "what
  should I apply to?" Home is a personalised feed. The profile is short identity blocks, not
  a form. Onboarding asks for career interests + a couple of skills, then enriches over time.
- **2026 redesign signals:** career interests moved to the top of the profile; a
  **public, shareable profile link** positioned as the student's real digital identity;
  a redesigned "career-center view" of the profile (the institution sees the same object the
  student edits); AI features are surfaced **contextually** (profile enhancement, planning)
  and there is a dedicated **AI jobs** home rather than a chatbot bolted onto navigation.
- **Adopt:** career-interest-first profile ordering; public shareable Passport link;
  one shared profile object seen by student + faculty + recruiter with role-appropriate
  edit rights; contextual AI, not a chat destination.
- **Do not adopt:** the feed-as-homepage (KaushalSetu's journey Home is better for a
  4-year arc); social endorsements; treating the profile as a marketing artefact rather than
  an evidence ledger.
- **Why students return to Handshake:** new matched roles + employer messages + upcoming
  events create a reason to check weekly. KaushalSetu currently has **no** weekly hook — this
  is the retention gap notifications must fill.

---

## 11. 12twenty — deeper

- **How it avoids ERP-overwhelm:** it splits into named "hubs" (Career Services,
  Experiential Learning, Outcome/analytics, Employer Relationships, Community) so each user
  type only ever sees their hub. Students see a small surface; admins see configuration.
- **Experiential Learning lifecycle:** record an experience → declare a faculty supervisor →
  route through a configurable approval workflow → log hours → complete an evaluation
  questionnaire → it becomes a tracked **Outcome** that feeds first-destination reporting.
- **Adopt:** generalise KaushalSetu's internship workspace into an **Experiences** object
  with a _type_ (internship / apprenticeship / research / part-time / TA / volunteer /
  freelance / open-source), each with the same lifecycle skeleton and a
  faculty-approver + industry-mentor evaluation at the end that writes verified competency.
  Adopt the **configurable end-of-experience evaluation** (a short structured form → evidence).
- **Adopt:** Outcome analytics framing for the institution — "first destination in minutes,
  not weeks", correlated with competency development (KaushalSetu's Placement Intelligence
  is already reaching for this; make the charts real).
- **Do not adopt:** the volume of admin configuration screens; PDF-form uploads as the
  primary data-capture mechanism.

---

## 12. Degreed — deeper

- **Skill card = the atom.** Each skill shows a single rating number, and _where it came
  from_, via an explicit hierarchy: **Skill Review (assessment) > Manager > Peer > Self.**
  8-point scale.
- **Skill Review** is an adaptive Bayesian behavioural questionnaire (100+ items,
  psychometrician-designed) that produces the highest-trust rating; **endorsers** can
  validate a review.
- **Adopt directly:** KaushalSetu's per-skill detail page (currently missing, D7) should be
  a **Degreed-style skill card**: current effective level, the ordered evidence stack with
  the winning evidence type highlighted, last-assessed date, target level, and one CTA
  ("Take the assessment" / "Request faculty verification" / "Attach a project").
  KaushalSetu's evidence hierarchy is _already_ this idea — it just isn't rendered per skill.
- **Adopt:** **peer endorsement** as a distinct, low-weight evidence type (below faculty,
  above self) — cheap to add, and it makes the ledger feel alive in years 1–2 before there
  is industry evidence.
- **Do not adopt:** self-rating nudges as the primary profile-building mechanism (evidence
  first, self-claim last — KaushalSetu already has this right).

---

## 13. Linear — deeper

Why it feels simple despite depth:

1. **One primary object** (the issue). Everything is a view of issues.
2. **The command palette is the real UI.** Every action is reachable by `⌘K` → type → enter.
   The mouse is optional.
3. **Colour is information, never decoration** — a status dot, a priority icon. The canvas is
   monochrome.
4. **Transitions are instant and consistent** — the detail panel always slides from the same
   edge; nothing reflows.
5. **Keyboard shortcuts for everything**, discoverable via the palette and a `?` overlay.
6. **"New" is always one key away.**

Apply to KaushalSetu (principles, not the dark aesthetic):

- Make the command palette do **actions**, not just navigation, for **all** roles ("Take an
  assessment", "Add a project", "Verify next in queue", "Post a role", "Record an
  intervention").
- Reserve colour for evidence-confidence and readiness bands; make the rest of the canvas
  calm.
- One consistent **side-panel** pattern for every detail (skill, project, application,
  candidate, experience) so drilling in never loses context (this is also the Notion peek).
- A persistent **"＋ New"** in the header, role-aware.
- A `?` keyboard-shortcut sheet.

---

## 14. Notion — deeper

- **Views over routes.** A database is one thing; Table / Board / Timeline / Calendar are
  lenses. KaushalSetu should treat "Career" as one object with lenses, not seven sibling
  tabs; treat "Experiences" as one list with filters, not separate pages per type.
- **Peek.** Click a row → it opens in a side panel over the current context; you can go
  deeper or close and you are exactly where you were.
- **Progressive disclosure.** A page shows a title and a few properties; everything else is
  collapsed until asked for.
- **Slash-to-create.** Creation happens inline, where you are.

Apply: the **side-panel detail** pattern everywhere; **collapsible sections** on dense
screens (Skills, Institution analytics); **inline create** ("＋ add a project" right on the
Projects list, not a separate route).

Avoid: Notion's blank-canvas freedom — KaushalSetu's value is the _opinionated_ journey.

---

## 15. Coursera — deeper

- **The learning atom declares its skills** ("Skills you'll gain: …") and its position in a
  **path** with a progress ring.
- **Role-based collections** ("Prepare for a career in Data Analytics") bundle courses →
  project → certificate into a sequence.
- **"Continue learning"** is the single most prominent element for a returning user.
- **"Ask Coursera"** AI is a contextual helper, not the navigation.

Apply: build the **"gap → learning → project → assessment → evidence"** chain as a _tracked
sequence_ on a "My Learning" surface. When `computeSkillGap` produces a roadmap step, it
should become a trackable item: _not started → learning → practising (project) → assessed →
evidenced_, with the same progress semantics Coursera uses. This is the missing middle of
KaushalSetu's own loop diagram.

---

## 16. LinkedIn — deeper

- **Strength:** the identity blocks (Education / Experience / Skills / Projects /
  Certifications / Honors & Awards / Volunteering) are a universal grammar every recruiter
  reads in seconds. KaushalSetu's Passport should use the _same familiar block order_ so it
  is instantly legible — then add the thing LinkedIn lacks: an **evidence state** on every
  line.
- **Weakness (the anti-pattern):** skills are self-declared; "endorsements" are one-click
  social signals with no evidentiary weight; there is no gap analysis, no institutional
  view, no curriculum loop. A recruiter cannot tell a real skill from an aspirational one —
  which is _precisely_ the problem SIH26044 exists to solve.
- **Positioning discipline:** KaushalSetu must never describe itself as "LinkedIn for
  students". The one-liner in the docs is right: _LinkedIn shows who says they can do the
  job; KaushalSetu shows the evidence._ Keep that line on the landing page and the Passport.

---

## 17. Additional Product Research (≥5)

1. **Symplicity CSM + Outcome + Pathways** — closest institutional analog. "Pathways" =
   advisor-defined skill-development plans; "Outcome" = experiential-learning lifecycle
   mapped to competency frameworks; "Skills Development" = claim skills against experiences +
   reflection. **Steal:** advisor/faculty-defined pathways as a first-class object;
   reflection prompts at the end of every experience.
2. **Eightfold Skills Intelligence** — infers skills and **skill adjacencies** from history;
   powers "who could grow into this role". **Steal (transparently):** a deterministic
   "adjacent roles / adjacent skills" view driven by competency overlap (KaushalSetu's
   "roles you are closest to" is the seed of this — expand it to "skills one step away").
   **Reject:** opaque inference.
3. **Gloat Talent Marketplace** — frames talent as a marketplace of projects, gigs, mentors,
   moves. **Steal:** the _marketplace framing_ for the student — opportunities are not just
   jobs but also projects to join, mentors to request, assessments to take.
4. **Fuel50** — career-pathing with adjacency + a talent marketplace + mentoring in one.
   **Steal:** "career path" visualisation (current role → target role via intermediate
   roles, each with the competency delta).
5. **Suitable / co-curricular record platforms** — verified non-academic achievement as an
   official transcript. **Steal:** the **co-curricular record** concept — KaushalSetu's
   Achievements + verified Experiences _are_ a co-curricular record; brand and export them
   as one.
6. **AICTE / NAPS / NATS internship & apprenticeship portals (context)** — the government
   baseline KaushalSetu is implicitly competing with / complementing. **Implication:**
   include a visible "this is how we plug into NAPS/NATS/NCS/APAAR" surface even if stubbed.

---

## 18. What We Should Adopt

1. **One shared profile object, role-scoped edit rights** (Handshake 2026). Student edits;
   faculty verifies; recruiter reads; institution aggregates — _the same object_.
2. **Per-skill "skill card" with the evidence stack and one CTA** (Degreed).
3. **Experiences as a typed lifecycle object** with a structured end-evaluation → verified
   competency (12twenty).
4. **Views over routes; side-panel detail; inline create** (Notion + Linear).
5. **Command palette = actions for every role; "＋ New" always present; `?` shortcut sheet**
   (Linear).
6. **"gap → learning → project → assessment → evidence" as a tracked sequence** (Coursera).
7. **Public shareable Passport link + PDF export + familiar identity-block order** (Handshake
   - LinkedIn).
8. **Peer endorsement as a low-weight evidence type** (Degreed) — makes years 1–2 feel alive.
9. **Reflection prompt at the end of every experience** (Symplicity).
10. **Deterministic "adjacent roles / adjacent skills"** (Eightfold idea, transparent
    implementation).
11. **Outcome/first-destination analytics done properly** with real trend charts (12twenty).
12. **A weekly hook**: "what changed since you were last here" (every strong product has one).

---

## 19. What We Should Avoid

1. **Self-declared skills as the profile spine** (LinkedIn). Evidence first, always.
2. **Social endorsements as a headline number** (LinkedIn).
3. **A chatbot as a navigation destination** (anti-Linear/Handshake). Copilot assists in
   context.
4. **Opaque AI inference of skills or scores** (Eightfold/Gloat). Every point attributable.
5. **Enterprise-ERP surface area** (12twenty/Symplicity full config). Keep the student
   surface tiny; hide complexity in admin.
6. **Dark-mode-native / issue-tracker density as the default aesthetic** (Linear look).
7. **Blank-canvas flexibility** (Notion). The journey is opinionated on purpose.
8. **Marketplace upsell patterns** (Coursera). No "unlock" anything.
9. **Fabricated integration claims.** Show integration _intent_ honestly labelled; never
   fake a DigiLocker/APAAR handshake.
10. **Feature-count as a demo strategy.** Depth on the loop beats 50 shallow screens
    (your own `RESEARCH.md` §4 — keep obeying it).

---

## 20. Proposed Product Vision

> **KaushalSetu is the verified competency record that a student builds from the first week
> of college to their first job — and the intelligence layer that lets faculty, industry and
> the institution act on it.**
>
> One student, one evidence-backed profile. Every course, project, assessment, experience
> and endorsement flows into it. It tells the student the single next thing that raises their
> readiness; it tells a recruiter exactly why one candidate outranks another, in a number the
> student sees too; it tells faculty what to verify; and it tells the institution which
> competencies are systemically missing and what to do about it. Deterministic engines
> decide; AI only explains; nothing is a black box; nothing is faked.

**One sentence:** _An evidence-based competency record and intelligence layer that connects a
student's whole academic-to-employment journey — and makes every step verifiable._

---

## 21. Proposed Information Architecture

**Principle:** one identity object (**the Competency Record**), a small number of _workspaces_
that flow into it, and _lenses_ instead of sibling routes.

```
Student
├── Home                     — orientation: journey, ONE next best action, what changed, 2–3 opportunities
├── My Record  ★ the hub     — the Competency Record (source of truth), with lenses:
│     ├── Overview            — competency graph + readiness + evidence coverage (VCC) + "inputs feeding this"
│     ├── Education           — institution/degree/terms/courses → skills (editable)
│     ├── Skills & Evidence   — skill cards (Degreed-style) + the Evidence ledger with verification state
│     ├── Experiences         — internships / apprenticeship / research / part-time / TA / volunteer / OSS (typed lifecycle)
│     ├── Projects            — typed, full lifecycle, skill→evidence→competency chain
│     ├── Credentials         — certifications + achievements + co-curricular record (upload, issuer-verify)
│     └── Documents           — resume / transcript / certificates / offer letters (typed, versioned, signed-URL share)
├── Career                   — one workspace, two lenses:
│     ├── Standing            — Goal (editable) · Readiness · Skill Gaps · Roadmap · Explore adjacent roles
│     └── Pursuit             — Opportunities (jobs/projects/mentors/assessments) · Applications (with detail timelines)
├── Learn                    — "My Learning": roadmap steps as tracked items (not started → learning → practising → assessed → evidenced)
└── (utility)  Passport (shared view of the Record) · Mentors · Notifications · Settings · ⌘K
```

- **Nav = 4 primary** (Home / My Record / Career / Learn) + a utility cluster
  (Passport, Mentors, Notifications, Settings).
- **Passport = a _view_ of My Record**, not a separate data node: a "Share / export" mode
  that renders the Record in LinkedIn-familiar block order with evidence states and a QR.
- **Copilot** disappears as a destination; it becomes a "?"-style assist button available on
  every screen, pre-seeded with that screen's context.
- **Assessment** is not a nav item — it is a **verb** reachable from every skill card, the
  Next Best Action, the command palette, and a "Assess me" button on the Skills lens.

```
Industry
├── Home            — pipeline (fixed funnel) + "awaiting your decision" queue + demand snapshot
├── Roles           — postings (create / edit / close); each defined by competencies
│     └── Role → Candidates   — the explainable ranking + per-factor + Explain vs + stage actions + request assessment/interview
├── Talent Search   — attribute + competency filters, saved searches, shortlists as objects
├── Collaborate     — offer a live project / mentorship / sponsor an assessment / propose curriculum input
└── Market          — Skill-Demand Intelligence (real trend series)

Faculty
├── Home            — engagement score + verification queue + my mentees + my collaborations
├── Verify          — evidence queue (Approve / Request changes / add a note)
├── Mentor          — my mentees, sessions, notes, linked goals
├── Collaborate     — my pipeline + Opportunities (FDPs to join, consultancy RFPs, research calls, curriculum input)
└── (curriculum signal) — "what industry is asking for vs what my courses produce"

Institution
├── Command Center  — readiness, department breakdown, top systemic gaps, "what changed"
├── Heatmap         — department × skill → students → recommended action → RECORD AN INTERVENTION (new)
├── Cohorts         — students table (filter/sort/export)
├── Outcomes        — placement/first-destination intelligence, correlated with competency development (real charts)
├── Demand          — industry demand, role-framed for curriculum planning
└── Interventions   — recorded actions from the heatmap, with status and a later "did it move the gap?" check

Admin
├── Overview
├── Taxonomy        — roles / skills / competencies (read + light edit)
├── Employers       — verification queue
├── Matching        — live weight sliders (keep exactly as-is)
├── Integrations    — DigiLocker / APAAR-ABC / NCS / SSC — each with an honest status (planned / stubbed)
└── Audit
```

---

## 22. Proposed Navigation

- **Student primary (persistent left rail, desktop):** Home · My Record · Career · Learn.
  **Utility (rail footer):** Passport · Mentors · 🔔 Notifications · Settings · Switch role.
- **Header (all roles):** breadcrumb · **＋ New** (role-aware) · ⌘K · assist ("?") · account.
- **Mobile bottom nav (student):** Home · Record · Career · Learn · (🔔 in header).
- **Within My Record / Career / Learn:** a lens switcher (segmented control), not sub-routes
  in the rail. Deep links still work (`/record/skills`, `/career?lens=pursuit`).
- **Command palette:** navigation **and actions**, all roles. Actions: "Assess a skill",
  "Add a project", "Log an experience", "Request verification", "Post a role", "Verify next",
  "Record an intervention", "Open my Passport", "Switch role".
- **`?`** opens a keyboard-shortcut + assist sheet.

---

## 23. Student Journey (the four-year arc)

The spine stays 7 stages, but each stage now has **year-appropriate content and a
"foundational vs advanced" framing** so years 1–3 are not empty.

| Phase                    | What the student does                                                                                                                                   | What the product shows                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Onboarding (week 1)**  | 4 steps: identity → education (institution/degree/term auto-fills a course catalogue) → 2–3 career interests → self-rate 3 skills                       | Record created; journey seeded at "Education"; first Next Best Action = "Take your first assessment"             |
| **Year 1 — Foundations** | Complete courses (grades import skills as _low-evidence_); take aptitude + 2–3 foundational assessments; log 1 mini-project; get 1 peer endorsement     | Journey at Skills→Evidence; VCC starts climbing from ~0; NBA cycles through assess / project / verify            |
| **Year 2 — Build**       | More courses; 2–3 projects with real lifecycle; first certification; set a firmer career goal; start closing the top gap via a tracked Learn item       | Journey at Projects; Explore-adjacent-roles becomes useful; gap→learning→project→evidence chain visibly advances |
| **Year 3 — Exposure**    | Apply to internships (explainable match); first internship → lifecycle → mentor evaluation → **verified** competency; request a faculty/industry mentor | Journey at Experience; VCC jumps on the first verified delta; readiness crosses "Developing → Approaching"       |
| **Year 4 — Convert**     | Final-year project (industry-evaluated); more applications with tracked timelines; Passport shared publicly; placement outcome recorded                 | Journey at Readiness→Placement; Passport is "everything proven"; institution sees the outcome feed               |

**Design consequence:** the journey stepper needs a **"foundational" band** (stages 1–4
count toward a "Foundation complete" milestone) so a year-2 student feels 60% done with
_their_ current arc, not 25% done with a placement they are years from.

---

## 24. Education Architecture

- **Object:** `EducationRecord` (exists) → add `terms[]` each with `courses[]`; a `Course`
  has code, title, credits, term, grade, **`skillContributions[{skillId, weight}]`**,
  optional `facultyId`, optional linked `academicProjectId`.
- **UI:** term accordion; each course row expands to show the skills it produced and _at
  what evidence level_ ("course grade → Applied Statistics, low-evidence L2 — assess to
  confirm"). Editable: add a course, set a grade, link a project, tag the faculty.
- **The relationship rendered:** on a skill card, an "Origins" line — "DBMS (grade A) →
  SQL"; "SQL assessment 84% → SQL"; "Student Management System project → SQL". This is §16
  of your brief, made concrete.
- **Seed:** ship a 40+ course catalogue per programme type (engineering / BAMS / B.Pharm /
  polytechnic) so a real student's four years populate.

---

## 25. Skills Architecture

- **Skill card (new detail surface, D7):** effective level (NSQF 1–8) · target level ·
  the **ordered evidence stack** with the winning kind highlighted (self → peer → assessment
  → project → certificate → faculty → industry) · last assessed · confidence band · "Origins"
  (courses/projects/experiences that contributed) · **one primary CTA** (Take the assessment
  / Request verification / Attach a project) · history sparkline (level over time).
- **Skills lens:** a scannable table (level, target, evidence band, last assessed, gap to
  target) _and_ the competency graph as a toggle — not two pages.
- **Peer endorsement:** new evidence kind, weight between self and assessment; a student can
  request it from a classmate who worked on the same project.
- **"How good am I / why does the system believe this"** — answered by the card's level +
  the evidence stack, side by side, in one glance.

---

## 26. Evidence Architecture

- **Give Evidence a home:** an "Evidence ledger" lens on My Record showing _every_ evidence
  item across all skills, filterable by state (**verified / pending / self-only / missing**)
  and by kind, with a headline **Verified Competency Coverage** number and "3 items are one
  faculty sign-off away from raising your readiness by ~4 points".
- **Verification requests are objects:** student requests → appears in faculty queue →
  Approve / Request changes / note → state and audit row. (Half-built already; make the
  request a first-class, trackable thing on the student side.)
- **Evidence decay (optional, honest):** an assessment older than N months is shown as
  "stale — reassess". Signals rigour.

---

## 27. Project Architecture

- **Type:** mini / final-year / personal / academic / industry / open-source (exists).
- **Lifecycle:** idea → in progress → submitted → evaluated (faculty and/or industry) →
  evidenced. Show it as a small pipeline like the internship one.
- **Fields surfaced:** role/contribution, team + each member's role, tech, timeline,
  repo/demo/docs links, **claimed competencies**, evaluations (rubric scores + comments),
  resulting evidence.
- **Create/edit inline** from the Projects lens.
- **Chain rendered on the card:** `skills used → evidence produced → competency advanced`.
- **Link to a course** (academic projects) and to an **experience** (industry projects) so
  the graph is connected, not islands.

---

## 28. Experience Architecture (generalises Internship)

- **One object, a `type`:** internship / apprenticeship (NAPS) / research assistantship /
  teaching assistantship / part-time / freelance / volunteer / open-source.
- **Shared lifecycle:** discovered → applied → shortlisted → selected → onboarding → active →
  milestones → mentor feedback → final evaluation → completed → **verified skills**.
  (Non-application types skip the first stages.)
- **End-of-experience structured evaluation** (12twenty pattern): a short configurable form
  the mentor completes (rubric + skill deltas + verdict) → writes verified competency +
  a credential + a journey event.
- **Reflection prompt** for the student (Symplicity pattern): "what did you actually learn"
  → attached to the experience, visible on the Passport.
- **Discovery filters** for internships specifically (location, duration, stipend, remote,
  sector — Ayush sector filter matters).

---

## 29. Career Architecture

- **One workspace, two lenses:**
  - **Standing** = Goal (**editable**: target role + sectors + locations + timeline, and
    _everything recomputes_ — this is the missing interaction D1) · Readiness (weighted
    factors, "AI explains, never sets") · Skill Gaps (ranked, prerequisite-aware) · Roadmap
    (sequenced) · Explore adjacent roles (simulator + "roles you're closest to" + "skills
    one step away").
  - **Pursuit** = Opportunities (jobs _and_ projects to join _and_ mentors to request _and_
    assessments to take — the marketplace framing) · Applications (each opens a **detail**:
    stage timeline, the match breakdown at time of apply, the gap it exposed, recruiter
    notes, next step, linked interview/assessment).
- **Career-path visual** (Fuel50 pattern): current standing → target role via 0–2
  intermediate roles, each edge annotated with the competency delta.

---

## 30. Industry Architecture

- **Mental model:** _Find talent you can trust, and help develop it._ (Not just "find".)
- **Roles:** create / edit / close a posting; define it by **competencies + level bars**
  (the requirement-profile UI already exists on the detail page — make it an editor).
- **Role → Candidates:** keep the explainable ranking exactly as-is (it is the jewel); add
  real actions — **Request an assessment** (fires a specific assessment to the candidate),
  **Schedule an interview** (a slot, not just a status), **Send a message** (scoped).
- **Talent Search:** competency filter + attributes (institution, programme, grad year,
  location, min evidence band, verified-only) + **saved searches** + **shortlists as named
  objects** you can compare and act on in bulk.
- **Collaborate:** offer a live project, offer mentorship, sponsor an assessment for a
  cohort, propose curriculum input — each becomes a faculty/institution-visible item. This
  is the "academia–industry collaboration" the PS names, from the industry side.
- **Market:** real demand **trend series** (12+ synthetic periods), role demand,
  skill co-occurrence ("roles asking for MLOps also ask for…").

---

## 31. Faculty Architecture

- **Mental model:** _Verify, mentor, connect._
- **Verify:** the evidence queue (Approve / Request changes / note) — keep; add batch
  actions and a "why this matters" (which downstream numbers move).
- **Mentor:** a real mentee list; log a session (date, notes, agreed actions linked to the
  student's goal/gap); see each mentee's journey + VCC.
- **Collaborate:** the pipeline board (keep) + a faculty **Opportunities** tab —
  FDPs to join, consultancy RFPs from industry, research collaboration calls, curriculum-input
  requests. Typed by `CollaborationType` (already in the model).
- **Curriculum signal:** a compact "what my courses produce vs what industry is asking for"
  panel — the faculty-scoped view of the institutional gap. This is the loop the docs
  promise, delivered to the person who can actually change a syllabus.

---

## 32. Institution Architecture

- Keep Command Center + Heatmap + Cohorts + Outcomes + Demand.
- **New: Interventions.** When the heatmap recommends an action ("184 students lack MLOps →
  add an elective"), let the admin **record** it as an intervention (owner, target cohort,
  date, expected effect). Later, the system shows "gap then vs now" for that cohort. This
  turns the flagship from "nice chart" into "closed-loop workforce planning" — a materially
  stronger judge story.
- **Outcomes:** real scatter/trend charts; first-destination reporting framed as
  "minutes not weeks" (12twenty); the correlation "readiness at offer ↔ CTC / time-to-offer"
  as the argument for competency investment.
- **Demand:** role-framed ("your students target these 6 roles; here is the demand and the
  gap for each").

---

## 33. Admin Architecture

- Keep it minimal and isolated (it already is).
- Taxonomy: read + light edit (add a skill, retire a role).
- **New: Integrations surface** — DigiLocker, APAAR/ABC, NCS, SSC/NOS feeds — each a row
  with an **honest status** ("planned", "stubbed — emits a labelled demo event"). The
  Passport gets a visible, clearly-labelled "emit NCrF credit event (demo)" action so the
  ecosystem story is _shown_, not just claimed in a doc.
- Matching Config: **do not touch** — it is perfect.

---

## 34. Profile Architecture

- **The Competency Record is the hub** (nav item "My Record"), with lenses (Overview,
  Education, Skills & Evidence, Experiences, Projects, Credentials, Documents).
- **Overview lens** = the current `/student/profile` content done well: competency graph
  (labels fixed), readiness, **VCC** as the headline, and the "inputs feeding this" panel
  where each row links to its lens.
- Everything a student can add lives under a lens with **inline create**.
- Role views: faculty sees the Record read-only + a "verify" affordance; recruiter sees it
  read-only, evidence-forward; institution sees it aggregated. **One object.**

---

## 35. Passport Architecture

- **Passport = a shared/export view of the Record**, not a separate page with its own data.
- Renders in **LinkedIn-familiar block order** (Identity → Education → Experience → Projects
  → Skills → Certifications → Achievements) so any recruiter reads it in seconds — but every
  line carries an **evidence badge** (verified / assessed / self).
- Header card: name, institution, grad year, **VCC**, readiness band, QR → `/verify/[id]`.
- **Public shareable link** (Handshake 2026) + **PDF export**.
- The verification page (`/verify/[id]`) stays exactly as-is — deterministic check code,
  honestly labelled.
- **Distinction from the Record, stated in one line on the page:** _"Your Record is where
  you build; your Passport is what you share."_

---

## 36. Notification Strategy

- **A "What changed" surface** (🔔 in the header) — the weekly hook the product currently
  lacks. Deterministic, generated from state transitions, never noisy.
- **Event types:** assessment result posted · evidence verified / changes requested ·
  experience milestone due · mentor feedback added · application status changed · new
  strong-match opportunity · deadline in 3 days · gap newly unblocked (a prerequisite is now
  met) · institution intervention that affects you.
- **Rules:** at most one digest card per category per visit; every notification links to the
  exact place to act; a student can mute categories; nothing is push/email in the prototype
  (labelled "in-app only").
- **Home** surfaces the top 2 as "Since you were last here".

---

## 37. Search Strategy

- **⌘K / Ctrl+K** for all roles: **navigate + act + find** (students, skills, roles,
  courses, projects, opportunities, competencies).
- On mobile, the header search icon opens the same palette (drop the "⌘K" label on mobile).
- **Later (Gemini):** natural-language search ("second-years with verified Docker in Pune")
  routed through the deterministic query layer — AI parses the phrase, the engine runs the
  filter, results are attributable. Documented as future; not faked.

---

## 38. Onboarding Strategy

- **4 steps, < 90 seconds:** (1) identity; (2) education — pick institution + degree + term,
  which **auto-loads a course catalogue** the student ticks; (3) 2–3 career interests;
  (4) self-rate 3 skills (explicitly "we'll ask you to prove these").
- Then: Record created, journey seeded at Education, first Next Best Action = "Take your
  first assessment", and a one-card explainer of how evidence works.
- **Progressive enrichment:** every subsequent visit, the NBA and the "profile strength"
  nudge one more item ("add last semester's grades", "link a repo to that project").
- For the **demo/judge**, onboarding is skippable via the persona picker (keep `/demo`).

---

## 39. Profile Completion Strategy

- **Not a percentage bar.** A **"Record strength"** widget that lists concrete, reasoned
  next items: _"Add your project repository → moves API Design from self-declared to
  project-evidenced → +3 readiness."_ Each item is a real link. (§31 of your brief.)
- Ordering = same deterministic logic as Next Best Action, but the full list rather than the
  top one.

---

## 40. Mobile Strategy

- **Bottom nav:** Home · Record · Career · Learn. 🔔 and account in a compact header.
- **Compact density:** stat "cards" become a 2-up (or inline) metric row, not full-width
  blocks; the journey stepper becomes a horizontal scroll strip with the current stage
  pinned; tables become stacked rows with the two most important fields.
- **Drop desktop-only chrome on mobile:** no "⌘K" label, no wide "KaushalSetu · Role —
  job" strap.
- **Thumb-reachable primary action** per screen (FAB-style "＋" where creation is the point).
- **The side-panel detail** becomes a full-screen sheet on mobile with a back affordance.
- Test at 360×640, 390×844, 768×1024.

---

## 41. Visual Design Direction

**Goal:** premium, institutional, trustworthy, intelligent, human — _not_ generic SaaS,
college-portal, dashboard-template or AI-startup.

- **Identity anchor: "the ledger".** KaushalSetu's whole thesis is a _trustworthy record_.
  Lean into that: fine hairlines, precise alignment, tabular numerals everywhere numbers
  matter, a subtle ruled/graph-paper texture on canvases (you already have `grid-bg` —
  make it a deliberate motif), stamp/seal-like verification marks.
- **Colour:** keep indigo as the structural primary, saffron/amber as the accent (the
  Ayush/India nod is apt), but **restrict colour to meaning** — evidence-confidence scale
  (a real 5-step ramp), readiness bands, heat cells, status. Everything else is ink on warm
  paper-white / warm near-black.
- **Typography:** one confident text face with real weight range; **tabular figures** for
  all metrics; a slightly editorial headline treatment (the landing already hints at this).
  Consider a distinct display face for the Passport only, so the credential feels different
  from the workspace.
- **Iconography:** replace the Unicode glyphs with a small, consistent, hand-built line-icon
  set (20–30 icons). This alone lifts perceived quality a tier.
- **Data-ink:** commit to a charting style — thin axes, muted gridlines, one accent series,
  direct labels, always a one-line caption explaining what the reader should conclude.
  Rebuild the competency graph so labels never overlap (radial layout with collision
  avoidance, or switch to a tidy left-to-right competency→skill tree).
- **Motion:** a single language — 150–200ms ease, content rises 4–8px + fades, the
  side-panel always slides from the same edge, numbers count up when they change (readiness,
  VCC). Respect `prefers-reduced-motion` (already done).
- **Verification as a visual moment:** when evidence is verified or an experience completes,
  a small, tasteful "sealed" animation on the affected competency. This is the product's
  emotional payoff — design it deliberately.
- **Empty & loading states:** branded, specific, encouraging ("No projects yet — your first
  mini-project is the fastest way to turn a self-rated skill into evidence" + a create
  button). Skeletons that match the real layout, not grey blobs.

---

## 42. Design System Direction

- **Tokens** (already CSS-first in `globals.css`): formalise into (1) _primitives_
  (colour ramps, space scale, radius, shadow, type scale, motion) and (2) _semantic
  aliases_ (`--evidence-0..4`, `--readiness-band-*`, `--heat-*`, `--surface`, `--panel`,
  `--hairline`). Document each with its single intended use.
- **Component inventory to standardise:** Metric (one variant, responsive), ListRow (one
  variant, opens a side-panel), SidePanel (the universal detail container), Pipeline/Stepper
  (used by journey, internship, project, application — one component), EvidenceStack, SkillCard,
  Chart primitives (Bar, Line/Trend, Scatter, Heat, CompetencyTree), Badge (documented
  semantics), CommandPalette (nav + actions), EmptyState, Skeleton.
- **Write it down:** a short `DESIGN_SYSTEM.md` with the tokens, the components, the "colour
  = meaning" rule, and the motion spec. (This is a doc, allowed later; not now.)
- **Accessibility:** semantic landmarks, focus-visible on every interactive element, 4.5:1
  text contrast on the new ramps, the command palette and side-panel fully keyboard
  operable, charts have a table fallback.

---

## 43. Features To Add

**MUST**

1. Editable **Career Goal** (target role + sectors + locations + timeline) with full recompute.
2. **Inline create/edit** for Projects, Certifications, Achievements, Experiences, Courses.
3. **Per-skill Skill Card** detail (evidence stack + target + last assessed + CTA + history).
4. **Assessment in the nav / as a verb everywhere**; add an **aptitude** battery and
   **soft-skill / situational-judgement** items.
5. **Application detail** (timeline, notes, linked match + gap, next step).
6. **Recruiter: create/edit/close a posting** (competency + level-bar editor).
7. **Onboarding** (4 steps) + **Record-strength** widget.
8. **Notifications / "What changed"** surface.
9. **Documents** surface (typed, versioned, signed-URL share).
10. Fix `<title>`, `/login` authed-state panel, funnel monotonicity, demo-data coherence,
    graph label overlap, mobile density (all D-list items).

**SHOULD** 11. **Experiences** object generalising internships (types + shared lifecycle + structured
end-evaluation + reflection). 12. **My Learning** tracker (roadmap step → not started → learning → practising → assessed →
evidenced). 13. **Mentors** (student ↔ faculty/industry mentor, sessions, notes). 14. **Peer endorsement** evidence type. 15. **Talent Search** attribute filters + saved searches + shortlist objects. 16. **Institution Interventions** (record → track → "did the gap move"). 17. **Faculty Opportunities** (FDP / consultancy / research / curriculum input). 18. **Industry Collaborate** (offer project / mentorship / sponsor assessment / curriculum input). 19. **Real trend charts** for Demand and Outcomes. 20. **Admin Integrations** surface (honest statuses) + Passport "emit NCrF event (demo)". 21. **Public shareable Passport link + PDF export.** 22. **Adjacent roles / adjacent skills** deterministic view.

**NICE** 23. Apprenticeship (NAPS) as an Experience type + contract stub. 24. Evidence decay ("stale — reassess"). 25. `?` keyboard-shortcut sheet. 26. Count-up number animation on readiness / VCC. 27. Cohort export (CSV) for institution. 28. Reflection prompts surfaced on the Passport.

---

## 44. Features To Merge

1. **Passport → into My Record** as a "shared/export view". One data node.
2. **Career: Goal + Readiness + Skill Gaps + Roadmap + Explore → one "Standing" lens**
   (with internal sections, not 5 peer tabs). Opportunities + Applications → "Pursuit" lens.
3. **Skills page graph == Profile graph → the graph lives on the Record Overview only;**
   the Skills lens is the table + a graph toggle.
4. **`/demand` → one page, role-framed** for Industry and Institution (keep one route).
5. **Certifications + Achievements + verified Experiences → presented together as the
   "Co-curricular record"** within Credentials (still distinct objects, one surface).
6. **Copilot → merges into a global "assist" affordance** (not a route).
7. **`/student/simulator`, `/student/gaps`, `/student/opportunities`, `/student/applications`**
   already redirect — formalise them as permanent redirects into the new lenses.

---

## 45. Features To Remove

1. **Career Copilot as a destination** (`/student/copilot` in nav) — becomes contextual assist.
2. **The duplicate competency graph** on `/student/skills` — one graph, on the Record.
3. **"Search ⌘K" button on mobile** — replace with a search icon.
4. **The doubled brand in `<title>`** — remove the page-level suffix.
5. **Leaked engineering jargon in `/judge` copy** ("FNV-1a-free…") — rewrite for a judge.
6. **The bottom-left "⟲ Switch role"** as the only role switch — promote to the header for
   demo ergonomics (or gate behind a "Demo" menu).
7. **Nothing else.** No feature _area_ should be deleted — the problem is thinness, not
   excess. Resist the urge to cut; densify instead.

---

## 46. Features To Keep (untouched or near-untouched)

- All **deterministic engines** (`evidence`, `profile`, `matching`, `readiness`,
  `skill-gap`, `demand`, `next-action`) — extend inputs, don't rewrite.
- **Matching Config** live sliders — pixel-for-pixel.
- **Explainable candidate ranking** + per-factor + "Explain vs" — the crown jewel.
- **Institutional heatmap** drill-to-students-and-action — add "record intervention", keep
  the rest.
- **Internship lifecycle pipeline** — generalise to Experiences, keep the mechanic.
- **Adaptive assessment** engine + instant explained feedback.
- **`/verify/[id]`** deterministic verification page.
- **Journey spine + Next Best Action** pattern.
- **Auth abstraction** (`AuthProvider` / `DemoAuthProvider` / persona picker).
- **Honest "Demo / synthetic data" labelling** everywhere.
- **The landing page** (light polish only).

---

## 47. Data Relationship Map

```
Institution ─┬─ Department ─┬─ Faculty ──┬─ verifies ▶ Evidence
             │              │            ├─ mentors ▶ Student
             │              │            └─ owns ▶ Collaboration (FDP/consultancy/research/curriculum)
             │              └─ Student ──┬─ has ▶ EducationRecord ─ Term ─ Course ──contributes(weight)──▶ Skill
             │                           ├─ holds ▶ Skill { effectiveLevel, targetLevel }
             │                           │           ▲ backed by ▶ Evidence { kind, state, verifierId, date }
             │                           │           kinds: self < peer < assessment < project < certificate < faculty < industry
             │                           ├─ owns ▶ Project ─ claims ▶ Competency ; produces ▶ Evidence ; may link ▶ Course / Experience
             │                           ├─ owns ▶ Experience { type } ─ lifecycle ─ endEvaluation ─ produces ▶ Evidence(verified) + Credential + JourneyEvent
             │                           ├─ owns ▶ Credential (certification / achievement / experience cert)  ─ may claim ▶ Competency
             │                           ├─ owns ▶ Document { type, version }
             │                           ├─ sets ▶ CareerGoal { roleId, sectors[], locations[], timeline }
             │                           ├─ has ▶ Readiness  = f(profile, goal, projects, experienceMonths)      [deterministic]
             │                           ├─ has ▶ SkillGap[] + Roadmap  = f(profile, goalRole)                    [deterministic]
             │                           ├─ has ▶ VCC = verifiedCompetencyCoverage(profile, goalRole)             [deterministic, North Star]
             │                           ├─ works ▶ LearningItem (roadmap step) : notStarted→learning→practising→assessed→evidenced
             │                           ├─ submits ▶ Application ─▶ Opportunity ; carries ▶ MatchResult snapshot + exposed Gap ; timeline
             │                           └─ NextBestAction = rank(goal, gaps, evidence, assessments, projects, applications, journeyStage) [deterministic]
             │
             ├─ Intervention { fromHeatmapCell, owner, cohort, expectedEffect, before/after gap }
             └─ Outcomes / first-destination  ◀ Placement ◀ Application/Experience

Employer ─┬─ posts ▶ Opportunity { competencyRequirements[{competencyId, minLevel}], extraSkills[], type }
          ├─ ranks ▶ Candidate  via  MatchResult = Σ wᵢ·factorᵢ   (SAME function the student sees)
          ├─ offers ▶ Collaboration (live project / mentorship / sponsored assessment / curriculum input)
          └─ verified by ▶ Admin

Competency ─ composed of ▶ Skill[] ;  Role/QP ─ requires ▶ Competency[{minLevel}] + extraSkills[]
Demand  = aggregate(Opportunity corpus over time) ▶ trend/emerging/declining  ▶ feeds Institution curriculum signal
AI (AiProvider)  ─ may PHRASE ▶ any explanation ;  ─ may PARSE ▶ NL search ;  ─ NEVER writes ▶ score / level / state / authz
```

**The one invariant to protect:** `MatchResult` and `Readiness` and `VCC` are computed by
one function each, consumed identically by every persona. AI never enters those paths.

---

## 48. AI Strategy

- **Keep the `AiProvider` abstraction and the mock-default rule.** App runs with no key.
- **AI is allowed to:** phrase explanations (readiness "why", match "why", gap advice,
  Next Best Action rationale); summarise a Passport into a paragraph; parse a
  natural-language talent-search query into deterministic filters; draft (never send)
  outreach; generate assessment-item _distractors_ offline for the item bank (reviewed).
- **AI is barred from:** any score, level, evidence state, eligibility, authorization,
  ranking order, verification decision, or the choice of Next Best Action.
- **Surface it as assist, not navigation** (remove the Copilot route). The assist button
  carries the current screen's engine output as context so answers are grounded.
- **Label everything** AI-authored ("explanation generated by AI from the numbers above").
- **Gemini** stays a config swap (`AI_PROVIDER=gemini` + key). Document NL-search as the
  first real Gemini use case.

---

## 49. Matching Strategy

- **Do not change the engine.** `Σ wᵢ·factorᵢ`, 7 factors, configurable weights, per-factor
  breakdown, both sides reconciled.
- **Additions (all deterministic):**
  - Persist a **MatchResult snapshot** on each Application (so the timeline can show "match
    at apply: 70 → now: 78 after you verified Docker").
  - **"Explain vs"** for the student too ("why role A fits you better than role B").
  - **Adjacent skills**: for a missing mandatory competency, show the nearest skill the
    student _does_ have and the shortest path to the requirement.
  - Recruiter **"what-if"**: "if this candidate completes assessment X, their match becomes
    Y" — the same arithmetic, run forward.
- **Keep Matching Config exactly as-is.** It is the proof.

---

## 50. Readiness Strategy

- **Keep the formula and the "AI explains, never sets" rule.**
- **Show it moving:** a small readiness history sparkline on Home and the Standing lens;
  count-up animation when it changes; on every verified evidence event, a toast "readiness
  +N".
- **Bands, named consistently** everywhere: Emerging / Developing / Approaching / Ready /
  Strong (pick 5, document them, use them in student, faculty, institution views).
- **"What would move it most"** = already the Next Best Action; also list the top 3 on the
  Standing lens with their point deltas.
- **VCC as a companion metric** to readiness on every persona's dashboard.

---

## 51. Next Best Action Strategy

- **One primary action** on Home (keep) + **"more suggested actions" (3–5)** expandable
  (keep) + the **full ranked list** on the Record-strength widget.
- **Richer candidate set:** set/refine goal · take a specific assessment (aptitude, then
  weakest role skill) · attach a repo/report to a project (self→project evidence) · request
  faculty verification on a pending item · start the top roadmap Learn item · advance a
  stalled application · complete an experience reflection · book a mentor session · add last
  term's grades.
- **"This week" framing:** the action is phrased as a weekly commitment with an estimate
  ("~40 min").
- **Deterministic scoring** unchanged in spirit: leverage (how much it moves VCC/readiness)
  × feasibility (can it be done now) × journey-stage fit.
- **Faculty / institution get their own** Next Best Action ("3 verifications unblock 12
  students' readiness"; "MLOps gap in CSE is widening — record an intervention").

---

## 52. Judge Demo Strategy

- **Build the demo into the product** as a **"Guided tour"** overlay (not a separate
  `/judge` slideshow). A dismissible top bar: "Guided tour · Step 3 of 10 · Next →". Each
  step deep-links to the live screen and highlights the one element that matters. The judge
  experiences the real product, on rails.
- **Keep `/judge`** as the _technical_ appendix (architecture, engine notes, framework
  alignment) — but rewrite it for a human (kill "FNV-1a-free…").
- **The 10-step spine** (≈5 min), each a real screen:
  1. Landing — the one-liner ("evidence, not claims").
  2. Student Home — journey + the single Next Best Action.
  3. Skill Card — level + the evidence stack; "self-declared Docker is discounted".
  4. Career → Standing — deterministic readiness + ranked gaps + roadmap.
  5. Opportunity match — per-factor breakdown + "how to become ready".
  6. **Switch to recruiter** — the _same_ candidate, the _same_ number, "Explain vs".
  7. **Matching Config** — move a weight, watch it recompute. "No black box."
  8. Complete an internship evaluation — a verified skill delta writes to the Record;
     **readiness counts up**; the competency shows a "sealed" mark.
  9. **Switch to institution** — heatmap → the students behind a red cell → **record an
     intervention**.
  10. Passport → QR → `/verify` — "everything proven, publicly checkable, honestly labelled".
- **The moment to engineer for:** step 6→7→8 in sequence — _same number, both sides,
  configurable, and it moves when real work happens._ That is the "this is different" beat.

---

## 53. Feature Priority Matrix

Scored 1–5 on SIH-fit / user-value / innovation / demo-impact / feasibility (↑ better) and
risk (↓ better). Grouped, not exhaustively tabulated.

| Tier                                             | Items                                                                                                                                                                                                                                                                 | Rationale                                                                                                                              |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **P0 — do first (high on everything, low risk)** | Editable Career Goal; inline create/edit (Projects/Certs/Achievements/Courses); Skill Card detail; Assessment in nav + aptitude battery; Application detail; fix D14–D19 (title, login panel, funnel, jargon, graph labels, demo-data coherence); mobile density pass | These make the product _usable_ and remove every "it's just a demo" tell. Mostly UI over existing engines.                             |
| **P1 — core completion**                         | Experiences object (generalise internship); My Learning tracker; Notifications/"What changed"; Onboarding + Record-strength; Recruiter create/edit posting; Institution Interventions; real trend charts                                                              | Closes the loop the docs promise; adds the retention hook; completes the two thinnest roles (recruiter authoring, institution action). |
| **P2 — differentiation & SIH breadth**           | Mentors; Peer endorsement; Faculty Opportunities; Industry Collaborate; Talent Search filters + shortlists; Documents; Admin Integrations + NCrF demo event; public Passport link + PDF; adjacent roles/skills                                                        | Fills the remaining named SIH requirements and deepens the moat.                                                                       |
| **P3 — polish & delight**                        | Guided-tour overlay; visual identity pass (icons, charts, motion, "sealed" animation, empty states); `?` sheet; count-up numbers; evidence decay; reflection on Passport; cohort export                                                                               | Turns "solid" into "memorable". Do last, but do it — the demo is won here.                                                             |
| **Explicitly not now**                           | Real DigiLocker/APAAR/NCS wiring; live Gemini; email/push notifications; multi-institution federation UI; W3C VC signing                                                                                                                                              | Out of prototype scope; keep as honestly-labelled future in docs.                                                                      |

---

## 54. Implementation Roadmap (order, not dates)

1. **Foundation fixes (P0 subset):** titles, `/login` authed panel, funnel data,
   demo-data coherence, jargon, graph labels. _Ship immediately — pure cleanup._
2. **Make it editable:** Career Goal editor + recompute; inline create/edit for
   Projects/Certs/Achievements/Courses. _Unlocks the "it's a tool" perception._
3. **Skill Card + Assessment surfacing + aptitude/soft-skill items.** _Closes the biggest
   SIH gap; reuses the assessment engine._
4. **Application detail + Recruiter posting authoring.** _Completes the two-sided story._
5. **IA refactor:** My Record hub + lenses; Passport as a view; Career → Standing/Pursuit;
   Copilot → assist; command-palette actions for all roles. _Structural; do it once,
   deliberately, after 2–4 so the new surfaces slot in._
6. **Experiences generalisation + My Learning tracker + Notifications + Onboarding.**
   _The loop and the hook._
7. **Institution Interventions + real charts + Outcomes.** _Turns the flagship closed-loop._
8. **P2 breadth:** Mentors, peer endorsement, Faculty Opportunities, Industry Collaborate,
   Talent Search filters, Documents, Admin Integrations, public Passport.
9. **Visual identity + design-system pass + Guided tour.** _Win the demo._
10. **Content depth throughout:** expand the seed dataset (40+ courses/programme, 8–15
    projects for hero students, multi-year evidence timelines) — do this _incrementally
    alongside every step above_, not as one block.
11. **Docs:** update `UX_REDESIGN_PROPOSAL` → supersede with this; write `DESIGN_SYSTEM.md`;
    refresh `DEMO_SCRIPT` to the guided-tour spine; note new engines' inputs in
    `ARCHITECTURE`.
12. **Full test pass** (lint / typecheck / unit / e2e / build) + browser QA all roles +
    Vercel deploy + verify. _After each major step, not just at the end._

Keep `main` deployable throughout; feature-branch per step; logical commits.

---

## 55. Risks

| Risk                                                                                                      | Likelihood      | Mitigation                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scope creep** — this list is large; trying to do all of it dilutes everything                           | High            | P0→P1 is the actual mandate; P2/P3 are "if time". Ship P0 fully before starting P1.                                                                                        |
| **IA refactor breaks working flows**                                                                      | Medium          | Do the refactor (step 5) _after_ the editable surfaces exist, behind the same routes with redirects; e2e must stay green at every commit.                                  |
| **Editable data + deterministic engines drift**                                                           | Medium          | All mutations go through the same `lib/data` layer; engines stay pure; add unit tests that a create/edit produces the expected score delta.                                |
| **Seed-data expansion introduces incoherence** (the current `/demand` problem, at 10×)                    | High            | One generator, one seed, invariant tests (already the pattern); add a "dataset coherence" test suite that fails on non-monotonic funnels, orphan skills, impossible dates. |
| **Visual redesign chases trends and loses the "ledger" identity**                                         | Medium          | The identity anchor (§41) is written down first; every visual change is checked against "does this make the record feel more trustworthy".                                 |
| **"Premium" polish consumes the schedule and P1 slips**                                                   | Medium          | Polish is P3 and time-boxed; the guided tour + charts + icons are the highest-leverage 20%.                                                                                |
| **Judge sees "more screens" and misses the innovation**                                                   | Medium          | The guided tour forces the 6→7→8 sequence; the landing one-liner and the Passport carry the positioning.                                                                   |
| **AI creeps into a decision path** under deadline pressure                                                | Low/High-impact | The invariant in §47 is a review checklist item; keep the mock-default + the "AI barred from" list in `CLAUDE.md`.                                                         |
| **Over-modelling** (apprenticeship contracts, document versioning, mentor scheduling become rabbit holes) | Medium          | Each is a _type_ or a _stub_ in the prototype, labelled; not a full subsystem.                                                                                             |

---

## 56. Final Recommendation

**Do not redesign KaushalSetu. Finish it.**

The strategy, the IA skeleton, and the engines are right and, in the case of the explainable
matching + Matching Config + heatmap-to-action, genuinely competition-winning. The product's
failure mode today is that it is a **beautifully-argued demo that a real student could not
actually use** — read-only, shallow, and missing five named SIH capabilities — wrapped in a
**visually anonymous** shell.

The transformation, in one line: **make every surface interactive, fill the four-year
lifecycle, add the five missing capabilities (aptitude/soft-skill assessment, learning
tracking, mentorship, documents, a visible integration story), consolidate Profile/Passport
and the seven Career tabs, demote the chatbot, and give it a distinctive "trustworthy
ledger" visual identity — then build the judge demo into the product as a guided tour whose
climax is the same competency number, shown to both sides of the market, moving when real
work is verified.**

Priority order is unambiguous: **P0 (make it a tool, fix the tells) → P1 (close the loop, add
the hook) → P2 (SIH breadth) → P3 (win the demo)**. Ship P0 completely before starting P1.

---

# THE NEW KAUSHALSEtU

**An evidence-based competency record and intelligence layer that a student builds from week
one of college to their first job — where every course, project, assessment and experience
becomes verifiable competency, and faculty, industry and the institution act on the same
numbers the student sees.**

## NEW NAVIGATION

**Student (primary):** Home · My Record · Career · Learn
**Student (utility):** Passport · Mentors · 🔔 Notifications · Settings · Switch role
**Header (all roles):** breadcrumb · ＋ New · ⌘K (nav + actions) · ? assist · account
**Mobile (student):** Home · Record · Career · Learn (🔔 + account in header)

**Industry:** Home · Roles · Talent Search · Collaborate · Market
**Faculty:** Home · Verify · Mentor · Collaborate · Curriculum signal
**Institution:** Command Center · Heatmap · Cohorts · Outcomes · Demand · Interventions
**Admin:** Overview · Taxonomy · Employers · Matching · Integrations · Audit

## NEW HOME (student)

Above the fold: greeting · **target role (editable)** · **Readiness** band + sparkline ·
**Verified Competency Coverage** · the **7-stage journey** with "you are here" and a
"Foundation complete" sub-milestone · **one Next Best Action** ("this week, ~40 min") with
its _why_ and a CTA · **"Since you were last here"** (top 2 notifications) · **2–3
opportunities**. No stat-card wall. No duplicate graph.

## NEW STUDENT JOURNEY

Onboard (4 steps, <90s) → **Year 1** courses→first skills→aptitude + foundational
assessments→first mini-project→first peer endorsement → **Year 2** projects (real
lifecycle)→first certification→firm career goal→top gap entered into _Learn_ → **Year 3**
explainable internship match→internship lifecycle→**mentor evaluation → verified
competency** (readiness counts up, competency "sealed")→request a mentor → **Year 4**
final-year project (industry-evaluated)→applications with tracked timelines→**Passport shared
publicly**→placement outcome recorded. Every artefact declares the skills it develops; every
skill shows the evidence behind it; the single source of truth is **My Record**.

## NEW INDUSTRY EXPERIENCE

Home (fixed funnel + "awaiting your decision" queue) → **create a posting** defined by
competencies + level bars → **Role → Candidates**: the explainable ranking, per-factor
breakdown, "Explain vs A→B", and real actions (**Request assessment**, **Schedule
interview**, **Message**, **Shortlist/Offer**) → **Talent Search** by competency +
attributes, saved searches, shortlists as objects → **Collaborate**: offer a live project /
mentorship / sponsor a cohort assessment / propose curriculum input → **Market**: real
demand trend series. Same match number the student sees; every point attributable; weights
visible in Admin → Matching.

## NEW FACULTY EXPERIENCE

Home (engagement + queues + mentees) → **Verify**: evidence queue, Approve / Request changes
/ note, "which numbers this moves", batch actions → **Mentor**: mentee list, log sessions
with actions linked to each student's goal/gap → **Collaborate**: pipeline board +
**Opportunities** (FDPs, consultancy RFPs, research calls, curriculum-input requests) →
**Curriculum signal**: "what my courses produce vs what industry is asking for", per skill.

## NEW INSTITUTION EXPERIENCE

Command Center (readiness, department breakdown, systemic gaps, "what changed") →
**Heatmap**: department × skill → the named students behind a cell → recommended action →
**Record an intervention** (owner, cohort, expected effect) → **Interventions**: track it,
and later "gap then vs now" → **Outcomes**: first-destination in minutes, correlated with
competency development, real charts → **Demand**: role-framed for curriculum planning.

## WHAT WE REMOVE

Career Copilot as a nav destination · the duplicate competency graph on `/student/skills` ·
the "⌘K" label on mobile · the doubled brand in `<title>` · engineering jargon in `/judge`
copy · "Switch role" as the only, bottom-left role control. (No feature _area_ is deleted.)

## WHAT WE ADD

Editable Career Goal · inline create/edit (Projects, Certs, Achievements, Courses,
Experiences) · per-skill Skill Card · Assessment in nav + aptitude + soft-skill items ·
Application detail (timeline/notes/linked match+gap) · recruiter posting authoring ·
onboarding + Record-strength widget · Notifications/"What changed" · Documents · Experiences
object (typed lifecycle + structured end-evaluation + reflection) · My Learning tracker ·
Mentors · peer endorsement evidence type · Talent Search filters + saved searches +
shortlists · Institution Interventions · Faculty Opportunities · Industry Collaborate · real
trend charts · Admin Integrations + labelled NCrF demo event · public Passport link + PDF ·
adjacent roles/skills · guided-tour overlay · a distinct visual identity.

## WHAT WE MERGE

Passport → a view of My Record · Career's 7 tabs → 2 lenses (Standing, Pursuit) · Skills
graph == Profile graph → one graph on the Record · `/demand` → one role-framed page ·
Certifications + Achievements + verified Experiences → one "Co-curricular record" surface ·
Copilot → a global assist affordance.

## WHAT WE KEEP

Every deterministic engine · Matching Config sliders · explainable candidate ranking +
"Explain vs" · heatmap drill-to-students-and-action · internship lifecycle mechanic ·
adaptive assessment engine · `/verify/[id]` · journey spine + Next Best Action pattern ·
`AuthProvider` abstraction + persona picker · "Demo / synthetic data" labelling · the
landing page.

## TOP 10 UX CHANGES (ranked)

1. **Make the Career Goal editable** and recompute everything from it.
2. **Inline create/edit** for every "your X" list (projects, certs, achievements, courses,
   experiences).
3. **Per-skill Skill Card** with the evidence stack + target + one CTA.
4. **Consolidate**: Passport→Record view; Career 7 tabs→2 lenses; one competency graph.
5. **Surface Assessment** (nav + a verb on every skill) and add aptitude + soft-skill.
6. **Application detail** with a real timeline and links to the match + gap.
7. **Notifications / "What changed"** — the weekly hook.
8. **Onboarding** (4 steps) + a reasoned **Record-strength** widget (not a % bar).
9. **Side-panel detail + command-palette actions** everywhere (Linear/Notion pattern).
10. **Mobile density pass** — compact metrics, scroll-strip stepper, drop desktop chrome.

## TOP 10 SIH DIFFERENTIATORS (ranked)

1. **One competency-and-evidence number, computed once, shown identically to student +
   recruiter + faculty + institution** — and it moves when verified work happens.
2. **Evidence Confidence** — self-declared skills visibly discounted; human verification
   dominates.
3. **Explainable matching with configurable, visible weights** ("Explain vs", Matching
   Config sliders) — provably not a black box.
4. **Internship/Experience → structured evaluation → verified competency → Passport →
   institutional readiness** — a closed loop, not a certificate PDF.
5. **Institutional heatmap → named students → recommended action → recorded intervention →
   "did the gap move"** — closed-loop workforce planning.
6. **Verified Competency Coverage** as a North Star that aligns all four personas.
7. **Framework-aligned** (NSQF 1–8, NOS/QP-shaped roles, NCrF/APAAR-ready) with an honest,
   visible integration surface — not invented, not faked.
8. **The Ayush angle made real** — non-clinical BAMS/B.Pharm competency profiles, Ayush
   roles, sector-filtered opportunities, a dedicated persona.
9. **Deterministic core, AI only explains** — auditable, reproducible, defensible in Q&A.
10. **Useful from week one** — the four-year arc with a "Foundation complete" milestone, not
    a portal you open only in final year.

## TOP 10 VISUAL CHANGES (ranked)

1. **A "trustworthy ledger" identity** — hairlines, tabular numerals, graph-paper motif,
   verification "seals".
2. **Colour = meaning only** — a real 5-step evidence ramp, readiness bands, heat cells;
   everything else ink-on-paper.
3. **Rebuild the data-viz** — a committed chart style; competency graph with no label
   overlap (radial collision-avoidance or a tidy competency→skill tree); real demand/outcome
   trend series.
4. **Replace Unicode glyph icons** with a small hand-built line-icon set.
5. **One motion language** — 150–200ms, content rise+fade, side-panel from one edge,
   numbers count up on change.
6. **The "sealed" verification moment** — a deliberate micro-animation when evidence is
   verified / an experience completes.
7. **Branded empty & loading states** — specific, encouraging, layout-matched skeletons.
8. **Distinct Passport treatment** — a display face and a credential aesthetic that differs
   from the workspace, in familiar LinkedIn block order with evidence badges.
9. **Mobile as its own layout** — not a shrunk desktop.
10. **Typography with personality** — one confident face, editorial headlines, tabular
    figures for every metric.

## IMPLEMENTATION ORDER

**P0** foundation fixes → editable surfaces → Skill Card + Assessment surfacing +
aptitude/soft-skill → Application detail + recruiter posting authoring.
**P1** IA refactor (Record hub, lenses, Passport-as-view, Copilot→assist, palette actions)
→ Experiences generalisation + My Learning + Notifications + Onboarding → Institution
Interventions + real charts.
**P2** Mentors · peer endorsement · Faculty Opportunities · Industry Collaborate · Talent
Search filters · Documents · Admin Integrations · public Passport.
**P3** visual identity + design system + guided tour.
**Throughout:** expand the seed dataset incrementally; keep `main` deployable; test + deploy

- verify after every major step.

---

## §46 (final question)

**"If a student used this from day one of college until graduation, what brings them back?"**

Three things, and the product must nail all three:

1. **The single Next Best Action** — every visit answers "what is the highest-leverage 40
   minutes I can spend on my future right now", and it is specific, not generic advice.
2. **Visible compounding** — Verified Competency Coverage and Readiness only go up, and the
   student _sees_ them move the day a project gets verified or an assessment is passed. The
   record they are building is theirs and it is getting more valuable.
3. **"Since you were last here"** — a genuine reason to return: your evidence was verified,
   a new role matches you, a prerequisite you were missing is now met, your mentor left a
   note.

The retention engine is: _specific next step → visible progress → a reason to come back._
KaushalSetu has the first, half of the second, and none of the third today.

**"In a five-minute judge demo, what exact moment makes them think 'this is different'?"**

The **6→7→8 sequence**:

- Step 6: switch from the student to the recruiter and the candidate's match score is _the
  same number the student just saw_ — with the same per-factor breakdown and an "Explain vs"
  against another candidate.
- Step 7: open Matching Config, drag the "evidence confidence" weight, and the score
  recomputes live in front of them — _the weights are not hidden, they are a control_.
- Step 8: complete an internship evaluation; a verified skill delta writes into the
  student's Record; **readiness counts up on screen** and the competency gets a "sealed"
  mark.

_Same number, both sides of the market, configurable in the open, and it moves when real
verified work happens._ That is the sentence a judge repeats to the next table. Everything in
this blueprint is in service of making that ten-second sequence undeniable — and of making
the product a student would still be using in year four to get there.

---

## Sources

- SIH 2026 problem-statement catalogues (community mirrors): <https://github.com/NoBugNinja/Smart-India-Hackathon-SIH-2026-Problem-Statements>, <https://sih2026.vuce.in/en/themes/miscellaneous>
- Handshake students product: <https://joinhandshake.com/students/>
- Handshake student-experience / 2026 profile redesign: <https://joinhandshake.co.uk/blog/careers-services/reimagining-student-experience-on-handshake-the-place-to-find-your-captive-audience>, <https://updates.joinhandshake.com/>
- Handshake AI features for students: <https://support.joinhandshake.com/hc/en-us/articles/38856960612631-About-AI-powered-features-in-Handshake-for-students>
- 12twenty Career Cloud: <https://12twenty.com/career-cloud>, <https://12twenty.com/students/>
- 12twenty Experiential Learning: <https://12twenty.zendesk.com/hc/en-us/sections/4413533196563-Experiential-Learning>, <https://12twenty.zendesk.com/hc/en-us/articles/4413533336211-Experiential-Learning-Overview>
- Degreed skill ratings / Skill Review / endorsement: <https://degreed.zendesk.com/hc/en-us/articles/4408913268498-Skill-Rating-Types>, <https://degreed.zendesk.com/hc/en-us/articles/4408920352530-Skill-Review-Overview-for-Learners>, <https://degreed.com/experience/blog/degreed-peer-ratings-your-360-degree-view-of-skills/>
- Linear: <https://linear.app/>
- Notion: <https://www.notion.com/product>
- Coursera: <https://www.coursera.org/>
- Symplicity CSM / Outcome / Pathways: <https://www.symplicity.com/blog/how-leading-universities-are-transforming-career-services-with-symplicity-csm>, <https://www.symplicity.com/outcome>
- Eightfold / Gloat skills intelligence: <https://eightfold.ai/solutions/skills-intelligence/>, <https://fuel50.com/blog/skills-intelligence-platforms>, <https://hrtechsaas.com/blog/best-talent-intelligence-platforms/>
- NSQF / NCrF / APAAR (per `RESEARCH.md`): <https://www.nsda.gov.in/nsqf.html>, <https://www.education.gov.in/en/nep/ncrf-apaar>

---

## Implementation log

Executed against this blueprint (P0 first, keeping `main` green after every commit):

**Shipped**

- **Editable student record without a DB** — `lib/session-store.ts` (per-session
  signed cookie) + `lib/data/viewer.ts` + an optional `StudentCtx` on every
  student view-model. Career goal, projects, certifications, achievements,
  courses and assessment results are genuinely editable and recompute through
  every deterministic engine (readiness, skill gap, matching, Next Best Action,
  competency graph). Honestly scoped and labelled (session-only, resets on
  redeploy, not shared across roles). — _blueprint §43 MUST 1, 2; §21, §29_
- **Editable Career Goal** with full recompute (role + secondary interests). — _§43 MUST 1_
- **Inline add / edit / remove** for Projects, Certifications, Achievements
  (validated server actions, save banners, session-item badges). — _§43 MUST 2_
- **Per-skill Skill Card** `/student/skills/[id]` — effective vs self vs target
  level, last assessed, the ordered evidence stack, where the skill came from,
  the competencies it feeds, one deterministic next step. Skills are now
  clickable from the ledger and the education page. — _§25, §43 MUST 3_
- **Assessment surfaced** as a first-class nav item; the adaptive result screen
  **writes a real assessment evidence item** that recomputes confidence. — _§43 MUST 4 (partial: aptitude/soft-skill items still to add)_
- **"What changed" attention inbox** — deterministic, from the state of the
  record; `/student/notifications` + "Since you were last here" on Home. — _§36, §59, §43 MUST 8_
- **Foundation fixes** — de-duplicated `<title>`; `/login` shows a "you're signed
  in" panel instead of silently redirecting; removed leaked "FNV-1a" jargon from
  `/judge`; institutional SIH26044 / Ministry of Ayush context strip on every
  authenticated screen (honestly labelled a prototype); 2-up mobile stat grids;
  dropped the stale "targeting <role>" persona subtitle. — _§D-list, §5–7, §13–15_

**Not yet done** (tracked for the next passes): recruiter posting authoring;
application detail timeline; institution "record an intervention"; onboarding
wizard; Experiences generalisation; My Learning tracker; Mentors; peer
endorsement; full IA refactor (Record hub / Passport-as-view / Copilot→assist);
the full visual-identity pass and guided-tour overlay.

### Implementation log — pass 2 (design language + action center)

- **Design-language transformation** — `globals.css` v2: centralised `--ks-*`
  tokens; deep-teal institutional palette (off generic indigo SaaS); warm-paper
  ground; square-er corners, hairline borders, near-flat elevation; restrained
  GOV.UK-style type scale and 3px focus ring; solid surfaces (no glass). Card /
  Button / app-shell / PageHeader (`eyebrow`) / landing retuned. — _blueprint
  §41, §42, §5–7, §33_
- **Institution Action Center** — `/institution/interventions`: record an
  intervention from a critical heatmap cell (prefilled with dept / skill /
  recommended action / cohort), track planned → active → completed, synthetic
  term-over-term outcome on completion. Nav item + Command Center pointer. —
  _§32, §43 SHOULD 16, §53_
- **Command-palette quick actions for all five roles** (was student-only). — _§22, §37_
- Fix: base64-encode session cookies (`ks_patch`, `ks_interventions`) — a literal
  `%` in stored text made Next's cookie decode throw `URIError`.

Still not done: recruiter posting authoring; application-detail timeline;
onboarding wizard; Experiences generalisation; My Learning tracker; Mentors;
peer endorsement; aptitude/soft-skill item banks; full IA refactor
(Record hub / Passport-as-view / Copilot→assist); guided-tour overlay;
competency-graph label de-overlap.
