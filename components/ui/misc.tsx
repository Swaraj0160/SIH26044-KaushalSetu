import * as React from "react";

import { cn } from "@/lib/utils";

export function Separator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-border h-px w-full", className)}
      role="separator"
      {...props}
    />
  );
}

export function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "border-border bg-muted text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-[0.7rem]",
        className,
      )}
      {...props}
    />
  );
}

/** Small labelled statistic. */
export function Stat({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </div>
      <div className="tabular text-2xl font-semibold">{value}</div>
      {hint ? (
        <div className="text-muted-foreground text-xs">{hint}</div>
      ) : null}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? (
          <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
