import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { Logo } from "@/components/kaushal/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDataset } from "@/lib/demo/dataset";

export const metadata: Metadata = {
  title: "Verify a credential",
  robots: { index: false },
};

async function goVerify(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "").trim();
  if (id) redirect(`/verify/${encodeURIComponent(id)}`);
}

export default function VerifyLanding() {
  const d = getDataset();
  const samples = [
    d.credentials.find((c) => c.id === "KS-PASSPORT-AARAV"),
    d.credentials.find((c) => c.kind === "internship_certificate"),
    d.credentials.find((c) => c.id === "KS-ASSESS-ANANYA-GMP"),
  ].filter(Boolean);

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
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-xl font-semibold">
          Verify a KaushalSetu credential
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Enter a credential ID (from a Competency Passport, internship
          certificate or assessment badge) to check it against the demo
          registry.
        </p>
        <Card className="mt-6">
          <CardContent className="pt-5">
            <form action={goVerify} className="flex gap-2">
              <input
                name="id"
                placeholder="e.g. KS-PASSPORT-AARAV"
                className="border-border bg-background focus:border-primary flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
              />
              <Button type="submit">Verify</Button>
            </form>
            <div className="text-muted-foreground mt-4 text-xs">
              Sample IDs:
              <div className="mt-1 flex flex-wrap gap-1.5">
                {samples.map((c) => (
                  <Link
                    key={c!.id}
                    href={`/verify/${c!.id}`}
                    className="border-border bg-card hover:bg-muted rounded border px-1.5 py-0.5 font-mono"
                  >
                    {c!.id}
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
