/**
 * Demo "apply" state.
 *
 * Real applications are pre-seeded in the dataset. When a judge clicks Apply we
 * additionally record the opportunity id in a cookie so the action has a visible,
 * honest effect within the session (no shared mutation, no fake persistence
 * claims). Production writes an `applications` row.
 */

import { cookies } from "next/headers";

const COOKIE = "ks_applied";

export async function appliedOpportunityIds(): Promise<string[]> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v)
      ? v.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export async function recordApplied(opportunityId: string): Promise<void> {
  const jar = await cookies();
  const current = await appliedOpportunityIds();
  if (current.includes(opportunityId)) return;
  jar.set(COOKIE, JSON.stringify([...current, opportunityId]), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}
