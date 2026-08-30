"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDataset } from "@/lib/demo/dataset";
import {
  addCourse,
  clearPatch,
  recordAssessment,
  removeAchievement,
  removeCertification,
  removeCourse,
  removeProject,
  setGoal,
  SessionStoreFullError,
  upsertAchievement,
  upsertCertification,
  upsertProject,
} from "@/lib/session-store";
import { z } from "@/lib/validation";

export interface FormState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function fail(e: unknown): FormState {
  if (e instanceof SessionStoreFullError) return { error: e.message };
  if (e instanceof z.ZodError)
    return {
      error: "Please check the highlighted fields.",
      fieldErrors: Object.fromEntries(
        e.issues.map((i) => [i.path.join(".") || "_", i.message]),
      ),
    };
  return { error: "Something went wrong. Try again." };
}

const ROLE_IDS = () => new Set(getDataset().roles.map((r) => r.id));
const SKILL_IDS = () => new Set(getDataset().skills.map((s) => s.id));
const COMP_IDS = () => new Set(getDataset().competencies.map((c) => c.id));

// ── career goal ────────────────────────────────────────────────────────────

export async function setCareerGoalAction(formData: FormData): Promise<void> {
  const roleId = String(formData.get("roleId") ?? "");
  if (!ROLE_IDS().has(roleId)) redirect("/student/career?tab=goal&err=role");
  const interests = formData
    .getAll("interests")
    .map(String)
    .filter((i) => ROLE_IDS().has(i) && i !== roleId)
    .slice(0, 3);
  await setGoal(roleId, interests.length ? [roleId, ...interests] : undefined);
  revalidatePath("/student", "layout");
  redirect("/student/career?tab=goal&saved=1");
}

// ── projects ──────────────────────────────────────────────────────────────

const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Give the project a title").max(120),
  type: z.enum([
    "mini",
    "major",
    "personal",
    "academic",
    "industry",
    "open_source",
  ]),
  summary: z.string().min(10, "A sentence or two on what it does").max(400),
  contribution: z.string().max(200).optional().default(""),
  tech: z.string().max(200).optional().default(""),
  period: z.string().max(40).optional().default(""),
  repo: z.string().max(200).optional().default(""),
  demo: z.string().max(200).optional().default(""),
});

export async function saveProjectAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const raw = projectSchema.parse({
      id: formData.get("id") || undefined,
      title: formData.get("title"),
      type: formData.get("type"),
      summary: formData.get("summary"),
      contribution: formData.get("contribution") ?? "",
      tech: formData.get("tech") ?? "",
      period: formData.get("period") ?? "",
      repo: formData.get("repo") ?? "",
      demo: formData.get("demo") ?? "",
    });
    const skillIds = formData
      .getAll("skillIds")
      .map(String)
      .filter((s) => SKILL_IDS().has(s));
    const competencyClaims = formData
      .getAll("competencyClaims")
      .map(String)
      .filter((c) => COMP_IDS().has(c));
    await upsertProject({
      id: raw.id,
      title: raw.title,
      type: raw.type,
      summary: raw.summary,
      contribution: raw.contribution,
      tech: raw.tech
        ? raw.tech
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      skillIds,
      competencyClaims,
      links: { repo: raw.repo || undefined, demo: raw.demo || undefined },
      period: raw.period,
      date: new Date().toISOString().slice(0, 10),
    });
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/student", "layout");
  redirect("/student/projects?saved=1");
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) await removeProject(id);
  revalidatePath("/student", "layout");
  redirect("/student/projects?removed=1");
}

// ── certifications ────────────────────────────────────────────────────────

const certSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Certificate name").max(120),
  issuer: z.string().min(2, "Who issued it").max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  expiry: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
  credentialUrl: z.string().max(200).optional().default(""),
});

export async function saveCertificationAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const raw = certSchema.parse({
      id: formData.get("id") || undefined,
      name: formData.get("name"),
      issuer: formData.get("issuer"),
      date: formData.get("date"),
      expiry: formData.get("expiry") ?? "",
      credentialUrl: formData.get("credentialUrl") ?? "",
    });
    const skillIds = formData
      .getAll("skillIds")
      .map(String)
      .filter((s) => SKILL_IDS().has(s));
    await upsertCertification({
      id: raw.id,
      name: raw.name,
      issuer: raw.issuer,
      date: raw.date,
      expiry: raw.expiry || undefined,
      skillIds,
      competencyClaims: [],
      credentialUrl: raw.credentialUrl || undefined,
    });
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/student", "layout");
  redirect("/student/certifications?saved=1");
}

export async function deleteCertificationAction(
  formData: FormData,
): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) await removeCertification(id);
  revalidatePath("/student", "layout");
  redirect("/student/certifications?removed=1");
}

// ── achievements ─────────────────────────────────────────────────────────

const achSchema = z.object({
  id: z.string().optional(),
  type: z.enum([
    "hackathon",
    "award",
    "competition",
    "publication",
    "research",
    "leadership",
    "extracurricular",
  ]),
  title: z.string().min(3, "Title").max(120),
  organisation: z.string().max(80).optional().default(""),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  description: z.string().max(400).optional().default(""),
});

export async function saveAchievementAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const raw = achSchema.parse({
      id: formData.get("id") || undefined,
      type: formData.get("type"),
      title: formData.get("title"),
      organisation: formData.get("organisation") ?? "",
      date: formData.get("date"),
      description: formData.get("description") ?? "",
    });
    const skillIds = formData
      .getAll("skillIds")
      .map(String)
      .filter((s) => SKILL_IDS().has(s));
    await upsertAchievement({
      id: raw.id,
      type: raw.type,
      title: raw.title,
      organisation: raw.organisation,
      date: raw.date,
      description: raw.description,
      skillIds,
      competencyClaims: [],
    });
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/student", "layout");
  redirect("/student/achievements?saved=1");
}

export async function deleteAchievementAction(
  formData: FormData,
): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) await removeAchievement(id);
  revalidatePath("/student", "layout");
  redirect("/student/achievements?removed=1");
}

// ── courses ──────────────────────────────────────────────────────────────

const courseSchema = z.object({
  code: z.string().min(2).max(16),
  title: z.string().min(3).max(100),
  credits: z.coerce.number().min(1).max(8),
  term: z.string().min(2).max(24),
  grade: z.enum(["O", "A+", "A", "B+", "B", "C", "P"]),
});

export async function saveCourseAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const raw = courseSchema.parse({
      code: formData.get("code"),
      title: formData.get("title"),
      credits: formData.get("credits"),
      term: formData.get("term"),
      grade: formData.get("grade"),
    });
    const skillIds = formData
      .getAll("skillIds")
      .map(String)
      .filter((s) => SKILL_IDS().has(s));
    await addCourse({ ...raw, skillIds });
  } catch (e) {
    return fail(e);
  }
  revalidatePath("/student", "layout");
  redirect("/student/education?saved=1");
}

export async function deleteCourseAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "");
  if (code) await removeCourse(code);
  revalidatePath("/student", "layout");
  redirect("/student/education?removed=1");
}

// ── assessment result ────────────────────────────────────────────────────

export async function recordAssessmentAction(
  formData: FormData,
): Promise<void> {
  const skillId = String(formData.get("skillId") ?? "");
  const score = Number(formData.get("score") ?? 0);
  const level = Number(formData.get("level") ?? 0);
  if (SKILL_IDS().has(skillId) && score >= 0 && level >= 1) {
    await recordAssessment(skillId, score, level);
  }
  revalidatePath("/student", "layout");
}

// ── reset ────────────────────────────────────────────────────────────────

export async function resetSessionEditsAction(): Promise<void> {
  await clearPatch();
  revalidatePath("/student", "layout");
  redirect("/student?reset=1");
}
