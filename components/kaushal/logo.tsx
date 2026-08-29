import { cn } from "@/lib/utils";

/** Bridge-arc mark: two piers (academia / industry) joined by an arc of nodes. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7", className)}
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M3 25c6-13 20-13 26 0"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <rect x="2" y="24" width="4" height="6" rx="1" fill="currentColor" />
      <rect x="26" y="24" width="4" height="6" rx="1" fill="currentColor" />
      <circle cx="16" cy="12.4" r="3" fill="var(--accent)" />
      <circle cx="9.2" cy="17.5" r="1.9" fill="currentColor" />
      <circle cx="22.8" cy="17.5" r="1.9" fill="currentColor" />
    </svg>
  );
}

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span
      className={cn("text-primary inline-flex items-center gap-2", className)}
    >
      <LogoMark />
      {showText ? (
        <span className="text-foreground text-[0.95rem] font-semibold tracking-tight">
          Kaushal<span className="text-primary">Setu</span>
        </span>
      ) : null}
    </span>
  );
}
