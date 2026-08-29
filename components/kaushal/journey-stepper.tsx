import Link from "next/link";

import type { JourneyStage } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * The journey spine — the recurring "you are here" motif.
 * `variant="full"` on Home; `variant="strip"` at the top of journey/career pages.
 */
export function JourneyStepper({
  stages,
  variant = "full",
  className,
}: {
  stages: JourneyStage[];
  variant?: "full" | "strip";
  className?: string;
}) {
  const currentN =
    stages.find((s) => s.state === "current")?.n ?? stages.length;

  if (variant === "strip") {
    const current =
      stages.find((s) => s.state === "current") ?? stages[stages.length - 1];
    return (
      <div
        className={cn(
          "border-border bg-card flex items-center gap-2 overflow-x-auto rounded-lg border px-3 py-2 text-xs",
          className,
        )}
      >
        <span className="text-muted-foreground shrink-0 font-medium">
          Stage {currentN} of {stages.length}
        </span>
        <span className="text-muted-foreground shrink-0">·</span>
        {stages.map((s) => (
          <Link
            key={s.key}
            href={s.href}
            title={s.detail}
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 transition-colors",
              s.state === "done" && "text-success",
              s.state === "current" &&
                "bg-primary-muted text-primary font-medium",
              s.state === "upcoming" && "text-muted-foreground/60",
            )}
          >
            {s.state === "done" ? "✓ " : ""}
            {s.label.replace("Career readiness", "Readiness")}
          </Link>
        ))}
        <span className="text-muted-foreground shrink-0">
          — {current.label}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-stretch gap-1.5 overflow-x-auto pb-1">
        {stages.map((s, i) => (
          <Link
            key={s.key}
            href={s.href}
            className={cn(
              "group flex min-w-[7.5rem] flex-1 flex-col rounded-lg border p-3 transition-colors",
              s.state === "done" && "border-success/30 bg-success/5",
              s.state === "current" &&
                "border-primary bg-primary-muted/60 ring-primary/20 shadow-sm ring-1",
              s.state === "upcoming" &&
                "border-border bg-card opacity-70 hover:opacity-100",
            )}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full text-[0.7rem] font-semibold",
                  s.state === "done" && "bg-success text-white",
                  s.state === "current" && "bg-primary text-primary-foreground",
                  s.state === "upcoming" &&
                    "border-border text-muted-foreground border",
                )}
              >
                {s.state === "done" ? "✓" : s.n}
              </span>
              <span
                className={cn(
                  "text-xs leading-tight font-medium",
                  s.state === "upcoming" && "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            <span className="text-muted-foreground mt-1 text-[0.7rem] leading-tight">
              {s.detail}
            </span>
            {s.state === "current" ? (
              <span className="text-primary mt-1 text-[0.65rem] font-medium tracking-wide uppercase">
                You are here
              </span>
            ) : null}
            {i < stages.length - 1 ? null : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
