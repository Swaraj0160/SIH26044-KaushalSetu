/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";

import {
  getEducation,
  getJourney,
  getNextActions,
  getStudentHome,
  getStudentProjects,
} from "@/lib/data";
import { demoAuth } from "@/lib/auth/demo-provider";

describe("demo auth", () => {
  it("accepts the fixed demo credentials and rejects bad ones", async () => {
    const ok = await demoAuth.signIn("student", "student123");
    expect(ok?.role).toBe("student");
    expect(ok?.refId).toBe("stu-aarav");
    expect(await demoAuth.signIn("student", "wrong")).toBeNull();
    expect(await demoAuth.signIn("nobody", "x")).toBeNull();
  });
  it("maps each role to its own persona", async () => {
    const roles = await Promise.all(
      ["student", "industry", "faculty", "institution", "admin"].map((u) =>
        demoAuth.signIn(u, `${u}123`),
      ),
    );
    expect(roles.map((r) => r?.role)).toEqual([
      "student",
      "recruiter",
      "faculty",
      "institution_admin",
      "super_admin",
    ]);
  });
  it("round-trips a session token", async () => {
    const u = await demoAuth.signIn("student", "student123");
    const token = demoAuth.issueSession(u!);
    const back = await demoAuth.resolveSession(token);
    expect(back?.id).toBe(u!.id);
  });
});

describe("journey spine (Aarav)", () => {
  const j = getJourney("stu-aarav");
  it("has the 7 ordered stages", () => {
    expect(j.map((s) => s.key)).toEqual([
      "education",
      "skills",
      "evidence",
      "projects",
      "internship",
      "readiness",
      "placement",
    ]);
  });
  it("marks exactly one stage as current", () => {
    expect(j.filter((s) => s.state === "current")).toHaveLength(1);
  });
  it("early stages are done, later ones are not", () => {
    expect(j.find((s) => s.key === "skills")?.state).toBe("done");
    expect(j.find((s) => s.key === "placement")?.state).not.toBe("done");
  });
  it("the internship stage is current while an internship is active", () => {
    expect(j.find((s) => s.key === "internship")?.state).toBe("current");
  });
});

describe("next best action", () => {
  it("returns at least one deterministic, explained action for Aarav", () => {
    const a = getNextActions("stu-aarav");
    expect(a.length).toBeGreaterThan(0);
    expect(a[0].why.length).toBeGreaterThan(10);
    expect(a[0].href.startsWith("/student/")).toBe(true);
    // ranked
    expect(a[0].score).toBeGreaterThanOrEqual(a[a.length - 1].score);
  });
  it("is deterministic", () => {
    expect(getNextActions("stu-aarav")).toEqual(getNextActions("stu-aarav"));
  });
});

describe("education feeds skills", () => {
  const e = getEducation("stu-aarav");
  it("has courses, each mapping to named skills", () => {
    expect(e.courses.length).toBeGreaterThanOrEqual(3);
    const withSkills = e.courses.filter((c) => c.skills.length > 0);
    expect(withSkills.length).toBeGreaterThan(0);
    expect(withSkills[0].skills[0]).toHaveProperty("name");
  });
});

describe("projects carry the new lifecycle shape", () => {
  const ps = getStudentProjects("stu-aarav");
  it("every project has a type, status and skill→competency data", () => {
    expect(ps.length).toBeGreaterThan(0);
    for (const p of ps) {
      expect(typeof p.type).toBe("string");
      expect(typeof p.status).toBe("string");
      expect(Array.isArray(p.skillNames)).toBe(true);
      expect(Array.isArray(p.evaluations)).toBe(true);
    }
  });
});

describe("student home composes the orientation view", () => {
  const h = getStudentHome("stu-aarav");
  it("has greeting name, journey, one+ next action, activity, recommendations", () => {
    expect(h.firstName).toBe("Aarav");
    expect(h.journey).toHaveLength(7);
    expect(h.nextActions.length).toBeGreaterThan(0);
    expect(h.activity.length).toBeGreaterThan(0);
    expect(h.recommended.length).toBeGreaterThan(0);
    expect(h.recommended.length).toBeLessThanOrEqual(3);
  });
});
