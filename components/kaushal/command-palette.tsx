"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface CommandItem {
  label: string;
  group: string;
  href: string;
  hint?: string;
  keywords?: string;
}

export function CommandPalette({ items }: { items: CommandItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPalette = useCallback(() => {
    setQ("");
    setActive(0);
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => {
          if (!v) {
            setQ("");
            setActive(0);
          }
          return !v;
        });
      } else if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items
      .map((it) => {
        const hay =
          `${it.label} ${it.group} ${it.hint ?? ""} ${it.keywords ?? ""}`.toLowerCase();
        const idx = hay.indexOf(s);
        return idx === -1
          ? null
          : { it, score: idx + (hay.startsWith(s) ? -100 : 0) };
      })
      .filter((x): x is { it: CommandItem; score: number } => Boolean(x))
      .sort((a, b) => a.score - b.score)
      .map((x) => x.it);
  }, [q, items]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  if (!open) {
    return (
      <button
        onClick={openPalette}
        className="border-border bg-card text-muted-foreground hover:bg-muted inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs"
        aria-label="Open command palette"
      >
        <span>Search</span>
        <kbd className="border-border bg-muted rounded border px-1 font-mono text-[0.65rem]">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div
      className="bg-foreground/20 fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="border-border bg-popover w-full max-w-lg overflow-hidden rounded-xl border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && results[active]) {
              e.preventDefault();
              go(results[active].href);
            }
          }}
          placeholder="Jump to a page or action…"
          className="border-border w-full border-b bg-transparent px-4 py-3 text-sm outline-none"
        />
        <div className="max-h-[52vh] overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <div className="text-muted-foreground px-3 py-6 text-center text-sm">
              No matches for “{q}”.
            </div>
          ) : (
            results.map((it, i) => (
              <button
                key={it.href + it.label}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(it.href)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm",
                  i === active
                    ? "bg-primary-muted text-primary"
                    : "hover:bg-muted",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="font-medium">{it.label}</span>
                  {it.hint ? (
                    <span className="text-muted-foreground text-xs">
                      {it.hint}
                    </span>
                  ) : null}
                </span>
                <span className="text-muted-foreground shrink-0 text-[0.65rem] tracking-wide uppercase">
                  {it.group}
                </span>
              </button>
            ))
          )}
        </div>
        <div className="border-border text-muted-foreground border-t px-3 py-1.5 text-[0.65rem]">
          ↑↓ navigate · ↵ open · esc close
        </div>
      </div>
    </div>
  );
}
