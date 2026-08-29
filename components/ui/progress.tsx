import * as React from "react";

import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  indicatorClassName,
  ...props
}: React.ComponentProps<"div"> & {
  value: number;
  indicatorClassName?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "bg-muted h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "bg-primary h-full rounded-full transition-[width] duration-500",
          indicatorClassName,
        )}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
