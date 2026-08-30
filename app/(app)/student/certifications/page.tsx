import Link from "next/link";

import { deleteCertificationAction } from "@/app/student-actions";
import { CertificationForm } from "@/components/kaushal/entity-forms";
import { JourneyStepper } from "@/components/kaushal/journey-stepper";
import { PageHeader } from "@/components/kaushal/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCertifications, getJourney } from "@/lib/data";
import { getStudentCtx } from "@/lib/data/viewer";
import { getDataset } from "@/lib/demo/dataset";
import { currentStudentId } from "@/lib/guards";

const STATUS: Record<
  string,
  { label: string; variant: "success" | "warning" | "muted" }
> = {
  issuer_verified: { label: "issuer-verified", variant: "success" },
  self_verified: { label: "self-verified", variant: "warning" },
  unverified: { label: "unverified", variant: "muted" },
};

export default async function CertificationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sid = await currentStudentId();
  const sp = await searchParams;
  const ctx = await getStudentCtx(sid);
  const certs = getCertifications(sid, ctx);
  const journey = getJourney(sid, ctx);
  const d = getDataset();
  const isSession = (id: string) => id.startsWith("cert-s");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certifications"
        description="Certificates only matter if they connect to a skill and can be verified. Each one shows the skills it covers and whether that evidence actually counts."
      />
      <JourneyStepper stages={journey} variant="strip" />

      {sp.saved === "1" ? (
        <div className="border-success/40 bg-success/10 text-success rounded-md border px-3 py-2 text-sm">
          ✓ Certification added — linked skills gained certificate-grade
          evidence.
        </div>
      ) : null}
      {sp.removed === "1" ? (
        <div className="border-border bg-muted/50 text-muted-foreground rounded-md border px-3 py-2 text-sm">
          Certification removed.
        </div>
      ) : null}

      <CertificationForm
        skills={d.skills
          .map((s) => ({ id: s.id, name: s.name }))
          .sort((a, b) => a.name.localeCompare(b.name))}
      />

      {certs.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center text-sm">
            No certifications on record yet. Course certificates linked to a
            role skill raise its evidence confidence — see{" "}
            <Link
              href="/student/career?tab=gaps"
              className="text-primary underline"
            >
              your roadmap
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {certs.map((c) => {
            const st = STATUS[c.verificationStatus ?? "unverified"];
            return (
              <div key={c.id} className="border-border rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      {c.issuer} · {c.date}
                      {c.expiry ? ` · expires ${c.expiry}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={st.variant}>{st.label}</Badge>
                    {isSession(c.id) ? (
                      <form action={deleteCertificationAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <button className="text-muted-foreground hover:text-destructive text-xs">
                          remove
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground">Skills covered:</span>
                  {c.skillNames.length ? (
                    c.skillNames.map((s) => (
                      <span
                        key={s}
                        className="bg-muted text-muted-foreground rounded px-1.5 py-0.5"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-destructive">
                      not linked to a skill — low evidence value
                    </span>
                  )}
                  {c.competencyNames.map((cn) => (
                    <span
                      key={cn}
                      className="bg-primary-muted text-primary rounded px-1.5 py-0.5"
                    >
                      {cn}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
