# UX_REDESIGN_PROPOSAL — KaushalSetu

**Status: IMPLEMENTED.** This document began as a proposal; the structural
redesign it describes has now shipped. What follows is the as-built record.

## Implementation status (SUPER MASTER transformation)

| Proposal                                           | Shipped                                                                                                                                                                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Journey spine as the mental model                  | `getJourney()` → 7 ordered stages; `<JourneyStepper>` (full + strip) on Home and every My-Journey page, always showing "you are here"                                                                                   |
| Home = orientation, not a report                   | `/student` rebuilt: greeting · target · readiness · journey spine · **one** Next Best Action (+ "why") · recent activity · 2–3 opportunities. No stat-card wall.                                                        |
| Deterministic "Next Best Action"                   | `lib/engines/next-action.ts` — scored candidates over goal, gaps, evidence, assessments, projects, applications, journey stage → one action + rationale + CTA                                                           |
| Four nav destinations                              | `app-shell.tsx` grouped nav: Home / My Journey (Education, Skills & Evidence, Projects, Internship, Certifications, Achievements) / Career / My Profile                                                                 |
| Profile as the single object, not 6 sibling routes | `/student/profile` = Competency Profile source-of-truth with an "inputs feeding this" panel; graph/evidence/passport are lenses on it                                                                                   |
| Education entity                                   | `EducationRecord` + `Course` types; generator authors courses→skills; `/student/education` shows courses → the skills they produced                                                                                     |
| Richer Projects                                    | `Project` gains type, status, contribution, team, tech, competency claims, links, evaluations; `/student/projects` + `[id]` show the skill→evidence→competency chain                                                    |
| Achievements entity                                | `Achievement` type (hackathon/award/competition/publication/research/leadership/extracurricular); `/student/achievements` timeline; feeds activity + passport                                                           |
| Career as one destination                          | `/student/career?tab=` — Goal · Readiness · Skill Gaps · Roadmap · Explore Roles (simulator folded in) · Opportunities · Applications. Legacy `/student/{gaps,simulator,opportunities,applications}` now redirect here. |
| Internship lifecycle visible                       | `/student/internship` shows the full pipeline: Discovered → Applied → Shortlisted → Selected → Onboarding → Active → Milestones → Mentor feedback → Final evaluation → Completed → Verified skills                      |
| Copilot demoted from peer nav                      | Kept as "Career Copilot" under Career, plus `⌘K` command palette for navigation/actions                                                                                                                                 |
| Per-role mental models                             | Industry _find & develop talent_ · Faculty _verify & connect_ (Approve / Request changes) · Institution _understand & improve readiness_ · Admin _govern the ecosystem_                                                 |
| Mobile model                                       | Bottom nav (Home / Journey / Career / Profile) below `md`; responsive verified desktop→mobile                                                                                                                           |
| Auth                                               | `AuthProvider` abstraction; `DemoAuthProvider` (server-side credentials + one-click personas); premium `/login`; `SupabaseAuthProvider` stub                                                                            |
| States                                             | `loading.tsx` skeletons · `error.tsx` boundary · `not-found.tsx`                                                                                                                                                        |

Preserved unchanged: every deterministic engine (competency graph, evidence
confidence, matching, readiness, skill-gap, demand, career simulator), the
internship workflow, industry analytics, institution heatmap, faculty and admin
tools, judge mode, the AI abstraction, and the single seeded synthetic dataset.

---

## Original proposal (retained for rationale)

**Thesis in one line:** the product currently presents as _a set of ~10 skill
tools in a sidebar_; it should present as _one continuous journey that compounds
into a single Competency Profile_. The fix is structural (information
architecture + a journey spine + a "next best action" + three missing entities),
not cosmetic.

---

## 1. Current UX problems

| #   | Problem                                                                                                                                                                                                                                                                        | Root cause                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| 1   | **"Toolbox," not a journey.** The student sidebar is 10 flat items, 6 of them named "Skill …" or "Career …". Nothing tells the student where they are or where they're going.                                                                                                  | No journey model in the IA. Every feature is a co-equal top-level destination.                        |
| 2   | **Modules feel disconnected.** Skill Graph, Evidence, Assessment, Gaps, Simulator, Passport are separate pages that all describe the _same_ underlying profile from slightly different angles. The student has to mentally stitch them together.                               | The profile is the real object, but it's exposed as 6 sibling routes instead of 1 object with lenses. |
| 3   | **Dashboard overload on Home.** `/student` opens with a 4-stat-card row + competency graph + readiness meter + internship card + recommended cards + applications table. It answers "here is everything" instead of "here is your one next move."                              | Home is treated as a report, not as orientation.                                                      |
| 4   | **No sense of progress or history.** There is no timeline, no "you have completed X, you are doing Y, Z is next." A student cannot see their story.                                                                                                                            | No `TimelineEvent` concept; journey stages aren't modelled.                                           |
| 5   | **Education is invisible.** The `Student` type has flat `programme`, `semester`, `cgpa` — no courses, grades, credits, academic projects. Yet "Education creates skills" is stage 01 of the intended ecosystem.                                                                | Missing `Course` / `Enrolment` / `AcademicTerm` entities.                                             |
| 6   | **Projects are thin.** `Project` = `{ title, summary, skillIds, date, facultyVerifiedBy }`. No project type (mini / major / industry / personal), no lifecycle, no team/role/repo/demo, no explicit "this project → this competency" chain the student can see.                | Under-modelled entity.                                                                                |
| 7   | **Achievements don't exist.** Hackathons, awards, publications, leadership have no home.                                                                                                                                                                                       | Missing entity.                                                                                       |
| 8   | **Career goal is a single hidden field.** `targetRoleId` + `careerInterests[]` exist but there's no "Career Goal" surface where the student sets target role, industries, locations, and _sees everything recompute_. The Simulator is a separate page doing part of this job. | Career goal is data, not a screen; Simulator duplicates it.                                           |
| 9   | **Applications is an orphan page.** A standalone `/student/applications` with a status bar. Applications only make sense _inside_ the career pursuit; as a top-level item they add nav weight without context.                                                                 | Wrong altitude.                                                                                       |
| 10  | **Placement has no student-facing stage.** `PlacementOutcome` exists only for institution analytics. The student's journey visibly stops at "internship."                                                                                                                      | Journey model incomplete.                                                                             |
| 11  | **"Career Copilot" competes with the UI.** A chat page as a peer of every feature signals "if the UI is confusing, ask the bot." The copilot should be an _assist affordance_ available in context, not a destination.                                                         | Chat-as-navigation.                                                                                   |
| 12  | **Same nav for every role.** Faculty (3 items) and Admin (5) are fine; Student (10) and the recruiter/institution split are not tuned to each role's single job.                                                                                                               | One nav pattern applied uniformly.                                                                    |
| 13  | **Cognitive load per screen is low; nav load is high.** Individual pages are clean, but the _count_ of destinations forces the student to hold a map in their head.                                                                                                            | Optimised the wrong axis: more screens instead of more powerful screens.                              |
| 14  | **No mobile model.** A 10-item vertical sidebar collapses to nothing on mobile; there is no bottom nav or contextual model.                                                                                                                                                    | Desktop-only IA.                                                                                      |

## 2. Current route audit

Legend for **Verdict**: **KEEP** (as-is destination) · **MERGE** (becomes a
section/tab of another screen) · **DEMOTE** (contextual, reachable from where
it's relevant, not top-level) · **REMOVE** (delete) · **NEW** (doesn't exist yet).

### Public / shared

| Route                      | Purpose                            | User                            | Primary action        | Data shown                                                 | Problems                                       | Verdict           |
| -------------------------- | ---------------------------------- | ------------------------------- | --------------------- | ---------------------------------------------------------- | ---------------------------------------------- | ----------------- |
| `/`                        | Landing / positioning              | prospect, judge                 | "Explore judge demo"  | stats, problem table, lifecycle                            | none major                                     | **KEEP**          |
| `/demo`                    | Persona picker                     | judge                           | pick persona → cookie | 6 persona cards                                            | fine; add a "start guided tour" option         | **KEEP**          |
| `/judge`                   | Technical showcase                 | judge                           | read                  | engines, architecture, metrics                             | dense but appropriate for its audience         | **KEEP**          |
| `/verify` , `/verify/[id]` | Public credential check            | anyone                          | verify id             | credential + competencies                                  | none                                           | **KEEP**          |
| `/health`, `/api/*`        | Diagnostics / APIs                 | ops                             | —                     | —                                                          | —                                              | **KEEP**          |
| `/demand`                  | Industry skill-demand intelligence | recruiter, institution, faculty | read trends           | trending/emerging/declining skills, role & location demand | shared route is fine; label it per role in nav | **KEEP** (shared) |

### Student (current: 11 routes incl. detail)

| Route                         | Purpose                       | Primary action        | Secondary                 | Data shown                                                                                                                                        | Problems                                                                                                          | Verdict                                                                                                                                                 |
| ----------------------------- | ----------------------------- | --------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/student`                    | Overview dashboard            | scan status           | jump anywhere             | readiness, match-to-target, evidence %, biggest gap, competency graph, readiness meter, active internship, 3 recommended opps, applications table | too much; no single next step; it's a report                                                                      | **REBUILD** as "You are here" (see §24)                                                                                                                 |
| `/student/passport`           | Competency Passport           | view / share (QR)     | open `/verify`            | identity, readiness, competencies + skills, verified skills, endorsements, projects, certs                                                        | good content, but it's a _second_ profile view alongside `/student/skills`; and it's a "page" not a "culmination" | **KEEP** as the shareable culmination; source all data from the one Profile                                                                             |
| `/student/skills`             | Skill graph + evidence ledger | inspect skills        | hover evidence rationale  | competency map (SVG), per-skill level + evidence + evidence items                                                                                 | this is _the profile_ but named "Skill Graph"; overlaps Passport                                                  | **MERGE** → becomes the **Competency Profile** screen (with Passport as its "share" mode)                                                               |
| `/student/assessment`         | Adaptive skill assessment     | take assessment       | pick skill                | question, adaptive difficulty, result (score/level/weak areas)                                                                                    | genuinely good; but discoverability is poor — it's buried as a peer nav item                                      | **DEMOTE**: launchable from a skill row, from a gap, and from Next Best Action; keep a lightweight index at Profile › Assessments                       |
| `/student/gaps`               | Skill gaps + roadmap          | read plan             | link to assessment        | gap list (priority, actions, resources), sequenced roadmap                                                                                        | strong content; but "gaps" only mean something _relative to a career goal_                                        | **MERGE** → a tab of **Career** (Career › Gaps & Plan)                                                                                                  |
| `/student/simulator`          | Compare role fits             | toggle roles          | see gaps per role         | match %, readiness, competencies, gaps per role, side by side                                                                                     | duplicates half of the career-goal job; "simulator" is jargon                                                     | **MERGE** → **Career › Explore roles** (the "which role am I closest to" mode of the Career screen)                                                     |
| `/student/opportunities`      | Ranked opportunity feed       | open an opportunity   | filter                    | strong/promising vs stretch lists, OpportunityCard (match, missing, applied)                                                                      | good; belongs under Career, not as its own silo                                                                   | **MERGE** → **Career › Opportunities**                                                                                                                  |
| `/student/opportunities/[id]` | Explainable match + apply     | apply                 | read gap for this posting | full MatchBreakdown, competency checklist, role details, gap                                                                                      | excellent — the flagship "not a black box" screen                                                                 | **KEEP** (route can live under `/career/opportunities/[id]`)                                                                                            |
| `/student/applications`       | Application tracker           | scan statuses         | —                         | seeded + local applications, status bar                                                                                                           | orphan; low context                                                                                               | **MERGE** → **Career › Applications** (a tab), and surface the _next_ pending action on Home                                                            |
| `/student/internship`         | Internship workspace          | track milestones/logs | —                         | objectives, milestones, weekly logs, skill delta, final eval                                                                                      | good, but it's "Experience," and it's empty for most students                                                     | **MERGE** → **Journey › Experience** (internships + industry projects); show only when the student has one                                              |
| `/student/copilot`            | Career chat                   | ask questions         | suggested prompts         | grounded facts + narrative                                                                                                                        | chat-as-destination competes with the IA                                                                          | **DEMOTE**: a persistent "Ask" affordance (⌘K / a corner button) available on every screen, pre-loaded with the current context; no standalone nav item |

### Recruiter (current: 4)

| Route                                 | Purpose                      | Verdict                                                                                      |
| ------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------- |
| `/recruiter`                          | Overview                     | **REBUILD** as "Your hiring pipeline" (one job: fill roles)                                  |
| `/recruiter/opportunities`, `/…/[id]` | Postings + candidate ranking | **KEEP** — this is the recruiter's core surface                                              |
| `/recruiter/talent`                   | Pool-wide search by role fit | **MERGE** into the posting's candidate view + a global "Search talent" (one screen, filters) |
| `/demand`                             | Demand intelligence          | **KEEP** (contextual: link from a posting's requirements)                                    |

### Faculty (current: 3) — already lean

| Route                     | Verdict                                                                    |
| ------------------------- | -------------------------------------------------------------------------- |
| `/faculty`                | **REBUILD** lightly around "Develop & connect my students"                 |
| `/faculty/verification`   | **KEEP** — the highest-value faculty action (turns evidence into verified) |
| `/faculty/collaborations` | **KEEP** — pipeline                                                        |

### Institution (current: 5) — mostly good

| Route                     | Verdict                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| `/institution`            | **KEEP** as Command Center (one job: understand & improve readiness) |
| `/institution/heatmap`    | **KEEP** — flagship                                                  |
| `/institution/students`   | **KEEP** — merge in a "cohort readiness" view                        |
| `/institution/placements` | **KEEP**                                                             |
| `/demand`                 | **KEEP** (contextual link from heatmap gaps)                         |

### Admin (current: 5) — fine; governance, keep as-is.

**Net for students:** 11 routes → **6 destinations** (Home, Journey, Career,
Profile, Passport, Settings), with the current pages surviving as _sections_ of
those, plus one detail route (`/career/opportunities/[id]`).

## 3. Current navigation problems

- **Flat and long.** 10 sibling items with no grouping; the student must scan all
  10 to decide where to go.
- **Named by feature, not by intent.** "Skill Graph & Evidence," "Career
  Simulator," "Internship Workspace" are internal names. A first-year doesn't
  know what a "simulator" does for them.
- **No primary path.** Nothing is visually "the main thing"; Overview and the
  other 9 look equal.
- **Redundant destinations.** Passport ≈ Skill Graph (both are the profile);
  Simulator ≈ part of Career Goal; Gaps only exist relative to a goal.
- **Chat as a nav peer.** Signals the UI can't stand on its own.
- **No breadcrumb / "where am I."** Deep pages (`/opportunities/[id]`) have a
  back link but no place in a hierarchy.
- **Same structure for recruiter/institution** even though their jobs differ.

## 4. Target user mental model

Every screen must let the student answer these six questions in under five
seconds:

1. **Where am I?** — journey stage + readiness for my target.
2. **Where have I been?** — completed stages, timeline of milestones.
3. **Where am I going?** — target role, the stages still ahead.
4. **What have I achieved?** — verified competencies, projects, experience.
5. **What's missing?** — the specific gaps blocking my target.
6. **What do I do next?** — exactly one recommended action.

The **object** the student manages is their **Competency Profile**. The **verb**
is **"advance my journey."** Everything else is a lens on that object or a step
in that verb.

## 5. Proposed information architecture

Four ideas carry the whole redesign:

1. **The Journey spine** — a single ordered model of the student lifecycle that
   the UI renders as a progress path everywhere it matters.

   ```
   01 Education → 02 Skills → 03 Evidence → 04 Experience →
   05 Career Readiness → 06 Applications → 07 Placement
   ```

   (7 stages. "Assessments," "Projects," "Certifications," "Achievements" are
   _inputs_ to stages 02–03, not stages themselves. "Skill Gaps / Roadmap /
   Simulator" are _views_ of stage 05.)

2. **One Competency Profile** — the single source of truth. Education +
   Assessments + Projects + Internships + Certifications + Achievements + faculty
   & industry feedback all _feed_ it. It _powers_ readiness, gaps, matching, the
   Passport.

3. **Next Best Action** — a deterministic engine that always names the one
   highest-leverage step, shown on Home and echoed contextually.

4. **Progressive disclosure** — 4 nav groups, ~6 student destinations; depth is
   reached by drilling from where it's relevant, never by scanning a long menu.

### Nav groups (student)

```
● HOME            "You are here" — status, journey path, next action

● MY JOURNEY      the story, stage by stage
    Education        courses → grades → skills produced
    Skills           declared + assessed skills, evidence strength
    Projects         mini / major / industry / personal, each → competency
    Experience       internships & industry projects, lifecycle + skill delta
    Certifications   issuer, skills, verification status
    Achievements     hackathons, awards, publications, leadership
    Timeline         chronological view of everything above

● CAREER          the pursuit
    Goal             target role, industries, locations, interests
    Readiness & Gaps deterministic score + what's blocking it + the plan
    Explore roles    "which role am I closest to" (was: Simulator)
    Opportunities    ranked feed + explainable match
    Applications     saved → applied → … → offer, with timeline

● MY PROFILE      the artefact
    Competency Profile   the full graph + evidence ledger (was: Skill Graph)
    Competency Passport  the shareable, verifiable culmination
    Documents            resume, offer letters, reports (evidence store)

Settings
```

Only **HOME** and the three group headers (**MY JOURNEY**, **CAREER**, **MY
PROFILE**) are ever visible at rest on desktop; the sub-items expand under the
active group. On mobile this is a 4-item bottom bar (§26).

## 6. Proposed navigation (behaviour)

- **Desktop:** left rail with 3 collapsible groups + Home + Settings. The group
  containing the current page is expanded; others collapsed. Active item
  highlighted. A slim **journey progress strip** sits at the top of the content
  area on every Journey/Career page ("Stage 4 of 7 · Experience").
- **Command palette (⌘K):** jump to any destination, any skill, any project, any
  opportunity; also "Ask" (the copilot, context-loaded). This is how power users
  and judges move fast without a big sidebar.
- **Contextual entry points:** a gap links to its assessment and its learning
  resources; a course links to the skills it produced; a project links to the
  competencies it evidences. Depth is _reached_, not _listed_.
- **Breadcrumb** on every sub-page: `Career › Readiness & Gaps › Docker`.

## 7. Proposed student journey

The single primary path, with what each stage _reads_ and _does_:

| Stage                   | The student sees                                                                                      | The student does                                                  | Feeds                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------- |
| **01 Education**        | terms, courses, grades/credits, and the **skills each course produced**                               | add/confirm courses; link a course to skills                      | Skills                           |
| **02 Skills**           | declared skills, assessed levels, which are strong / unproven                                         | take an assessment; request verification                          | Evidence, Readiness              |
| **03 Evidence**         | per skill: self-declared → assessment → project → certificate → faculty → industry; a confidence band | attach a project / certificate as evidence; ask faculty to verify | Competency Profile               |
| **04 Experience**       | internships & industry projects with lifecycle; the **skill delta** each produced                     | log weekly updates; accept the verified skill delta on completion | Verified competencies            |
| **05 Career Readiness** | target role, readiness %, the ranked gaps, the sequenced plan, closest alternative roles              | set/adjust the Career Goal; accept a plan step as a to-do         | Next Best Action, Opportunities  |
| **06 Applications**     | opportunities ranked by explainable match; each application's stage + timeline                        | apply; prep for the next application step                         | Placement                        |
| **07 Placement**        | the offer(s), role, how readiness moved from start → offer, which gaps were closed on the way         | accept; the outcome writes back to the Profile                    | Institution & industry analytics |

Every stage screen ends with a **"what unlocks the next stage"** line and a
button to the relevant action.

## 8. Proposed industry journey

**Primary job: "Fill this role with someone whose skills are proven."**

```
● PIPELINE        my open roles, applicants per stage, who needs a decision
● POST A ROLE     define by competency (not keywords); preview the match model
● ROLE › CANDIDATES   evidence-weighted ranking, per-factor "why", "explain A vs B"
● SEARCH TALENT   the whole pool, filter by competency / evidence / institution
● SIGNALS         skill-demand intelligence (mine vs market) — contextual from a role
```

Home answers: _which roles are stalled, who's waiting on me, which of my
requirements are hardest to hire for._

## 9. Proposed faculty journey

**Primary job: "Turn my students' work into verified competency, and connect
them to industry."**

```
● MY STUDENTS     cohort readiness, who's stuck, whose evidence I can verify
● VERIFY          the queue — projects & skills awaiting my sign-off (highest leverage)
● CONNECT         collaboration pipeline (guest lectures → live projects → outcomes)
● MY ENGAGEMENT   my industry engagement score and what moves it
```

## 10. Proposed institution journey

**Primary job: "Understand workforce readiness and act on the gaps."**

```
● COMMAND CENTER  readiness, placement-ready %, top systemic gaps, next actions
● HEATMAP         department × skill, drill to students + a recommended action
● COHORTS         students by department/year, readiness distribution
● PLACEMENTS      readiness → outcome correlation, conversion, time-to-offer
● DEMAND          industry demand vs our supply (contextual from a heatmap gap)
```

Already close to this; mainly reframe `/institution` around "top gaps → actions"
and fold `students` + a distribution view into "Cohorts."

## 11. Education architecture

**New entities:** `AcademicTerm` (year, semester), `Course`
(code, title, credits, term), `Enrolment` (student × course → grade, status),
`CourseSkillMap` (course → skills it develops, with a target level).

**Screen (Journey › Education):**

- Term-by-term list. Each course row: `DBMS · A · 4 credits` → chips for **skills
  produced** (`SQL`, `Database Design`) → a link to any **project** or
  **assessment** tied to that course.
- A course detail drawer: description, faculty, grade, the skills it maps to and
  at what level, evidence produced.
- **The connection is the point:** Education is never shown as a transcript;
  it's shown as _"this is where these skills came from."_

**Guard-rail:** do **not** build attendance, fee, timetable, exam-form ERP
features. Education exists only to (a) seed the skill list and (b) provide
academic evidence.

## 12. Skill architecture

**Keep** `Skill`, `Competency`, `StudentSkill`, `SkillEvidenceRef`, the engines.

**Restructure the surface:** "Skill Graph & Evidence" stops being a standalone
route. It becomes:

- **Journey › Skills** — a working list: each skill with declared level, assessed
  level, evidence band, and its **source** (which course / project / internship
  produced it). Inline actions: _Take assessment_, _Attach evidence_, _Request
  verification_.
- **Profile › Competency Profile** — the _read_ view: the radial competency map +
  the full evidence ledger, for inspection and (via Passport) sharing.

**One skill, one detail drawer** reachable from anywhere: level history, every
evidence item, the competencies it rolls into, the roles that need it, the
learning resources for it.

## 13. Project architecture

**Extend `Project`:**

```
type:        mini | major | personal | academic | industry | open_source
status:      planned | in_progress | submitted | evaluated | archived
role:        e.g. "Backend + ML"
team:        [names] | solo
period:      start–end
tech:        [strings]
skillIds:    [...]                # already exists
competencyClaims: [competencyId]  # what this project is meant to evidence
links:       { repo, demo, docs }
evaluations: [{ by, role: faculty|industry, rubric, verdict, date }]
courseId?:   link to the course it was done for
internshipId?: link if it was an internship deliverable
```

**Screen (Journey › Projects):** grouped by type; each card shows the **skill →
evidence → competency** chain explicitly (`Recommendation System → Python, ML,
Pandas → evidence: repo + faculty evaluation → contributes to: ML Engineering`).
Project detail = a mini case study.

## 14. Internship architecture

**`Internship` already has** objectives, milestones, weekly logs, skill delta,
final evaluation. **Add the visible lifecycle** (the current page shows a status
badge but not the pipeline):

```
Discovered → Applied → Shortlisted → Selected → Onboarding →
Active (milestones + weekly logs) → Mentor evaluation →
Final evaluation → Skill delta accepted → Verified competencies → Completed
```

**Screen (Journey › Experience):** a stage tracker at the top; below it,
milestones, logs, and — prominently — **"Skills gained → verified competencies"**
with the before/after levels and the mentor's per-skill rating. On completion the
student explicitly **accepts the skill delta**, which writes industry-verified
evidence to the Profile (make this a visible, satisfying moment — it's the core
loop).

"Industry projects" (a collaboration deliverable) share this screen.

## 15. Certification architecture

**Extend `Certification`:** `expiry?`, `verificationStatus` (unverified |
self-verified | issuer-verified), `competencyClaims: [competencyId]`,
`evidenceUrl`.

**Screen (Journey › Certifications):** each cert row → the **skills it covers**
and whether those skills' evidence bands actually moved because of it. A cert
with no linked skill and no verification is shown as _low evidence value_ —
honest, and it nudges the student to connect it.

## 16. Achievement architecture

**New entity `Achievement`:**

```
type:       hackathon | award | competition | publication | research |
            leadership | extracurricular
title, org, date, description
skillIds:   [...]          # optional
competencyClaims: [...]    # optional
evidence:   { url, verifier?, verifiedBy? }
```

**Screen (Journey › Achievements):** timeline-style list; each item can carry
evidence and can claim a (behavioural or technical) competency, which then shows
up in the Profile with an "achievement" evidence chip. Keeps the same
_everything → evidence → competency_ discipline.

## 17. Career architecture

**Promote Career Goal to a screen.** `Student` already has `targetRoleId` and
`careerInterests[]`; add `preferredIndustries[]`, `preferredLocations[]`,
`workModePreference`.

**Career (group) = 5 tabs of one coherent surface:**

- **Goal** — pick target role + preferences. Everything below recomputes live.
- **Readiness & Gaps** — the deterministic readiness score with its factor
  breakdown (from `readiness.ts`), the ranked gaps (`skill-gap.ts`), and the
  **sequenced plan** where each step is a to-do the student can accept.
- **Explore roles** — the current Simulator: compare the target with 2–3
  alternatives; "you are closest to X." Framed as _"is my goal the right goal?"_
- **Opportunities** — the ranked feed (`matching.ts`), strong/promising/stretch.
- **Applications** — saved → applied → screening → assessment → interview → offer
  → accepted/rejected, each with a timeline and a "next step for this
  application."

This collapses 4 current routes (gaps, simulator, opportunities, applications)
into 1 destination with 5 tabs, all driven by the one Career Goal.

## 18. Application architecture

**Extend `Application`:** `stage` enum as above, `events: [{ stage, at, note }]`
(timeline), `nextStep?: { label, dueDate? }`.

**Where it lives:** a tab of **Career** (not a top-level route). What surfaces
elsewhere: any application with a pending `nextStep` becomes a candidate for
**Next Best Action** and appears in Home's "recent / upcoming."

## 19. Placement architecture

**Make Placement a visible stage 07.** `PlacementOutcome` exists for institution
analytics; add a student-facing view:

- **Journey › (stage 07)** — when an application reaches `offer`/`accepted`, the
  student sees: role, employer, the offer, and a **"how you got here"**
  mini-timeline: readiness at goal-set → readiness at each internship → readiness
  at offer, and the specific gaps closed along the way.
- On acceptance, the outcome writes back to the Profile and (in aggregate) to the
  institution's placement intelligence — closing the ecosystem loop the demo
  narrates.

## 20. Competency Profile architecture

**The single source of truth.** One object, assembled from all Journey inputs:

```
Education (courses → skills)          ┐
Self-declared skills                  │
Assessments (score → level)          │
Projects (claims → evaluations)       ├─▶  COMPETENCY PROFILE
Internships (skill delta)             │      • per-skill: level + evidence band + sources
Certifications                        │      • per-competency: rolled-up level + evidence
Achievements                          │      • confidence: low / moderate / high / verified
Faculty & industry feedback           ┘
```

**It powers:** readiness, gaps, role matching, the Passport, the recruiter view,
the institution heatmap. **Screen (Profile › Competency Profile):** the radial
map + the evidence ledger (today's `/student/skills` content), now correctly
positioned as _the_ profile, with every entry showing its **source chain**.

## 21. Competency Passport architecture

**The culmination, not another profile page.** Same data as the Profile, but:

- Framed as _"everything I've accomplished, verifiable by anyone."_
- Sections mirror the Journey: Education → Verified skills → Competencies →
  Projects → Experience → Certifications → Achievements → Readiness.
- Emphasises **verified** items; low-evidence items are present but visually
  quiet.
- QR + `/verify/[credentialId]` (already built).
- A **"share"** action (copy link / download PDF later). It should feel like
  generating a report card of your whole degree, on demand.

## 22. Timeline concept

**A first-class view: Journey › Timeline.** One vertical, reverse-or-forward
chronological stream of every meaningful event, typed and coloured:

```
2024 Jul  ● Started B.Tech CSE, AIET
2025 Feb  ● Course: DBMS — grade A → skills: SQL, DB Design
2025 Mar  ◆ Assessment: SQL 82% → level 4
2025 Apr  ■ Project: Student Management System (mini) → evidence: repo + eval
2025 Sep  ★ Hackathon: 2nd place, InnovateX → competency claim: Collaboration
2026 Jan  ▲ Internship: Data Science Intern @ VedaLabs — Active
2026 Mar  ✓ Faculty verified: Python (L6)
2026 May  ▲ Internship completed → skill delta accepted: Docker L2→L4
2026 Jun  ◎ Applied: ML Engineer Intern @ CropWise (67% match)
2026 Jul  ● Offer: Data Analyst @ BrightGrid
```

- Filter by type (Education / Skills / Projects / Experience / Applications /
  Achievements).
- Each event links to its detail.
- This becomes the student's **evolving professional story** — the thing they'd
  screenshot, the thing a mentor reviews, the thing that makes four years feel
  like one narrative.

## 23. Next Best Action concept

**A deterministic ranking function** (`lib/engines/next-action.ts`, proposed)
that scores candidate actions by _leverage_ (how much they move readiness /
unblock the target / raise evidence confidence) × _effort_ (inverse). Candidates
are generated from the Profile + Career Goal + open applications, e.g.:

| Trigger                                                    | Action                                                 | Why it ranks                                   |
| ---------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------- |
| Mandatory competency gap ≥ 2 levels, no plan step accepted | "Start the MLOps plan — it's blocking ML Engineer"     | highest leverage: unblocks the goal            |
| Role skill self-rated but never assessed                   | "Take the SQL assessment — turn a claim into evidence" | cheap, raises evidence band                    |
| Skill with a project but no verification                   | "Ask Prof. Rao to verify your Recommendation System"   | one click for the student, big confidence jump |
| Application in `interview`, no `nextStep` set              | "Prep for your CropWise interview (in 3 days)"         | time-sensitive                                 |
| Internship complete, skill delta not accepted              | "Accept your verified Docker + FastAPI skills"         | free readiness gain                            |
| Career Goal never set                                      | "Set your target role so we can guide you"             | prerequisite for everything                    |

**Surfaced:** one card on Home ("Your next best action"), plus a small echo at
the top of the relevant Journey/Career screen. Never more than one at a time on
Home. Fully explainable ("we suggested this because …").

## 24. Dashboard redesign (Home)

Replace the stat-card wall with an **orientation screen**. Vertical, calm, ~5
blocks:

```
1. GREETING + GOAL
   "Good evening, Aarav."
   Target: ML Engineer   ·   Readiness 78%   [Change goal]

2. YOUR JOURNEY  (the spine, as a progress path)
   Education ✓   Skills ✓   Evidence ✓   Experience ●   Readiness ●
   Applications ○   Placement ○
   (each node clickable → that stage; current node pulsing)

3. YOUR NEXT BEST ACTION   (exactly one)
   "Complete the Docker assessment — it's the top blocker for ML Engineer."
   [Start assessment]   ·   why this?

4. RECENT ACTIVITY   (last 4–5 timeline events, read-only)
   ✓ Internship evaluation received     • Python competency verified
   ■ Mini project submitted             ◎ Applied to CropWise

5. A FEW OPPORTUNITIES   (2–3, not a grid)
   ML Engineer Intern · VedaLabs · 70% — missing: MLOps, Cloud   [View]
```

No competency graph on Home (it lives in Profile). No applications table on Home
(it lives in Career). Home is 30 seconds of orientation, then a door.

## 25. Progressive disclosure strategy

- **Level 0 (Home):** goal, journey path, one action. Nothing else.
- **Level 1 (group landing):** e.g. _My Journey_ shows the 7 stages as cards with
  a one-line status each; _Career_ shows goal + readiness + "3 gaps, 5 matches."
- **Level 2 (stage/tab):** the full working surface (course list, gap list,
  opportunity feed).
- **Level 3 (detail drawer):** a single skill / course / project / opportunity,
  with its full source chain and actions.
- **Rule:** a feature earns a nav slot only if a student would deliberately
  navigate _to_ it. Assessments, verification requests, learning resources,
  role-compare — all reachable from where they're relevant, none in the rail.

## 26. Mobile strategy

- **Bottom bar, 4 items:** Home · Journey · Career · Profile. (Settings + Ask via
  a top-right menu.)
- **Journey / Career** open to their Level-1 card list; tap a card → the stage.
- **Journey progress strip** becomes a horizontal scroll of stage chips.
- **Next Best Action** is the first thing on Home, full-width, one tap.
- **Command palette** → a full-screen search sheet.
- No feature requires the sidebar; everything is reachable in ≤ 3 taps.

## 27. Visual design direction

Keep the current token system (indigo + saffron, semantic data colours) — it's
already restrained and "government-enterprise." Change the _composition_:

- **Fewer cards, bigger surfaces.** A stage screen is one continuous panel, not 6
  cards.
- **Typographic hierarchy over boxes.** Section headings + generous whitespace
  instead of bordered card-in-card.
- **The journey path is the recurring motif** — a slim horizontal stepper,
  present on Home and every Journey/Career screen, always showing "stage N of 7."
- **One chart per screen, max.** The radial competency map on Profile; the
  readiness factor bars on Career; the heatmap for institutions. Nowhere else.
- **Status as text, not badge soup.** "Verified · faculty" reads better than 3
  coloured pills.
- **Calm motion:** the journey stepper animates progress on load; nothing else
  moves unless it communicates state.
- **Density where it earns its place:** the evidence ledger, the candidate
  ranking, the heatmap — these _should_ be dense. Home and stage-landing screens
  should not.

## 28. Features to merge

| Merge these                                                  | Into                                                                                        | Result                                 |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| Skill Graph & Evidence + Passport (data)                     | **one Competency Profile** object; Passport = its shareable mode                            | one source of truth, two presentations |
| Skill Gaps + Career Simulator + Opportunities + Applications | **Career** (5 tabs), all driven by one Career Goal                                          | 4 routes → 1 destination               |
| Assessment index                                             | reachable from a skill row, a gap, and Next Best Action; small index under Profile › Skills | discoverable in context, not a silo    |
| Recruiter › Talent Search                                    | into the posting candidate view + one global "Search talent"                                | 1 search surface                       |
| Institution › Students                                       | into **Cohorts** (list + readiness distribution)                                            | 1 screen                               |
| Career Copilot                                               | a persistent **Ask** affordance (⌘K / corner), context-loaded                               | not a destination                      |

## 29. Features to remove

- **`/student` as a report dashboard** — replaced by the orientation Home (the
  data doesn't disappear; the _screen concept_ does).
- **"Simulator" as a named concept** — becomes "Explore roles" inside Career.
- **Standalone Applications and Gaps routes** — become Career tabs.
- **Redundant "match to target" stat on Home** — it's the same number as
  readiness-adjacent; show readiness + journey stage instead.
- Nothing is _deleted from the domain_; this is IA consolidation.

## 30. Features to introduce

| New                                                                                | Type                         | Why it matters                                                                                                                        |
| ---------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Education** (terms, courses, grades, course→skill map)                           | entity + screen              | Stage 01 of the ecosystem; makes "education creates skills" visible; grounds the whole journey in something every student already has |
| **Achievements**                                                                   | entity + screen              | Hackathons/awards/publications have no home today; they carry real (often behavioural) competency signal                              |
| **Timeline**                                                                       | view                         | Turns modules into a story; the reason to return each semester                                                                        |
| **Next Best Action engine**                                                        | `lib/engines/next-action.ts` | Removes "what do I do now?" anxiety; one deterministic, explainable recommendation                                                    |
| **Career Goal screen**                                                             | screen (data mostly exists)  | Everything flows from the goal; today it's an invisible field                                                                         |
| **Richer Projects** (type, lifecycle, team, links, evaluations, competency claims) | entity extension             | Projects are the main _evidence factory_; they're currently under-modelled                                                            |
| **Journey progress stepper**                                                       | component                    | The recurring "you are here" motif                                                                                                    |
| **Command palette + contextual Ask**                                               | component                    | Fast navigation without a big rail; the copilot without a chat silo                                                                   |
| **Accept skill delta** moment                                                      | interaction                  | Makes the internship→verified-competency loop tangible                                                                                |

## 31. Proposed sitemap

```
KAUSHALSETU
│
├── /                         Landing
├── /demo                     Judge personas (+ "guided tour")
├── /judge                    Technical showcase
├── /verify , /verify/:id     Public credential verification
│
└── (authenticated)
    │
    ├── STUDENT
    │   ├── /home                         "You are here"
    │   ├── /journey                      stage overview (7 cards)
    │   │   ├── /journey/education
    │   │   ├── /journey/skills
    │   │   ├── /journey/projects , /journey/projects/:id
    │   │   ├── /journey/experience , /journey/experience/:id
    │   │   ├── /journey/certifications
    │   │   ├── /journey/achievements
    │   │   └── /journey/timeline
    │   ├── /career                       goal + readiness summary
    │   │   ├── /career/goal
    │   │   ├── /career/readiness         (gaps + plan)
    │   │   ├── /career/explore           (role compare)
    │   │   ├── /career/opportunities , /career/opportunities/:id
    │   │   └── /career/applications , /career/applications/:id
    │   ├── /profile                      Competency Profile
    │   │   ├── /profile/passport
    │   │   └── /profile/documents
    │   └── /settings
    │
    ├── INDUSTRY
    │   ├── /industry/pipeline
    │   ├── /industry/roles , /industry/roles/:id  (post + candidates)
    │   ├── /industry/talent
    │   └── /industry/signals              (was /demand)
    │
    ├── FACULTY
    │   ├── /faculty/students
    │   ├── /faculty/verify
    │   ├── /faculty/connect               (collaborations)
    │   └── /faculty/engagement
    │
    ├── INSTITUTION
    │   ├── /institution                   Command Center
    │   ├── /institution/heatmap
    │   ├── /institution/cohorts
    │   ├── /institution/placements
    │   └── /institution/demand
    │
    └── ADMIN  (unchanged)
        ├── /admin , /admin/taxonomy , /admin/employers ,
        └── /admin/matching , /admin/audit
```

Route _names_ can differ; the **shape** (Home + 3 groups for students, 1 job per
other role) is the recommendation.

## 32. User flows

**A. First-time student (the make-or-break flow)**

```
Home (empty-ish) → NBA: "Set your target role" → /career/goal
  → pick ML Engineer → readiness computes (low, honest)
  → Home now shows the 7-stage path, stage 01–02 marked from seeded education/skills
  → NBA: "Take the SQL assessment" → assessment → level recorded, evidence band rises
  → Home: readiness ticks up; next NBA appears
```

**B. Returning student (weekly)**

```
Home → glance: journey stage, readiness delta since last visit, recent activity
  → NBA (one thing) → do it → readiness moves → done for the week
```

**C. Evidence → competency (the loop)**

```
/journey/projects/:id → "claim: ML Engineering" → attach repo + request faculty eval
  → faculty verifies (faculty app) → evidence band jumps to "verified"
  → Profile + readiness update → Timeline event added
```

**D. Internship → verified competency**

```
/journey/experience/:id (Active) → weekly logs → status → Mentor evaluation
  → "Accept skill delta: Docker L2→L4, API L3→L4" → industry-verified evidence written
  → readiness up → Timeline event → Passport updated
```

**E. Career pursuit → placement**

```
/career/opportunities → open a 70% match → explainable breakdown + gap
  → apply → /career/applications tracks stage + nextStep
  → offer → stage 07 Placement view: "how you got here" readiness timeline
  → accept → outcome writes to Profile + institution analytics
```

**F. Recruiter**

```
/industry/pipeline → role with 20 applicants, 4 awaiting decision
  → /industry/roles/:id → ranked candidates, expand top 3 → "explain A vs B"
  → shortlist → candidate moves stage (mirrors in student's Applications)
```

**G. Institution**

```
/institution → "Top gap: MLOps, 61% of CSE below L4" → click
  → /institution/heatmap cell → students list + "recommended action: add elective"
  → cross-link to /institution/demand → "MLOps demand +40% this quarter"
```

## 33. Data relationships

```
AcademicTerm ─< Course ─< Enrolment >─ Student
Course ─< CourseSkillMap >─ Skill

Student ─< StudentSkill >─ Skill ─< CompetencySkill >─ Competency
StudentSkill ─< SkillEvidenceRef        (kind: self|assessment|project|cert|faculty|industry)

Student ─< Project >─ Skill ; Project ─< ProjectEvaluation ; Project ─ competencyClaims[]
Student ─< Certification >─ Skill ; Certification ─ competencyClaims[]
Student ─< Achievement ; Achievement ─ skillIds[] / competencyClaims[]

Student ─ CareerGoal (targetRole, industries[], locations[], interests[])
Student ─< Application >─ Opportunity >─ RoleProfile ; Application ─< ApplicationEvent
Application ─ (offer) ─> PlacementOutcome
Student ─< Internship >─ Opportunity ; Internship ─ skillDelta[] ─> SkillEvidenceRef(industry)

Student ── (all of the above) ──▶ CompetencyProfile ──▶ Readiness, Gaps, Match, Passport
Institution ◀── aggregate(CompetencyProfile, PlacementOutcome) ── Heatmap, Cohorts, Placements
Employer ◀── verified competencies ── CandidateRanking
```

Every arrow into `CompetencyProfile` is an _evidence source_; the engines
(`evidence`, `profile`, `readiness`, `skill-gap`, `matching`) are unchanged —
they just get richer, better-sourced input.

## 34. Judge demo journey (revised, still ~5 min)

The new structure makes the story _tighter_:

1. **0:00** Landing → one line: "an evidence-based competency intelligence layer."
2. **0:30** Enter as Aarav → **Home**: goal ML Engineer, readiness 78%, the
   **7-stage journey path**, **one Next Best Action**. _"The whole product in one
   screen."_
3. **1:15** Click **Journey → Education**: "DBMS → SQL, DB Design" — _"skills come
   from somewhere."_ → **Skills**: SQL is assessed + verified; AWS is
   self-declared only, discounted.
4. **2:00** **Career → Readiness & Gaps**: deterministic score, ranked gaps
   (MLOps…), the sequenced plan. → **Explore roles**: "closest to Data
   Scientist." → **Opportunities → a 70% match → the explainable breakdown**.
5. **3:00** **Switch to Rohan (recruiter)** → same posting → candidate ranking →
   **"Explain A vs B"** → _"same number, both sides."_
6. **3:45** **Switch to Dr. S. Rao (institution)** → Command Center top gap →
   **Heatmap** cell → students + recommended action → **Demand** cross-link.
7. **4:30** Back to Aarav → **Journey → Experience**: "Accept skill delta" →
   readiness ticks up → **Timeline** shows the whole story → **Passport** (QR →
   `/verify`).
8. **5:00** Close on `/judge`.

Same beats as today, but the judge now sees **one journey** instead of tabbing
between 10 tools.

## 35. Recommended implementation order

Phased so the app stays shippable and the SIH demo is never broken.

**Phase 0 — IA shell (no new data).** New nav groups + routes as thin wrappers
that _re-mount the existing pages_ under the new URLs; add the journey progress
stepper (computed from existing data); rebuild **Home** as the orientation
screen. Redirect old routes. _Outcome: the product feels reorganised; nothing
lost._

**Phase 1 — Next Best Action.** `lib/engines/next-action.ts` + the Home card +
contextual echoes. Pure function over existing Profile/Goal/Applications. _High
UX payoff, low risk._

**Phase 2 — Career consolidation.** Merge gaps + simulator + opportunities +
applications into `/career` with tabs, all driven by a real **Career Goal**
screen. Extend `Application` with `stage` + `events`.

**Phase 3 — Profile as source of truth.** Rename/reframe Skill Graph →
Competency Profile; make Passport render from the same object; add the **source
chain** to every skill/competency.

**Phase 4 — Journey inputs: Projects + Experience.** Extend `Project`
(type/lifecycle/links/evaluations/claims); add the visible internship lifecycle +
the **"accept skill delta"** moment.

**Phase 5 — Education.** New `AcademicTerm` / `Course` / `Enrolment` /
`CourseSkillMap` entities + seed data + the Education screen. Biggest new
surface; do it once the spine is proven.

**Phase 6 — Achievements + Timeline.** `Achievement` entity + screen; the
Timeline view aggregating all typed events.

**Phase 7 — Placement stage + mobile bottom nav + command palette + Ask.**

**Phase 8 — Other roles.** Reframe recruiter around "pipeline," faculty around
"verify & connect," institution around "gaps → actions." Mostly nav + Home
copy; their deep screens already fit.

Each phase: keep `lint / typecheck / test / build` green, keep the demo path
working, commit, redeploy.

---

## Most important question — "why would a student return every week?"

Not because it has dashboards. A student returns because:

> **KaushalSetu is the only place that shows their four years as one story that
> is visibly getting stronger — and it tells them the single next thing to do to
> make it stronger this week.**

Concretely, three hooks:

1. **Compounding narrative (Timeline + Journey path).** Every course, project,
   assessment, internship and award lands on _one_ growing story. Coming back
   feels like adding a chapter, not filing paperwork. After a semester of use,
   the student has something they're proud to show a mentor or a recruiter —
   that they can't reconstruct anywhere else.
2. **One next action, always.** No "what should I do?" paralysis. Open the app,
   see the single highest-leverage step, do it, watch readiness move. That's a
   5-minute weekly loop with a visible reward.
3. **Trust that pays off.** Every verified skill, every accepted skill-delta
   visibly raises their match on real opportunities. The effort has an
   immediate, legible payoff — evidence in, opportunities out.

The portal-with-many-features gives none of these. The journey-that-compounds
gives all three.

---

## Recommendation

**Proceed — but phased, starting with Phase 0–2.**

- **Do now (Phase 0–2, ~the highest ratio of UX gain to risk):** the IA regroup,
  the orientation Home, the journey stepper, Next Best Action, and the Career
  consolidation. This alone answers ~80% of the "too complicated / scattered /
  no obvious path" critique, touches **no schema**, and keeps the demo intact.
- **Then (Phase 3–4):** Profile-as-truth + richer Projects/Experience — makes the
  "everything connects" claim real in the UI.
- **Then (Phase 5–6):** Education + Achievements + Timeline — the entities that
  complete the ecosystem and create the weekly-return hook. These add real data
  modelling work and seed data; schedule them once the spine is validated.
- **Phase 7–8:** polish + other roles.

**Cost/scope honesty:** the full redesign is large — 3 new entity groups
(Education, Achievements, richer Projects), 1 new engine (Next Best Action),
~2/3 of the student screens re-composed, and a nav rebuild. Phases 0–2 are ~1–2
focused sessions and are safe. Phases 5–6 are where most of the new work is.

**SIH-timing note:** if the presentation is near, ship **Phase 0–2 only** — the
demo becomes dramatically clearer ("the whole product in one screen") with
minimal risk. Save Phases 3–6 for after the hackathon unless there's clear
runway.
