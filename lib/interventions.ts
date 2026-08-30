/**
 * Session-scoped institutional interventions (demo build).
 *
 * The heatmap recommends an action for a critical department × skill cell.
 * Recording it here makes "insight → action → outcome" a real, trackable loop
 * for the length of the session (stored in one cookie). Production writes rows
 * and runs the "did the gap move?" check against real term-over-term data.
 */

import "server-only";

import { cookies } from "next/headers";

const COOKIE = "ks_interventions";

export type InterventionStatus = "planned" | "active" | "completed";

export interface Intervention {
  id: string;
  institutionId: string;
  departmentId: string;
  departmentName: string;
  skillId: string;
  skillName: string;
  title: string;
  action: string;
  owner: string;
  cohortSize: number;
  expectedImpact: string;
  status: InterventionStatus;
  createdAt: string;
  /** demo: a synthetic "then vs now" once completed */
  outcome?: string;
}

export async function getInterventions(
  institutionId?: string,
): Promise<Intervention[]> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return [];
  try {
    const json = Buffer.from(raw, "base64").toString("utf8");
    const all = JSON.parse(json);
    const list: Intervention[] = Array.isArray(all) ? all : [];
    return institutionId
      ? list.filter((i) => i.institutionId === institutionId)
      : list;
  } catch {
    return [];
  }
}

async function writeAll(list: Intervention[]): Promise<void> {
  const value = Buffer.from(JSON.stringify(list.slice(0, 20)), "utf8").toString(
    "base64",
  );
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function addIntervention(
  i: Omit<Intervention, "id" | "status" | "createdAt">,
): Promise<string> {
  const list = await getInterventions();
  const id = `intv-${Date.now().toString(36)}`;
  list.unshift({
    ...i,
    id,
    status: "planned",
    createdAt: new Date().toISOString().slice(0, 10),
  });
  await writeAll(list);
  return id;
}

const NEXT: Record<InterventionStatus, InterventionStatus | null> = {
  planned: "active",
  active: "completed",
  completed: null,
};

export async function advanceIntervention(id: string): Promise<void> {
  const list = await getInterventions();
  const it = list.find((x) => x.id === id);
  if (!it) return;
  const next = NEXT[it.status];
  if (!next) return;
  it.status = next;
  if (next === "completed") {
    it.outcome = `Cohort re-checked: ${it.skillName} mean level up ~0.6 and evidence coverage +${Math.round(8 + it.cohortSize / 20)}% (synthetic term-over-term).`;
  }
  await writeAll(list);
}

export async function removeIntervention(id: string): Promise<void> {
  const list = await getInterventions();
  await writeAll(list.filter((x) => x.id !== id));
}
