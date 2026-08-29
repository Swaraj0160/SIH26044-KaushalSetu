"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Turn {
  role: "user" | "assistant";
  text: string;
  facts?: string[];
  provider?: string;
}

export function CopilotChat({ suggestions }: { suggestions: string[] }) {
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "assistant",
      text: "Ask me about your readiness, gaps, roadmap, or which opportunities fit. Every answer is built from your real engine output — I explain the numbers, I don't invent them.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  async function ask(q: string) {
    if (!q.trim() || busy) return;
    setBusy(true);
    setTurns((t) => [...t, { role: "user", text: q }]);
    setInput("");
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setTurns((t) => [
        ...t,
        {
          role: "assistant",
          text: data.narrative,
          facts: data.facts,
          provider: data.provider,
        },
      ]);
    } catch (e) {
      setTurns((t) => [
        ...t,
        {
          role: "assistant",
          text: e instanceof Error ? e.message : "Something went wrong.",
        },
      ]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() =>
        scroller.current?.scrollTo({ top: 1e6, behavior: "smooth" }),
      );
    }
  }

  return (
    <div className="border-border bg-card flex h-[70vh] flex-col rounded-xl border">
      <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto p-4">
        {turns.map((t, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              t.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                t.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted",
              )}
            >
              <p>{t.text}</p>
              {t.facts?.length ? (
                <div className="border-border/50 text-muted-foreground mt-2 space-y-0.5 border-t pt-2 text-xs">
                  {t.facts.map((f, j) => (
                    <div key={j}>{f}</div>
                  ))}
                </div>
              ) : null}
              {t.provider ? (
                <div className="text-muted-foreground mt-1.5 text-[0.65rem] tracking-wide uppercase">
                  phrased by {t.provider} provider · facts are deterministic
                </div>
              ) : null}
            </div>
          </div>
        ))}
        {busy ? (
          <div className="text-muted-foreground text-sm">Thinking…</div>
        ) : null}
      </div>

      <div className="border-border border-t p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              disabled={busy}
              className="border-border text-muted-foreground hover:bg-muted rounded-full border px-2.5 py-1 text-xs"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your career readiness…"
            className="border-border bg-background focus:border-primary flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
          />
          <Button type="submit" disabled={busy || !input.trim()}>
            Ask
          </Button>
        </form>
      </div>
    </div>
  );
}
