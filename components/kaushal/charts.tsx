/** Tiny dependency-free SVG charts. Server-safe. Every chart carries a caption. */

export function BarRows({
  data,
  unit = "",
  caption,
}: {
  data: { label: string; value: number; sub?: string }[];
  unit?: string;
  caption?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div
          key={d.label}
          className="grid grid-cols-[10rem_1fr_auto] items-center gap-3 text-sm"
        >
          <span className="truncate">{d.label}</span>
          <div className="bg-muted h-4 overflow-hidden rounded">
            <div
              className="bg-primary h-full rounded"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="tabular text-muted-foreground">
            {d.value}
            {unit}
            {d.sub ? <span className="ml-1 text-xs">· {d.sub}</span> : null}
          </span>
        </div>
      ))}
      {caption ? (
        <p className="text-muted-foreground pt-1 text-xs">{caption}</p>
      ) : null}
    </div>
  );
}

export function TrendChips({
  items,
  caption,
}: {
  items: { name: string; changePct: number; explanation: string }[];
  caption?: string;
}) {
  return (
    <div className="space-y-1.5">
      {items.map((it) => (
        <details
          key={it.name}
          className="border-border rounded-lg border p-2.5"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm [&::-webkit-details-marker]:hidden">
            <span className="font-medium">{it.name}</span>
            <span
              className={
                it.changePct >= 0
                  ? "tabular text-success"
                  : "tabular text-destructive"
              }
            >
              {it.changePct >= 0 ? "▲" : "▼"} {Math.abs(it.changePct)}%
            </span>
          </summary>
          <p className="text-muted-foreground mt-1 text-xs">{it.explanation}</p>
        </details>
      ))}
      {caption ? (
        <p className="text-muted-foreground pt-1 text-xs">{caption}</p>
      ) : null}
    </div>
  );
}

export function ScatterMini({
  points,
  xLabel,
  yLabel,
  caption,
}: {
  points: { x: number; y: number }[];
  xLabel: string;
  yLabel: string;
  caption?: string;
}) {
  const W = 420;
  const H = 200;
  const pad = 30;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const sx = (x: number) =>
    pad + ((x - xMin) / (xMax - xMin || 1)) * (W - pad * 2);
  const sy = (y: number) =>
    H - pad - ((y - yMin) / (yMax - yMin || 1)) * (H - pad * 2);

  // simple least-squares trend line
  const n = points.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = points.reduce((a, p) => a + p.x * p.y, 0);
  const sumXX = xs.reduce((a, b) => a + b * b, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[420px]">
        <line
          x1={pad}
          y1={H - pad}
          x2={W - pad}
          y2={H - pad}
          stroke="var(--border)"
        />
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="var(--border)" />
        <line
          x1={sx(xMin)}
          y1={sy(slope * xMin + intercept)}
          x2={sx(xMax)}
          y2={sy(slope * xMax + intercept)}
          stroke="var(--primary)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={3}
            fill="var(--chart-2)"
            opacity={0.75}
          />
        ))}
        <text
          x={W / 2}
          y={H - 4}
          textAnchor="middle"
          className="fill-[var(--muted-foreground)] text-[9px]"
        >
          {xLabel}
        </text>
        <text
          x={10}
          y={H / 2}
          textAnchor="middle"
          transform={`rotate(-90 10 ${H / 2})`}
          className="fill-[var(--muted-foreground)] text-[9px]"
        >
          {yLabel}
        </text>
      </svg>
      {caption ? (
        <p className="text-muted-foreground text-xs">{caption}</p>
      ) : null}
    </div>
  );
}
