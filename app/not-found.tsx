import Link from "next/link";

import { Logo } from "@/components/kaushal/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Logo />
      <div className="text-muted-foreground/40 text-5xl font-semibold">404</div>
      <h1 className="text-lg font-semibold">This page doesn&apos;t exist</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        The link may be old, or the resource was moved during the redesign.
      </p>
      <div className="flex gap-2">
        <Button asChild size="sm">
          <Link href="/">Landing</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </div>
  );
}
