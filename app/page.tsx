import Link from "next/link";
import type { Metadata } from "next";

import { Logo } from "@/components/kaushal/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDataset } from "@/lib/demo/dataset";

export const metadata: Metadata = {
  title: {
    absolute: "KaushalSetu — Academia–Industry Competency Intelligence",
  },
  description:
    "An evidence-based competency intelligence layer connecting students, academia and industry for skill mapping, internships and placement. SIH26044.",
};

const LIFECYCLE = [
  "Skills",
  "Evidence",
  "Competencies",
  "Assessment",
  "Skill Gap",
  "Development",
  "Industry Match",
  "Internship",
  "Verified Outcome",
  "Competency Passport",
  "Institutional Intelligence",
];

export default function Landing() {
  const d = getDataset();
  const stats = [
    ["Students modelled", d.students.length],
    ["Employers", d.employers.length],
    ["Roles (NOS-style)", d.roles.length],
    ["Skills taxonomy", d.skills.length],
    ["Competencies", d.competencies.length],
    ["Live opportunities", d.opportunities.length],
  ] as const;

  return (
    <div className="min-h-screen">
      {/* nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Logo />
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/judge"
            className="text-muted-foreground hover:text-foreground hidden rounded-md px-3 py-1.5 sm:block"
          >
            Technical showcase
          </Link>
          <Link
            href="/demo"
            className="text-muted-foreground hover:text-foreground hidden rounded-md px-3 py-1.5 sm:block"
          >
            Judge demo
          </Link>
          <Button asChild size="sm">
            <Link href="/login">Enter platform</Link>
          </Button>
        </nav>
      </header>

      {/* hero */}
      <section className="border-border relative overflow-hidden border-b">
        <div className="text-primary/25 grid-bg radial-fade absolute inset-0 -z-10" />
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
          <Badge variant="outline" className="mb-4">
            Smart India Hackathon 2026 · Problem SIH26044 · Ministry of Ayush
          </Badge>
          <h1 className="max-w-3xl text-[1.75rem] leading-tight font-semibold md:text-[2.25rem]">
            From skills to opportunities —{" "}
            <span className="text-primary">with evidence</span>.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-base">
            KaushalSetu is an intelligent academia–industry collaboration
            infrastructure. It measures student competencies, makes skills
            trustworthy through evidence, exposes gaps, and matches people to
            industry with an explanation — not a keyword search.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/login">Enter platform</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/demo">Explore judge demo</Link>
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 md:max-w-2xl">
            {stats.map(([label, value]) => (
              <div key={label}>
                <div className="tabular text-2xl font-semibold">{value}</div>
                <div className="text-muted-foreground text-xs">{label}</div>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-3 text-xs">
            Figures describe the bundled synthetic demo dataset.
          </p>
        </div>
      </section>

      {/* problem */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <h2 className="text-2xl font-semibold">
          Why another portal is not the answer
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          LinkedIn, Naukri and Internshala already do discovery. The problem a
          Ministry cares about is upstream of discovery:
        </p>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-border text-muted-foreground border-b text-left text-xs tracking-wide uppercase">
              <tr>
                <th className="py-2 pr-4 font-medium">The real gap</th>
                <th className="py-2 pr-4 font-medium">What exists</th>
                <th className="py-2 font-medium">What KaushalSetu adds</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {[
                [
                  "Skills on a resume are unverifiable",
                  "Self-declared skills, social endorsements",
                  "Evidence Confidence — every skill scored by the evidence behind it",
                ],
                [
                  "Institutions are blind to systemic gaps",
                  "Placement % only",
                  "Department × skill heatmap, drillable to students and actions",
                ],
                [
                  "Industry demand never reaches curriculum",
                  "Job listings",
                  "Skill-demand intelligence from the live opportunity corpus",
                ],
                [
                  "Internships don't become competency",
                  "A certificate PDF",
                  "Structured, verified skill delta written to the Competency Passport",
                ],
                [
                  "Matching is a black box",
                  "Keyword ATS ranking",
                  "Deterministic weighted match with a per-factor explanation",
                ],
              ].map(([a, b, c]) => (
                <tr key={a}>
                  <td className="py-3 pr-4 font-medium">{a}</td>
                  <td className="text-muted-foreground py-3 pr-4">{b}</td>
                  <td className="text-foreground py-3">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* lifecycle */}
      <section className="border-border bg-muted/30 border-y">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
          <h2 className="text-2xl font-semibold">One continuous loop</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            The platform makes the whole competency-to-placement lifecycle
            legible — and closes it back into the institution and the
            curriculum.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {LIFECYCLE.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="border-border bg-card rounded-full border px-3 py-1 text-sm">
                  {step}
                </span>
                {i < LIFECYCLE.length - 1 ? (
                  <span className="text-muted-foreground">→</span>
                ) : null}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* audiences */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              t: "Students",
              d: "A competency passport, honest readiness score, a prerequisite-aware roadmap, and matches that come with reasons.",
            },
            {
              t: "Industry",
              d: "Post by competency, not keywords. Rank candidates on evidence-weighted fit and see exactly why A beats B.",
            },
            {
              t: "Academia",
              d: "Department readiness, a skill heatmap drillable to named students, and faculty–industry collaboration pipelines.",
            },
            {
              t: "Institutions & Ministry",
              d: "Systemic skill-gap analytics and industry demand signals — the intelligence layer for workforce planning.",
            },
          ].map((x) => (
            <div
              key={x.t}
              className="border-border bg-card rounded-xl border p-5"
            >
              <div className="font-medium">{x.t}</div>
              <p className="text-muted-foreground mt-1.5 text-sm">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-8">
        <div className="border-border bg-primary text-primary-foreground rounded-2xl border px-6 py-12 text-center">
          <h2 className="text-2xl font-semibold">
            Not another internship portal.
          </h2>
          <p className="text-primary-foreground/80 mx-auto mt-2 max-w-xl">
            An evidence-based competency intelligence layer connecting students,
            academia and industry.
          </p>
          <Button asChild size="lg" variant="accent" className="mt-6">
            <Link href="/demo">Explore the judge demo</Link>
          </Button>
        </div>
      </section>

      <footer className="border-border border-t">
        <div className="text-muted-foreground mx-auto max-w-6xl px-4 py-8 text-xs md:px-8">
          KaushalSetu — prototype for SIH26044. Synthetic demo data only; no
          real or government data is used. ·{" "}
          <Link href="/judge" className="underline">
            Technical showcase
          </Link>
        </div>
      </footer>
    </div>
  );
}
