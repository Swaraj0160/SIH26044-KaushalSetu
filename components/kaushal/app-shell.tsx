import Link from "next/link";
import type { ReactNode } from "react";

import { signOut } from "@/app/actions";
import { Logo } from "@/components/kaushal/logo";
import { GroupedNav, type NavGroup } from "@/components/kaushal/nav";
import { DemoBanner } from "@/components/kaushal/primitives";
import { Badge } from "@/components/ui/badge";
import type { Persona } from "@/lib/auth/personas";

const NAV: Record<Persona["role"], NavGroup[]> = {
  student: [
    { label: null, items: [{ href: "/student", label: "Home", icon: "◆" }] },
    {
      label: "My Journey",
      items: [
        { href: "/student/education", label: "Education", icon: "▤" },
        { href: "/student/skills", label: "Skills & Evidence", icon: "✦" },
        { href: "/student/projects", label: "Projects", icon: "■" },
        { href: "/student/internship", label: "Internship", icon: "▲" },
      ],
    },
    {
      label: "Career",
      items: [
        { href: "/student/career", label: "Goal & Readiness", icon: "◎" },
        { href: "/student/gaps", label: "Skill Gaps & Roadmap", icon: "△" },
        { href: "/student/simulator", label: "Explore Roles", icon: "⇄" },
        { href: "/student/opportunities", label: "Opportunities", icon: "◍" },
        { href: "/student/applications", label: "Applications", icon: "≡" },
      ],
    },
    {
      label: "My Profile",
      items: [
        { href: "/student/profile", label: "Competency Profile", icon: "✺" },
        { href: "/student/passport", label: "Passport", icon: "▣" },
      ],
    },
  ],
  recruiter: [
    { label: null, items: [{ href: "/industry", label: "Home", icon: "◆" }] },
    {
      label: "Hiring",
      items: [
        {
          href: "/recruiter/opportunities",
          label: "Roles & Candidates",
          icon: "◍",
        },
        { href: "/recruiter/talent", label: "Talent Search", icon: "⚲" },
      ],
    },
    {
      label: "Market",
      items: [{ href: "/demand", label: "Skill-Demand Signals", icon: "📈" }],
    },
  ],
  faculty: [
    { label: null, items: [{ href: "/faculty", label: "Home", icon: "◆" }] },
    {
      label: "Develop & Connect",
      items: [
        { href: "/faculty/verification", label: "Verify Evidence", icon: "✓" },
        { href: "/faculty/collaborations", label: "Collaborations", icon: "⇌" },
      ],
    },
  ],
  institution_admin: [
    {
      label: null,
      items: [{ href: "/institution", label: "Command Center", icon: "◆" }],
    },
    {
      label: "Understand & Improve",
      items: [
        { href: "/institution/heatmap", label: "Skill Heatmap", icon: "▦" },
        { href: "/institution/students", label: "Cohorts", icon: "≡" },
        {
          href: "/institution/placements",
          label: "Placement Intelligence",
          icon: "◷",
        },
        { href: "/demand", label: "Industry Demand", icon: "📈" },
      ],
    },
  ],
  super_admin: [
    { label: null, items: [{ href: "/admin", label: "Overview", icon: "◆" }] },
    {
      label: "Govern",
      items: [
        { href: "/admin/taxonomy", label: "Skill & Role Taxonomy", icon: "▤" },
        { href: "/admin/employers", label: "Employer Verification", icon: "✓" },
        { href: "/admin/matching", label: "Matching Config", icon: "⚙" },
        { href: "/admin/audit", label: "Audit Log", icon: "❋" },
      ],
    },
  ],
};

const ROLE: Record<Persona["role"], { label: string; job: string }> = {
  student: { label: "Student", job: "Build my career" },
  recruiter: { label: "Industry", job: "Find & develop talent" },
  faculty: { label: "Faculty", job: "Verify & connect" },
  institution_admin: {
    label: "Institution",
    job: "Understand & improve readiness",
  },
  super_admin: { label: "Administrator", job: "Govern the ecosystem" },
};

export function AppShell({
  persona,
  children,
}: {
  persona: Persona;
  children: ReactNode;
}) {
  const groups = NAV[persona.role];
  const role = ROLE[persona.role];

  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <div className="flex flex-1">
        <aside className="border-border bg-card/50 sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r p-3 md:flex">
          <Link href="/" className="mb-4 flex items-center px-1.5 py-1">
            <Logo />
          </Link>
          <div className="border-border bg-card mb-4 rounded-lg border p-2.5">
            <div className="text-muted-foreground text-xs">Signed in as</div>
            <div className="text-sm font-medium">{persona.name}</div>
            <div className="text-muted-foreground mt-0.5 text-xs">
              {persona.subtitle}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <Badge variant="subtle">{role.label}</Badge>
              <span className="text-muted-foreground text-[0.7rem]">
                · {role.job}
              </span>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <GroupedNav groups={groups} />
          </div>
          <div className="space-y-1 pt-3">
            <Link
              href="/demo"
              className="text-muted-foreground hover:bg-muted hover:text-foreground block rounded-md px-2.5 py-1.5 text-xs"
            >
              ⟲ Switch role
            </Link>
            <form action={signOut}>
              <button className="text-muted-foreground hover:bg-muted hover:text-foreground w-full rounded-md px-2.5 py-1.5 text-left text-xs">
                ⤶ Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-border bg-background/85 sticky top-0 z-10 flex items-center justify-between gap-3 border-b px-4 py-2.5 backdrop-blur md:px-8">
            <div className="flex items-center gap-3 md:hidden">
              <Link href="/">
                <Logo showText={false} />
              </Link>
              <span className="text-sm font-medium">{role.label}</span>
            </div>
            <div className="text-muted-foreground hidden text-sm md:block">
              KaushalSetu · {role.label} — {role.job.toLowerCase()}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/judge"
                className="border-border hover:bg-muted rounded-md border px-2.5 py-1 text-xs"
              >
                Judge mode
              </Link>
              <Link
                href="/demo"
                className="border-border hover:bg-muted rounded-md border px-2.5 py-1 text-xs md:hidden"
              >
                Switch
              </Link>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
            {children}
          </main>
        </div>
      </div>

      {/* mobile bottom nav */}
      <MobileNav role={persona.role} />
    </div>
  );
}

function MobileNav({ role }: { role: Persona["role"] }) {
  const items =
    role === "student"
      ? [
          { href: "/student", label: "Home", icon: "◆" },
          { href: "/student/education", label: "Journey", icon: "▤" },
          { href: "/student/career", label: "Career", icon: "◎" },
          { href: "/student/profile", label: "Profile", icon: "✺" },
        ]
      : NAV[role].flatMap((g) => g.items).slice(0, 4);
  return (
    <nav className="border-border bg-background/95 fixed inset-x-0 bottom-0 z-20 flex border-t backdrop-blur md:hidden">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className="text-muted-foreground flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.65rem]"
        >
          <span className="text-sm">{it.icon}</span>
          {it.label}
        </Link>
      ))}
    </nav>
  );
}
