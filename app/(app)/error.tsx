"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="text-3xl">⚠️</div>
      <h1 className="mt-2 text-lg font-semibold">
        Something went wrong on this page
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        The workspace hit an unexpected error. Your session is fine — try again,
        or head back to your home.
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <Button onClick={reset} size="sm">
          Try again
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/">Home</Link>
        </Button>
      </div>
      {error.digest ? (
        <p className="text-muted-foreground mt-3 font-mono text-[0.7rem]">
          ref {error.digest}
        </p>
      ) : null}
    </div>
  );
}
