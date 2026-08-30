import Link from "next/link";
import type { Metadata } from "next";

import { Logo } from "@/components/kaushal/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MATCH_WEIGHTS, READINESS_WEIGHTS } from "@/lib/engines/config";
import { getDataset } from "@/lib/demo/dataset";
import { getInstitutionOverview } from "@/lib/data";

export const metadata: Metadata = {
  title: "Technical showcase",
  description:
    "The engineering behind KaushalSetu: competency graph, explainable matching, deterministic engines, AI abstraction, multi-tenancy.",
};

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-border scroll-mt-20 border-t py-10">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-muted-foreground mt-4 space-y-4 text-sm">
        {children}
      </div>
    </section>
  );
}

export default function JudgePage() {
  const d = getDataset();
  const coep = getInstitutionOverview("inst-coep");

  const metrics = [
    ["Students modelled", d.students.length],
    ["Employers", d.employers.length],
    ["Roles (NOS/QP-style)", d.roles.length],
    ["Skills", d.skills.length],
    ["Competencies", d.competencies.length],
    ["Opportunities", d.opportunities.length],
    ["Applications", d.applications.length],
    ["Internships", d.internships.length],
    ["Credentials issued", d.credentials.length],
    ["Placement outcomes", d.placements.length],
  ] as const;

  return (
    <div className="min-h-screen">
      <header className="border-border bg-background/85 sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline">SIH26044 · Ministry of Ayush</Badge>
            <Button asChild size="sm">
              <Link href="/demo">Judge demo</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 pb-20">
        <div className="py-10">
          <h1 className="text-3xl font-semibold">Judge mode</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            The 5-minute walkthrough below links straight into the live product,
            then the engineering view. Sign in as a demo role from{" "}
            <Link href="/login" className="text-primary underline">
              /login
            </Link>{" "}
            or the{" "}
            <Link href="/demo" className="text-primary underline">
              persona picker
            </Link>
            .
          </p>
          <p className="border-primary/30 bg-primary/5 mt-4 rounded-lg border p-3 text-sm">
            <strong className="text-foreground">One sentence:</strong> LinkedIn
            tells you who <em>says</em> they can do the job; KaushalSetu shows
            the <em>evidence</em> that they can, tells the college <em>why</em>{" "}
            its students can&apos;t yet, and tells the curriculum what industry
            will need next.
          </p>
        </div>

        <Section id="walkthrough" title="The 5-minute walkthrough">
          <p className="mb-3">
            One continuous story:{" "}
            <span className="text-foreground">
              education → skills → evidence → competency → career → gap → next
              action → opportunity → recruiter → internship → verified
              competency → institution intelligence
            </span>
            .
          </p>
          <ol className="space-y-2">
            {[
              [
                "0:00 · Problem",
                "Students hold qualifications; nobody has a continuous, evidence-backed view of employability.",
                "/judge#problem",
              ],
              [
                "0:30 · Student",
                "Sign in as Aarav → the Home screen: goal, the 7-stage journey ('you are here'), one Next Best Action.",
                "/student",
              ],
              [
                "1:00 · Education → Skills",
                "Courses map to the skills they produced; skills carry an assessed level.",
                "/student/education",
              ],
              [
                "1:30 · Evidence",
                "Why a skill is trusted: self-declared → assessment → project → faculty → industry. Low-evidence skills are visibly discounted.",
                "/student/skills",
              ],
              [
                "2:00 · Career + gap + action",
                "Deterministic readiness, ranked gaps, the sequenced plan, and 'which role am I closest to'.",
                "/student/career?tab=readiness",
              ],
              [
                "2:30 · Explainable opportunity match",
                "Open a posting → the per-factor breakdown and a 'how to become ready' list.",
                "/student/opportunities/opp-hero-ml",
              ],
              [
                "3:00 · Recruiter",
                "Switch to Rohan → the same match from the hiring side, reconciled to the same number, with 'explain A vs B'.",
                "/recruiter/opportunities/opp-hero-ml",
              ],
              [
                "3:30 · Internship loop",
                "Experience → mentor evaluation → verified skill delta → Competency Passport update.",
                "/student/internship",
              ],
              [
                "4:00 · Institution intelligence",
                "Switch to Dr. S. Rao → department readiness, and the skill heatmap drilling to named students + an action.",
                "/institution/heatmap",
              ],
              [
                "4:45 · Passport & verification",
                "The culmination — everything proven, with a public QR check.",
                "/verify/KS-PASSPORT-AARAV",
              ],
            ].map(([t, desc, href]) => (
              <li key={t} className="border-border rounded-lg border p-3">
                <Link
                  href={href}
                  className="text-foreground font-medium hover:underline"
                >
                  {t} →
                </Link>
                <p className="mt-0.5 text-xs">{desc}</p>
              </li>
            ))}
          </ol>
          <p className="bg-muted/60 mt-3 rounded-md p-2 text-xs">
            Close:{" "}
            <span className="text-foreground">
              KaushalSetu doesn&apos;t just match students to opportunities — it
              continuously connects education, evidence, skills, experience and
              industry demand.
            </span>
          </p>
        </Section>

        <Section id="problem" title="Problem">
          <p>
            SIH26044 asks for a portal for academia–industry skill mapping,
            internships and placement. The literal ask is a solved category
            (LinkedIn / Naukri / Internshala / college ERPs). The unsolved
            problem is upstream: skills are unverifiable, institutions are blind
            to systemic gaps, industry demand never reaches curriculum,
            internship experience is not captured as competency, and matching is
            a black box.
          </p>
          <p>
            For the Ministry of Ayush specifically: the ~₹1 lakh-crore Ayush
            sector is now the largest non-clinical employer of BAMS/BHMS
            graduates (formulation QA, regulatory affairs, pharmacovigilance,
            wellness operations), and Ayush colleges are not set up to map
            students onto those competency profiles.
          </p>
        </Section>

        <Section id="innovation" title="Core innovation">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Evidence Confidence</strong> —
              every skill is scored by the evidence behind it (self-declared →
              assessment → project → certificate → faculty-verified →
              industry-verified). The score only rises as stronger evidence is
              added, and the arithmetic is fixed — not a model. A lone
              self-declaration is capped near zero and visibly discounted in
              every downstream calculation.
            </li>
            <li>
              <strong className="text-foreground">Competency Graph</strong> —
              student and role are both graphs of competencies → skills →
              evidence. Competency level = blend of weakest-link and average,
              times a soft coverage penalty. Matching is graph coverage, not
              string overlap.
            </li>
            <li>
              <strong className="text-foreground">Explainable Matching</strong>{" "}
              — a weighted deterministic score with a per-factor breakdown and a
              &ldquo;how to become ready&rdquo; list. The <em>same</em> function
              powers the student feed and the recruiter ranking, so both sides
              reconcile to the identical number.
            </li>
            <li>
              <strong className="text-foreground">
                Internship → Verified Competency loop
              </strong>{" "}
              — a completed internship writes a structured skill delta into the
              Competency Passport as industry-verified evidence, which lifts
              institutional readiness.
            </li>
          </ol>
        </Section>

        <Section id="architecture" title="Architecture">
          <pre className="border-border bg-card text-foreground overflow-x-auto rounded-lg border p-4 text-xs leading-relaxed">
            {`Next.js 16 (App Router, RSC)  ──  Vercel (Node 24 serverless)
        │
        ├─ UI: server components + a few client islands
        │      (competency graph, simulator, heatmap, copilot, assessment)
        │
        ├─ lib/data  (analysis layer — pure reads, stable return types)
        │      │
        │      ├─ lib/engines  (deterministic, config-driven, unit-tested)
        │      │     evidence · profile resolver · matching · readiness
        │      │     · skill-gap + roadmap · demand aggregation
        │      │
        │      └─ data source (swappable behind the same interface)
        │            demo build → lib/demo  (seeded synthetic dataset)
        │            production → Drizzle + Postgres (Supabase)   [schema authored]
        │
        ├─ lib/ai  (AiProvider abstraction)
        │      MockAIProvider (default) ─┬─ GeminiAIProvider (config swap)
        │      copilot: grounds every answer in engine output
        │
        └─ auth: demo persona cookie  |  production: Supabase Auth + RLS`}
          </pre>
          <p>
            The load-bearing decision:{" "}
            <strong>the data source is an implementation detail</strong>.
            `lib/data` and every page are written against domain types, so the
            demo runs zero-setup on Vercel while the production schema
            (`lib/db/schema.ts`, authored) drops in unchanged.
          </p>
        </Section>

        <Section id="engines" title="Deterministic engines">
          <p>
            Business logic is never AI. Two weighted sums, both configurable:
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border-border bg-card rounded-lg border p-3">
              <div className="text-foreground font-medium">Match score</div>
              <ul className="mt-1 space-y-0.5">
                {Object.entries(MATCH_WEIGHTS).map(([k, v]) => (
                  <li key={k} className="flex justify-between">
                    <span>{k.replace(/([A-Z])/g, " $1").toLowerCase()}</span>
                    <span className="tabular">{Math.round(v * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-border bg-card rounded-lg border p-3">
              <div className="text-foreground font-medium">Readiness score</div>
              <ul className="mt-1 space-y-0.5">
                {Object.entries(READINESS_WEIGHTS).map(([k, v]) => (
                  <li key={k} className="flex justify-between">
                    <span>{k.replace(/([A-Z])/g, " $1").toLowerCase()}</span>
                    <span className="tabular">{Math.round(v * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p>
            27+ unit tests assert engine invariants (weights sum to 1, evidence
            monotonicity, determinism), dataset coherence, the two hero-persona
            narratives, and that the student and recruiter sides of a match
            produce byte-identical scores.
          </p>
        </Section>

        <Section id="ai" title="AI — a bounded role">
          <p>
            AI is the explanation layer, never the decision layer. It may assist
            with resume/JD parsing, skill normalisation, gap narration, roadmap
            phrasing and career Q&amp;A. It <strong>must not</strong> touch
            authorization, eligibility, verification, the match score or the
            readiness score.
          </p>
          <p>
            `AiProvider` has `MockAIProvider` (deterministic, offline, default)
            and `GeminiAIProvider` (a typed scaffold). Enabling Gemini is a
            config change — `AI_PROVIDER=gemini` + `GEMINI_API_KEY`. The app
            runs fully without a key; the Career Copilot always grounds its
            answers in real engine output first.
          </p>
        </Section>

        <Section id="frameworks" title="Framework alignment">
          <p>
            Terminology maps to India&apos;s existing frameworks rather than
            inventing one: <strong>NSQF</strong>-style 1–8 proficiency,{" "}
            <strong>NOS/QP</strong>-shaped role profiles (mandatory competencies
            + skills, preferred, tools, behavioural), and a Competency Passport
            designed to emit <strong>NCrF / Academic Bank of Credits</strong>{" "}
            events in production. Nothing claims to be an official government
            record.
          </p>
        </Section>

        <Section id="security" title="Security &amp; multi-tenancy">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Server-side role guards on every workspace route; UI hiding is
              never the only gate.
            </li>
            <li>
              Only NEXT_PUBLIC_* reaches the browser. Service-role keys are
              guarded with an <code>import &quot;server-only&quot;</code>{" "}
              boundary.
            </li>
            <li>All external input validated with Zod before use.</li>
            <li>
              Production authorization is enforced twice: application layer +
              Postgres <strong>Row-Level Security</strong> filtered by{" "}
              <code>institution_id</code>. Every tenant-scoped table carries it.
            </li>
            <li>
              Architected for 1 → 100 → national scale without a rewrite. See{" "}
              <Link href="/" className="underline">
                SECURITY.md / ARCHITECTURE.md
              </Link>{" "}
              in the repo.
            </li>
          </ul>
        </Section>

        <Section id="metrics" title="Demo metrics">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
            {metrics.map(([label, value]) => (
              <div key={label}>
                <div className="tabular text-foreground text-2xl font-semibold">
                  {value}
                </div>
                <div className="text-xs">{label}</div>
              </div>
            ))}
          </div>
          <p className="mt-3">
            The dataset is deterministic and causally linked — e.g. COEP shows{" "}
            {coep.totalStudents} students, mean readiness {coep.meanReadiness},{" "}
            {coep.placementReady} placement-ready, critical gap{" "}
            <strong>{coep.criticalGaps[0]?.skill ?? "—"}</strong> — and that
            same gap appears in the hero student&apos;s roadmap and in industry
            demand.
          </p>
        </Section>

        <Section id="stack" title="Technology">
          <p>
            Next.js 16 · React 19 · TypeScript (strict) · Tailwind v4 · Drizzle
            + PostgreSQL (Supabase) · Zod · Vitest · Playwright · Vercel. Small,
            current dependency tree; no speculative libraries.
          </p>
        </Section>

        <div className="border-border border-t py-10 text-center">
          <Button asChild size="lg">
            <Link href="/demo">Open the judge demo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
