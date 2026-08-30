"use client";

import { useActionState, useState } from "react";

import {
  saveAchievementAction,
  saveCertificationAction,
  saveCourseAction,
  saveProjectAction,
  type FormState,
} from "@/app/student-actions";
import { cn } from "@/lib/utils";

export interface Option {
  id: string;
  name: string;
}

function Disclosure({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="border-primary/40 text-primary hover:bg-primary-muted inline-flex items-center gap-1.5 rounded-md border border-dashed px-3 py-1.5 text-sm font-medium"
      >
        + {label}
      </button>
    );
  return (
    <div className="border-border bg-card rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{label}</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          cancel
        </button>
      </div>
      {children}
    </div>
  );
}

function Err({ state, field }: { state: FormState; field?: string }) {
  const msg = field ? state.fieldErrors?.[field] : state.error;
  if (!msg) return null;
  return <p className="text-destructive mt-1 text-xs">{msg}</p>;
}

function TextField({
  name,
  label,
  required,
  placeholder,
  type = "text",
  defaultValue,
  state,
}: {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  defaultValue?: string;
  state: FormState;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="border-input bg-background w-full rounded-md border px-2.5 py-1.5 text-sm"
      />
      <Err state={state} field={name} />
    </label>
  );
}

function SkillPicker({
  options,
  name = "skillIds",
  label = "Skills this evidences",
}: {
  options: Option[];
  name?: string;
  label?: string;
}) {
  const [sel, setSel] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const shown = q
    ? options.filter((o) => o.name.toLowerCase().includes(q.toLowerCase()))
    : options.slice(0, 24);
  return (
    <div>
      <span className="mb-1 block text-xs font-medium">{label}</span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="filter skills…"
        className="border-input bg-background mb-2 w-full rounded-md border px-2.5 py-1 text-xs"
      />
      <div className="max-h-36 overflow-y-auto rounded-md border p-1.5">
        <div className="flex flex-wrap gap-1">
          {shown.map((o) => {
            const on = sel.includes(o.id);
            return (
              <button
                type="button"
                key={o.id}
                onClick={() =>
                  setSel((p) =>
                    on ? p.filter((x) => x !== o.id) : [...p, o.id],
                  )
                }
                className={cn(
                  "rounded-full border px-2 py-0.5 text-xs",
                  on
                    ? "border-primary bg-primary-muted text-primary font-medium"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {o.name}
              </button>
            );
          })}
        </div>
      </div>
      {sel.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
      <p className="text-muted-foreground mt-1 text-xs">
        {sel.length} selected — each adds evidence to that skill and recomputes
        your readiness.
      </p>
    </div>
  );
}

function Submit({ label }: { label: string }) {
  return (
    <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm font-medium">
      {label}
    </button>
  );
}

// ── Project ───────────────────────────────────────────────────────────────

export function ProjectForm({ skills }: { skills: Option[] }) {
  const [state, action] = useActionState<FormState, FormData>(
    saveProjectAction,
    {},
  );
  return (
    <Disclosure label="Add a project">
      <form action={action} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            name="title"
            label="Title"
            required
            placeholder="Movie-review sentiment classifier"
            state={state}
          />
          <label className="block">
            <span className="mb-1 block text-xs font-medium">Type</span>
            <select
              name="type"
              defaultValue="mini"
              className="border-input bg-background w-full rounded-md border px-2.5 py-1.5 text-sm"
            >
              <option value="mini">Mini project</option>
              <option value="major">Major / final-year</option>
              <option value="academic">Academic</option>
              <option value="personal">Personal</option>
              <option value="industry">Industry</option>
              <option value="open_source">Open source</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">
            Summary <span className="text-destructive">*</span>
          </span>
          <textarea
            name="summary"
            required
            rows={2}
            placeholder="What it does and how you built it."
            className="border-input bg-background w-full rounded-md border px-2.5 py-1.5 text-sm"
          />
          <Err state={state} field="summary" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            name="contribution"
            label="Your contribution"
            placeholder="Led modelling and evaluation"
            state={state}
          />
          <TextField
            name="period"
            label="Period"
            placeholder="Feb–Apr 2025"
            state={state}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            name="tech"
            label="Tech (comma-separated)"
            placeholder="Python, PyTorch, FastAPI"
            state={state}
          />
          <TextField
            name="repo"
            label="Repository URL"
            placeholder="https://github.com/…"
            state={state}
          />
        </div>
        <SkillPicker options={skills} />
        <Err state={state} />
        <Submit label="Save project" />
      </form>
    </Disclosure>
  );
}

// ── Certification ─────────────────────────────────────────────────────────

export function CertificationForm({ skills }: { skills: Option[] }) {
  const [state, action] = useActionState<FormState, FormData>(
    saveCertificationAction,
    {},
  );
  return (
    <Disclosure label="Add a certification">
      <form action={action} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            name="name"
            label="Certificate"
            required
            placeholder="Deep Learning Specialization"
            state={state}
          />
          <TextField
            name="issuer"
            label="Issuer"
            required
            placeholder="DeepLearning.AI"
            state={state}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            name="date"
            label="Issued"
            required
            type="date"
            state={state}
          />
          <TextField
            name="credentialUrl"
            label="Credential URL"
            placeholder="https://…"
            state={state}
          />
        </div>
        <SkillPicker options={skills} label="Skills this certifies" />
        <Err state={state} />
        <Submit label="Save certification" />
      </form>
    </Disclosure>
  );
}

// ── Achievement ──────────────────────────────────────────────────────────

export function AchievementForm({ skills }: { skills: Option[] }) {
  const [state, action] = useActionState<FormState, FormData>(
    saveAchievementAction,
    {},
  );
  return (
    <Disclosure label="Add an achievement">
      <form action={action} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium">Type</span>
            <select
              name="type"
              defaultValue="hackathon"
              className="border-input bg-background w-full rounded-md border px-2.5 py-1.5 text-sm"
            >
              {[
                "hackathon",
                "award",
                "competition",
                "publication",
                "research",
                "leadership",
                "extracurricular",
              ].map((t) => (
                <option key={t} value={t}>
                  {t[0].toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <TextField
            name="date"
            label="Date"
            required
            type="date"
            state={state}
          />
        </div>
        <TextField
          name="title"
          label="Title"
          required
          placeholder="Winner — Smart India Hackathon"
          state={state}
        />
        <TextField
          name="organisation"
          label="Organisation"
          placeholder="AICTE / MoE"
          state={state}
        />
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Description</span>
          <textarea
            name="description"
            rows={2}
            className="border-input bg-background w-full rounded-md border px-2.5 py-1.5 text-sm"
          />
          <Err state={state} field="description" />
        </label>
        <SkillPicker options={skills} label="Skills this demonstrates" />
        <Err state={state} />
        <Submit label="Save achievement" />
      </form>
    </Disclosure>
  );
}

// ── Course ───────────────────────────────────────────────────────────────

export function CourseForm({ skills }: { skills: Option[] }) {
  const [state, action] = useActionState<FormState, FormData>(
    saveCourseAction,
    {},
  );
  return (
    <Disclosure label="Add a course">
      <form action={action} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            name="code"
            label="Code"
            required
            placeholder="CS305"
            state={state}
          />
          <TextField
            name="title"
            label="Title"
            required
            placeholder="Machine Learning"
            state={state}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextField
            name="term"
            label="Term"
            required
            placeholder="Sem 5 · 2025"
            state={state}
          />
          <TextField
            name="credits"
            label="Credits"
            required
            type="number"
            defaultValue="3"
            state={state}
          />
          <label className="block">
            <span className="mb-1 block text-xs font-medium">Grade</span>
            <select
              name="grade"
              defaultValue="A"
              className="border-input bg-background w-full rounded-md border px-2.5 py-1.5 text-sm"
            >
              {["O", "A+", "A", "B+", "B", "C", "P"].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
        </div>
        <SkillPicker options={skills} label="Skills this course develops" />
        <Err state={state} />
        <Submit label="Save course" />
      </form>
    </Disclosure>
  );
}
