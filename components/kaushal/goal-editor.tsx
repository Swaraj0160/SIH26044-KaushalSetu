"use client";

import { useState } from "react";

import { setCareerGoalAction } from "@/app/student-actions";
import { cn } from "@/lib/utils";

export interface GoalRoleOption {
  id: string;
  title: string;
  family: string;
}

export function GoalEditor({
  roles,
  currentRoleId,
  currentInterests,
}: {
  roles: GoalRoleOption[];
  currentRoleId: string;
  currentInterests: string[];
}) {
  const [open, setOpen] = useState(false);
  const [roleId, setRoleId] = useState(currentRoleId);
  const [interests, setInterests] = useState<string[]>(
    currentInterests.filter((i) => i !== currentRoleId).slice(0, 3),
  );

  const byFamily = new Map<string, GoalRoleOption[]>();
  for (const r of roles) {
    const arr = byFamily.get(r.family) ?? [];
    arr.push(r);
    byFamily.set(r.family, arr);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="border-border hover:bg-muted inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium"
      >
        Change career goal
      </button>
    );
  }

  return (
    <form
      action={setCareerGoalAction}
      className="border-border bg-card space-y-4 rounded-lg border p-4"
    >
      <div>
        <label htmlFor="goal-role" className="mb-1 block text-sm font-medium">
          Target role
        </label>
        <select
          id="goal-role"
          name="roleId"
          value={roleId}
          onChange={(e) => {
            const v = e.target.value;
            setRoleId(v);
            setInterests((prev) => prev.filter((i) => i !== v));
          }}
          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
        >
          {[...byFamily.entries()].map(([family, opts]) => (
            <optgroup key={family} label={family}>
              {opts.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <p className="text-muted-foreground mt-1 text-xs">
          Readiness, skill gaps, the roadmap and every match recompute from
          this.
        </p>
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium">
          Also interested in{" "}
          <span className="text-muted-foreground font-normal">
            (optional, up to 3)
          </span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {roles
            .filter((r) => r.id !== roleId)
            .map((r) => {
              const on = interests.includes(r.id);
              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() =>
                    setInterests((prev) =>
                      on
                        ? prev.filter((i) => i !== r.id)
                        : prev.length < 3
                          ? [...prev, r.id]
                          : prev,
                    )
                  }
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    on
                      ? "border-primary bg-primary-muted text-primary font-medium"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {r.title}
                </button>
              );
            })}
        </div>
        {interests.map((i) => (
          <input key={i} type="hidden" name="interests" value={i} />
        ))}
      </div>

      <div className="flex gap-2">
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm font-medium">
          Save goal
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border-border hover:bg-muted rounded-md border px-3 py-1.5 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
