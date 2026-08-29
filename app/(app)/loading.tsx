export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="bg-muted h-6 w-56 animate-pulse rounded" />
        <div className="bg-muted/70 h-4 w-96 max-w-full animate-pulse rounded" />
      </div>
      <div className="border-border bg-muted/40 h-24 animate-pulse rounded-xl border" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border-border bg-muted/40 h-28 animate-pulse rounded-xl border"
          />
        ))}
      </div>
    </div>
  );
}
