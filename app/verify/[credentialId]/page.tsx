import Link from "next/link";
import type { Metadata } from "next";

import { Logo } from "@/components/kaushal/logo";
import { Qr } from "@/components/kaushal/qr";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { verifyCredential } from "@/lib/data";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Credential verification",
  robots: { index: false },
};

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ credentialId: string }>;
}) {
  const { credentialId } = await params;
  const result = verifyCredential(credentialId);
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

  return (
    <div className="bg-muted/30 min-h-screen">
      <header className="border-border bg-background border-b">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/">
            <Logo />
          </Link>
          <span className="text-muted-foreground text-xs">
            Public verification
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-10">
        {!result.found ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl">⚠️</div>
              <h1 className="mt-2 text-lg font-semibold">
                Credential not found
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                No credential with id{" "}
                <span className="font-mono">{credentialId}</span> exists in this
                demo registry.
              </p>
              <Link
                href="/verify"
                className="text-primary mt-4 inline-block text-sm underline"
              >
                Try another id
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="border-border bg-success/8 flex items-center justify-between border-b px-5 py-3">
              <span className="text-success flex items-center gap-2 text-sm font-medium">
                ✓ Verified · status {result.credential.status}
              </span>
              <Badge variant="outline">Demo · synthetic</Badge>
            </div>
            <CardContent className="grid gap-6 pt-5 sm:grid-cols-[1fr_auto]">
              <div className="space-y-4 text-sm">
                <Field label="Credential">{result.credential.title}</Field>
                <Field label="Credential ID">
                  <span className="font-mono">{result.credential.id}</span>
                </Field>
                <Field label="Check code">
                  <span className="font-mono">
                    {result.credential.checkCode}
                  </span>
                </Field>
                <Field label="Holder">
                  {result.holder.name} · {result.holder.programme} ·{" "}
                  {result.holder.institution}
                </Field>
                <Field label="Issuer">{result.credential.issuer}</Field>
                <Field label="Issued">{result.credential.issuedAt}</Field>
                <Field label="Competencies attested">
                  <ul className="mt-0.5 space-y-0.5">
                    {result.competencies.map((c) => (
                      <li key={c.id}>
                        {c.name}{" "}
                        <span className="text-muted-foreground">
                          (NSQF ~{c.nsqfBand})
                        </span>
                      </li>
                    ))}
                  </ul>
                </Field>
                <Field label="Evidence summary">
                  <ul className="text-muted-foreground mt-0.5 space-y-0.5">
                    {result.credential.evidenceSummary.map((e, i) => (
                      <li key={i}>• {e}</li>
                    ))}
                  </ul>
                </Field>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Qr text={`${base}/verify/${result.credential.id}`} />
                <span className="text-muted-foreground text-xs">this page</span>
              </div>
            </CardContent>
            <div className="border-border text-muted-foreground border-t px-5 py-3 text-xs">
              This is a prototype verification: a deterministic check code
              against a demo registry. It is <strong>not</strong> a
              cryptographic signature, blockchain record, or government-issued
              proof. Production would issue W3C Verifiable Credentials and emit
              Academic Bank of Credits events.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
