"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import { recordAssessmentAction } from "@/app/student-actions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LEVEL_LABEL } from "@/lib/engines/config";
import type { Difficulty, Question } from "@/lib/demo/assessment-bank";
import { cn } from "@/lib/utils";

const DIFF_WEIGHT: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.6,
  hard: 2.4,
};
const NEXT_ON_CORRECT: Record<Difficulty, Difficulty> = {
  easy: "medium",
  medium: "hard",
  hard: "hard",
};
const NEXT_ON_WRONG: Record<Difficulty, Difficulty> = {
  hard: "medium",
  medium: "easy",
  easy: "easy",
};

interface Answered {
  q: Question;
  correct: boolean;
}

export function AdaptiveAssessment({
  skillId,
  skillName,
  questions,
  priorLevel,
}: {
  skillId: string;
  skillName: string;
  questions: Question[];
  priorLevel?: number;
}) {
  const [saved, setSaved] = useState(false);
  const byDiff = useMemo(() => {
    const m: Record<Difficulty, Question[]> = {
      easy: [],
      medium: [],
      hard: [],
    };
    for (const q of questions) m[q.difficulty].push(q);
    return m;
  }, [questions]);

  const total = Math.min(6, questions.length);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [asked, setAsked] = useState<string[]>([]);
  const [answered, setAnswered] = useState<Answered[]>([]);
  const [current, setCurrent] = useState<Question | null>(() =>
    pick("medium", [], byDiff),
  );
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [confidence, setConfidence] = useState(3);

  function pickNext(nextDiff: Difficulty, askedIds: string[]): Question | null {
    for (const dd of [nextDiff, "medium", "easy", "hard"] as Difficulty[]) {
      const q = byDiff[dd].find((x) => !askedIds.includes(x.id));
      if (q) return q;
    }
    return null;
  }

  function submit() {
    if (current == null || choice == null) return;
    setRevealed(true);
  }

  function next() {
    if (!current) return;
    const correct = choice === current.answer;
    const nextAnswered = [...answered, { q: current, correct }];
    const nextAsked = [...asked, current.id];
    setAnswered(nextAnswered);
    setAsked(nextAsked);
    setRevealed(false);
    setChoice(null);

    if (nextAnswered.length >= total) {
      setCurrent(null);
      return;
    }
    const nd = correct
      ? NEXT_ON_CORRECT[difficulty]
      : NEXT_ON_WRONG[difficulty];
    setDifficulty(nd);
    setCurrent(pickNext(nd, nextAsked));
  }

  const done =
    answered.length >= total || (current == null && answered.length > 0);

  if (done) {
    const gained = answered.reduce(
      (s, a) => s + (a.correct ? DIFF_WEIGHT[a.q.difficulty] : 0),
      0,
    );
    const possible = answered.reduce(
      (s, a) => s + DIFF_WEIGHT[a.q.difficulty],
      0,
    );
    const raw = possible ? gained / possible : 0;
    // confidence calibration: overconfidence (high self-rating, low score) is penalised slightly
    const calib = 1 - Math.max(0, (confidence / 5 - raw) * 0.25);
    const score = Math.round(raw * calib * 100);
    const level = Math.max(
      1,
      Math.min(
        8,
        Math.round(
          1 +
            (score / 100) * 6 +
            (answered.some((a) => a.correct && a.q.difficulty === "hard")
              ? 1
              : 0),
        ),
      ),
    );
    const weak = [
      ...new Set(answered.filter((a) => !a.correct).map((a) => a.q.topic)),
    ];
    return (
      <div className="space-y-4">
        <div className="border-border bg-card rounded-xl border p-5">
          <div className="text-muted-foreground text-sm">
            Result — {skillName}
          </div>
          <div className="mt-1 flex items-end gap-3">
            <span className="tabular text-4xl font-semibold">{score}</span>
            <span className="text-muted-foreground text-sm">/ 100</span>
            <span className="bg-primary-muted text-primary rounded-full px-2 py-0.5 text-sm">
              Level {level} · {LEVEL_LABEL[level as 1]}
            </span>
          </div>
          {priorLevel != null ? (
            <p className="text-muted-foreground mt-1 text-xs">
              Self-rated before: L{priorLevel} · confidence stated: {confidence}
              /5
            </p>
          ) : null}
          <div className="mt-4 space-y-2 text-sm">
            {answered.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className={a.correct ? "text-success" : "text-destructive"}
                >
                  {a.correct ? "✓" : "✗"}
                </span>
                <span className="text-muted-foreground">
                  [{a.q.difficulty}] {a.q.topic}
                </span>
              </div>
            ))}
          </div>
          {weak.length ? (
            <div className="bg-destructive/8 mt-4 rounded-md p-3 text-sm">
              <div className="text-destructive font-medium">
                Weak areas → target these
              </div>
              <div className="text-muted-foreground">{weak.join(", ")}</div>
            </div>
          ) : (
            <div className="bg-success/8 text-success mt-4 rounded-md p-3 text-sm">
              Strong across all tested areas.
            </div>
          )}
          <div className="border-border mt-4 border-t pt-3">
            {saved ? (
              <p className="text-success text-sm">
                ✓ Saved to your record as an <strong>assessment</strong> item —
                {skillName}&apos;s evidence confidence and every dependent match
                have recomputed.{" "}
                <Link href="/student/skills" className="underline">
                  View your skills →
                </Link>
              </p>
            ) : (
              <form
                action={recordAssessmentAction}
                onSubmit={() => setSaved(true)}
              >
                <input type="hidden" name="skillId" value={skillId} />
                <input type="hidden" name="score" value={score} />
                <input type="hidden" name="level" value={level} />
                <Button type="submit">Save this result to my record</Button>
                <span className="text-muted-foreground ml-2 text-xs">
                  writes an assessment evidence item for {skillName}
                </span>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <p className="text-muted-foreground text-sm">
        Not enough questions available for {skillName} in the demo bank.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <span>
          Question {answered.length + 1} of {total} · adaptive difficulty:{" "}
          <span className="text-foreground font-medium capitalize">
            {current.difficulty}
          </span>
        </span>
        <span>{skillName}</span>
      </div>
      <Progress value={(answered.length / total) * 100} className="h-1.5" />

      <div className="border-border bg-card rounded-xl border p-5">
        {current.kind === "scenario" ? (
          <div className="text-accent-foreground mb-1 text-xs font-medium tracking-wide uppercase">
            Scenario
          </div>
        ) : null}
        <p className="font-medium">{current.prompt}</p>
        <div className="mt-3 space-y-2">
          {current.options.map((opt, i) => {
            const isChoice = choice === i;
            const isAnswer = current.answer === i;
            return (
              <button
                key={i}
                disabled={revealed}
                onClick={() => setChoice(i)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  revealed && isAnswer && "border-success bg-success/10",
                  revealed &&
                    isChoice &&
                    !isAnswer &&
                    "border-destructive bg-destructive/10",
                  !revealed && isChoice && "border-primary bg-primary-muted",
                  !revealed && !isChoice && "hover:bg-muted",
                )}
              >
                <span className="grid size-5 shrink-0 place-items-center rounded-full border border-current text-[0.7rem]">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
        {revealed ? (
          <p className="bg-muted/50 text-muted-foreground mt-3 rounded-md p-2 text-sm">
            {choice === current.answer ? "Correct. " : "Not quite. "}
            {current.rationale}
          </p>
        ) : null}
      </div>

      {answered.length === 0 && !revealed ? (
        <div className="border-border rounded-lg border p-3 text-sm">
          <label className="text-muted-foreground">
            Before you start — confidence applying {skillName} unsupervised:
          </label>
          <input
            type="range"
            min={1}
            max={5}
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="mt-1 w-full accent-[var(--primary)]"
          />
          <div className="text-muted-foreground text-xs">{confidence}/5</div>
        </div>
      ) : null}

      <div className="flex justify-end gap-2">
        {!revealed ? (
          <Button onClick={submit} disabled={choice == null}>
            Submit
          </Button>
        ) : (
          <Button onClick={next}>
            {answered.length + 1 >= total ? "See result" : "Next question"}
          </Button>
        )}
      </div>
    </div>
  );
}

function pick(
  d: Difficulty,
  asked: string[],
  byDiff: Record<Difficulty, Question[]>,
): Question | null {
  for (const dd of [d, "medium", "easy", "hard"] as Difficulty[]) {
    const q = byDiff[dd].find((x) => !asked.includes(x.id));
    if (q) return q;
  }
  return null;
}
