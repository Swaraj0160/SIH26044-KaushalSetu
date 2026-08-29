/**
 * Session-scoped demo overrides.
 *
 * Lets judge actions (verify evidence, advance a collaboration, verify an
 * employer) have a real, visible effect within the session without shared
 * mutation or fake-persistence claims. Production writes real rows.
 *
 * Stored as one JSON cookie: { [key]: string }.
 */

import { cookies } from "next/headers";

const COOKIE = "ks_overrides";

export async function getOverrides(): Promise<Record<string, string>> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" ? (v as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export async function setOverride(key: string, value: string): Promise<void> {
  const jar = await cookies();
  const cur = await getOverrides();
  cur[key] = value;
  jar.set(COOKIE, JSON.stringify(cur), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}
