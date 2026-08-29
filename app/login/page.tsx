import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { signInAs } from "@/app/actions";
import { LogoMark } from "@/components/kaushal/logo";
import { LoginForm } from "@/components/kaushal/login-form";
import { DEMO_LOGINS } from "@/lib/auth/demo-provider";
import { getPersona } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in · KaushalSetu",
  description: "Sign in to the KaushalSetu competency-intelligence platform.",
};

const ROLE_BLURB: Record<string, string> = {
  Student: "Build my career — journey, evidence, readiness, opportunities.",
  Industry: "Find the right talent — evidence-weighted, explainable ranking.",
  Faculty: "Verify student evidence and connect them to industry.",
  Institution: "Understand and improve workforce readiness.",
  Admin: "Govern the ecosystem — taxonomy, verification, audit.",
};

export default async function LoginPage() {
  if (await getPersona()) redirect("/student"); // already signed in → route guard will re-home

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* left — brand / statement */}
      <div className="bg-primary text-primary-foreground relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <div className="grid-bg radial-fade absolute inset-0 opacity-20" />
        <Link
          href="/"
          className="text-primary-foreground relative z-10 flex items-center gap-2"
        >
          <LogoMark className="text-primary-foreground [&_circle:nth-child(3)]:fill-[var(--accent)]" />
          <span className="text-[0.95rem] font-semibold tracking-tight">
            KaushalSetu
          </span>
        </Link>
        <div className="relative z-10 max-w-md">
          <h1 className="text-3xl leading-tight font-semibold">
            From skills to opportunities — with evidence.
          </h1>
          <p className="text-primary-foreground/80 mt-4">
            One continuous journey: education creates skills, skills earn
            evidence, evidence becomes verified competency, competency drives
            your career. Not a portal with many features.
          </p>
          <div className="text-primary-foreground/70 mt-8 flex flex-wrap gap-2 text-xs">
            {[
              "Education",
              "Skills",
              "Evidence",
              "Experience",
              "Readiness",
              "Placement",
            ].map((s, i, arr) => (
              <span key={s} className="flex items-center gap-2">
                <span className="border-primary-foreground/25 rounded-full border px-2 py-0.5">
                  {s}
                </span>
                {i < arr.length - 1 ? <span>→</span> : null}
              </span>
            ))}
          </div>
        </div>
        <p className="text-primary-foreground/60 relative z-10 text-xs">
          SIH26044 · Ministry of Ayush · prototype
        </p>
      </div>

      {/* right — sign in */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="text-primary mb-6 inline-flex items-center gap-2 lg:hidden"
          >
            <LogoMark />
            <span className="text-foreground text-sm font-semibold">
              KaushalSetu
            </span>
          </Link>

          <div className="border-accent/40 bg-accent-muted/60 text-accent-foreground mb-1 inline-flex rounded-full border px-2 py-0.5 text-xs">
            Demo environment
          </div>
          <h2 className="text-2xl font-semibold">Sign in</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Use a demo account below, or sign in manually.
          </p>

          <div className="mt-6">
            <LoginForm />
          </div>

          <div className="text-muted-foreground my-6 flex items-center gap-3 text-xs">
            <span className="bg-border h-px flex-1" />
            or continue as a demo role
            <span className="bg-border h-px flex-1" />
          </div>

          <div className="space-y-2">
            {DEMO_LOGINS.map((d) => (
              <form key={d.username} action={signInAs}>
                <input type="hidden" name="persona" value={d.personaKey} />
                <button className="border-border bg-card hover:border-primary/50 hover:bg-muted flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors">
                  <span>
                    <span className="font-medium">Continue as {d.label}</span>
                    <span className="text-muted-foreground block text-xs">
                      {ROLE_BLURB[d.label]}
                    </span>
                  </span>
                  <span className="text-primary">→</span>
                </button>
              </form>
            ))}
          </div>

          <details className="border-border bg-muted/40 text-muted-foreground mt-6 rounded-lg border p-3 text-xs">
            <summary className="text-foreground cursor-pointer font-medium">
              Demo credentials
            </summary>
            <table className="mt-2 w-full">
              <tbody>
                {[
                  ["student", "student123"],
                  ["industry", "industry123"],
                  ["faculty", "faculty123"],
                  ["institution", "institution123"],
                  ["admin", "admin123"],
                ].map(([u, p]) => (
                  <tr key={u}>
                    <td className="py-0.5 font-mono">{u}</td>
                    <td className="py-0.5 font-mono">{p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2">
              Demo only — not production credentials. Passwords are checked
              server-side. Judges can also use the{" "}
              <Link href="/demo" className="text-primary underline">
                narrative persona picker
              </Link>
              .
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
