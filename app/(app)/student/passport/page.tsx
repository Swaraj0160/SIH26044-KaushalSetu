import Link from "next/link";

import { LogoMark } from "@/components/kaushal/logo";
import { PageHeader } from "@/components/kaushal/page-header";
import {
  BandLabel,
  EvidenceBadge,
  LevelPip,
} from "@/components/kaushal/primitives";
import { Qr } from "@/components/kaushal/qr";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPassport } from "@/lib/data";
import { currentStudentId } from "@/lib/guards";
import { appUrl } from "@/lib/env";

export default async function PassportPage() {
  const sid = await currentStudentId();
  const p = getPassport(sid);
  const base = appUrl();
  const verifyUrl = p.credential
    ? `${base}/verify/${p.credential.id}`
    : `${base}/verify`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competency Passport"
        description="Not a resume. A structured, evidence-backed record of what this person can actually do — verifiable by anyone with the link."
      />

      <Card className="overflow-hidden">
        <div className="border-border bg-primary/5 flex items-center justify-between border-b px-5 py-3">
          <div className="text-primary flex items-center gap-2">
            <LogoMark />
            <span className="text-sm font-semibold">
              KaushalSetu Competency Passport
            </span>
          </div>
          <Badge variant="outline">Demo · synthetic</Badge>
        </div>
        <CardContent className="grid gap-6 pt-5 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <div>
              <div className="text-lg font-semibold">{p.student.name}</div>
              <div className="text-muted-foreground text-sm">
                {p.student.programme} · {p.institutionName} · {p.departmentName}
              </div>
              <div className="text-muted-foreground text-sm">
                Graduating {p.student.graduationYear} · CGPA {p.student.cgpa}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <div className="text-muted-foreground text-xs tracking-wide uppercase">
                  Readiness — {p.dash.targetRole.title}
                </div>
                <div className="flex items-center gap-2">
                  <span className="tabular text-2xl font-semibold">
                    {p.dash.readiness.score}
                  </span>
                  <BandLabel band={p.dash.readiness.band} />
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs tracking-wide uppercase">
                  Evidence confidence
                </div>
                <div className="tabular text-2xl font-semibold">
                  {p.dash.evidenceConfidencePct}%
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Qr text={verifyUrl} />
            <div className="text-muted-foreground text-center text-xs">
              Scan to verify
              {p.credential ? (
                <div className="font-mono">{p.credential.checkCode}</div>
              ) : null}
            </div>
            {p.credential ? (
              <Link
                href={`/verify/${p.credential.id}`}
                className="text-primary text-xs underline"
              >
                Open verification page
              </Link>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Competencies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {p.competencyRows.map((c) => (
            <div key={c.id} className="border-border rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{c.name}</span>
                <span className="text-muted-foreground flex items-center gap-3 text-sm">
                  <span className="tabular">L{c.level}</span>
                  <span>NSQF ~{c.nsqfBand}</span>
                  <span className="tabular">{c.evidence}% evidence</span>
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {c.skills.map((s) => (
                  <span
                    key={s.name}
                    className="border-border bg-muted/40 inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs"
                  >
                    <span
                      className="inline-block size-1.5 rounded-full"
                      style={{
                        background: `var(--confidence-${s.confidence})`,
                      }}
                    />
                    {s.name} · L{s.level}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Verified & high-evidence skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {p.verifiedSkills.length ? (
              p.verifiedSkills.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <LevelPip level={s.level} />
                    {s.name}
                  </span>
                  <EvidenceBadge
                    confidence={s.confidence}
                    rationale={s.rationale}
                  />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No high-evidence skills yet — take assessments and get project
                or mentor verification.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endorsements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {p.endorsements.length ? (
              p.endorsements.map((e, i) => (
                <div
                  key={i}
                  className="border-border rounded-lg border p-3 text-sm"
                >
                  <div className="font-medium">
                    {e.by} · {e.organisation}{" "}
                    <Badge
                      variant={e.role === "industry" ? "success" : "info"}
                      className="ml-1"
                    >
                      {e.role}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground">
                    On{" "}
                    <span className="text-foreground">{e.competencyName}</span>:
                    “{e.note}”
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No endorsements yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {p.projects.length ? (
              p.projects.map((pr) => (
                <div
                  key={pr.id}
                  className="border-border rounded-lg border p-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{pr.title}</span>
                    {pr.facultyVerifiedBy ? (
                      <Badge variant="success">faculty-verified</Badge>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground mt-0.5">{pr.summary}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No projects on record.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {p.certifications.length ? (
              p.certifications.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground">
                    {c.issuer} · {c.date}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No certifications on record.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-muted-foreground text-xs">
        Verification in this prototype is a deterministic check code, not a
        cryptographic or government-issued proof. The architecture is designed
        to emit NCrF / Academic Bank of Credits events in production — see the{" "}
        <Link href="/judge" className="underline">
          technical showcase
        </Link>
        .
      </p>
    </div>
  );
}
