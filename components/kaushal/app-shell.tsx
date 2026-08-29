import Link from "next/link";
import type { ReactNode } from "react";

import { exitDemo } from "@/app/actions";
import { Logo } from "@/components/kaushal/logo";
import { SideNav, type NavItem } from "@/components/kaushal/nav";
import { DemoBanner } from "@/components/kaushal/primitives";
import { Badge } from "@/components/ui/badge";
import type { Persona } from "@/lib/session";

const NAV: Record<Persona["role"], NavItem[]> = {
  student: [
    { href: "/student", label: "Overview", icon: "◆" },
    { href: "/student/passport", label: "Competency Passport", icon: "▣" },
    { href: "/student/skills", label: "Skill Graph & Evidence", icon: "✦" },
    { href: "/student/assessment", label: "Skill Assessment", icon: "✎" },
    { href: "/student/gaps", label: "Skill Gaps & Roadmap", icon: "△" },
    { href: "/student/simulator", label: "Career Simulator", icon: "⇄" },
    { href: "/student/opportunities", label: "Opportunities", icon: "◎" },
    { href: "/student/applications", label: "Applications", icon: "≡" },
    { href: "/student/internship", label: "Internship Workspace", icon: "⌘" },
    { href: "/student/copilot", label: "Career Copilot", icon: "✺" },
  ],
  recruiter: [
    { href: "/recruiter", label: "Overview", icon: "◆" },
    { href: "/recruiter/opportunities", label: "Opportunities", icon: "◎" },
    { href: "/recruiter/talent", label: "Talent Search", icon: "⚲" },
    { href: "/demand", label: "Skill-Demand Intelligence", icon: "📈" },
  ],
  faculty: [
    { href: "/faculty", label: "Overview", icon: "◆" },
    { href: "/faculty/collaborations", label: "Collaborations", icon: "⇌" },
    {
      href: "/faculty/verification",
      label: "Evidence Verification",
      icon: "✓",
    },
  ],
  institution_admin: [
    { href: "/institution", label: "Command Center", icon: "◆" },
    { href: "/institution/heatmap", label: "Skill Heatmap", icon: "▦" },
    { href: "/institution/students", label: "Students", icon: "≡" },
    {
      href: "/institution/placements",
      label: "Placement Intelligence",
      icon: "◷",
    },
    { href: "/demand", label: "Industry Demand", icon: "📈" },
  ],
  super_admin: [
    { href: "/admin", label: "Overview", icon: "◆" },
    { href: "/admin/taxonomy", label: "Skill & Role Taxonomy", icon: "▤" },
    { href: "/admin/employers", label: "Employer Verification", icon: "✓" },
    { href: "/admin/matching", label: "Matching Config", icon: "⚙" },
    { href: "/admin/audit", label: "Audit Log", icon: "❋" },
  ],
};

const ROLE_LABEL: Record<Persona["role"], string> = {
  student: "Student",
  recruiter: "Industry / Recruiter",
  faculty: "Faculty",
  institution_admin: "Institution",
  super_admin: "Administrator",
};

export function AppShell({
  persona,
  children,
}: {
  persona: Persona;
  children: ReactNode;
}) {
  const items = NAV[persona.role];
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <div className="flex flex-1">
        <aside className="border-border bg-card/50 sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r p-3 md:flex">
          <Link href="/" className="mb-4 flex items-center px-1.5 py-1">
            <Logo />
          </Link>
          <div className="border-border bg-card mb-3 rounded-lg border p-2.5">
            <div className="text-muted-foreground text-xs">Signed in as</div>
            <div className="text-sm font-medium">{persona.name}</div>
            <div className="text-muted-foreground mt-0.5 text-xs">
              {persona.subtitle}
            </div>
            <Badge variant="subtle" className="mt-1.5">
              {ROLE_LABEL[persona.role]}
            </Badge>
          </div>
          <SideNav items={items} />
          <div className="mt-auto space-y-1 pt-3">
            <Link
              href="/demo"
              className="text-muted-foreground hover:bg-muted hover:text-foreground block rounded-md px-2.5 py-1.5 text-xs"
            >
              ⟲ Switch persona
            </Link>
            <form action={exitDemo}>
              <button className="text-muted-foreground hover:bg-muted hover:text-foreground w-full rounded-md px-2.5 py-1.5 text-left text-xs">
                ⤶ Exit judge demo
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
              <span className="text-sm font-medium">
                {ROLE_LABEL[persona.role]}
              </span>
            </div>
            <div className="text-muted-foreground hidden text-sm md:block">
              KaushalSetu · {ROLE_LABEL[persona.role]} workspace
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
    </div>
  );
}
