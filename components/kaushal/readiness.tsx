import { BandLabel } from "@/components/kaushal/primitives";
import { Progress } from "@/components/ui/progress";
import type { ReadinessResult } from "@/lib/engines";

export function ReadinessMeter({ readiness }: { readiness: ReadinessResult }) {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-3">
        <span className="tabular text-4xl font-semibold">
          {readiness.score}
        </span>
        <span className="text-muted-foreground text-sm">/ 100</span>
        <BandLabel band={readiness.band} />
      </div>
      <p className="text-muted-foreground text-sm">{readiness.headline}</p>
      <div className="bg-muted relative h-2.5 w-full overflow-hidden rounded-full">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{
            width: `${readiness.score}%`,
            background:
              "linear-gradient(90deg, var(--chart-2), var(--primary))",
          }}
        />
        {[40, 58, 75].map((t) => (
          <div
            key={t}
            className="bg-background/70 absolute top-0 h-full w-px"
            style={{ left: `${t}%` }}
            title={`Band boundary at ${t}`}
          />
        ))}
      </div>
      <div className="space-y-2">
        {readiness.factors.map((f) => (
          <div key={f.key} className="text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="font-medium">{f.label}</span>
                <span className="text-muted-foreground text-xs">
                  ×{Math.round(f.weight * 100)}%
                </span>
              </span>
              <span className="tabular text-muted-foreground">
                {Math.round(f.value * 100)}%
              </span>
            </div>
            <Progress value={f.value * 100} className="mt-1 h-1.5" />
            <p className="text-muted-foreground mt-0.5 text-xs">{f.detail}</p>
          </div>
        ))}
      </div>
      <p className="bg-muted/50 text-muted-foreground rounded-md p-2 text-xs">
        Deterministic score — weighted sum of the factors above. AI can explain
        it; AI never sets it.
      </p>
    </div>
  );
}
