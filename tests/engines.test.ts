/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";

import {
  getStudentDashboard,
  rankOpportunitiesForStudent,
  closestRoles,
  rankCandidatesForOpportunity,
  getInstitutionOverview,
  verifyCredential,
} from "@/lib/data";
import { getDataset } from "@/lib/demo/dataset";
import { scoreEvidence } from "@/lib/engines/evidence";
import { MATCH_WEIGHTS, READINESS_WEIGHTS } from "@/lib/engines/config";

describe("engine config", () => {
  it("match weights sum to 1", () => {
    const sum = Object.values(MATCH_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 6);
  });
  it("readiness weights sum to 1", () => {
    const sum = Object.values(READINESS_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 6);
  });
});

describe("evidence confidence", () => {
  it("a lone self-declaration is near zero and 'low'", () => {
    const r = scoreEvidence([
      { kind: "self_declared", label: "x", date: "2026-01-01" },
    ]);
    expect(r.score).toBeLessThan(0.1);
    expect(r.confidence).toBe("low");
  });
  it("industry verification + assessment + project reaches 'verified'", () => {
    const r = scoreEvidence([
      { kind: "self_declared", label: "x", date: "2026-01-01" },
      { kind: "assessment", label: "x", date: "2026-01-01" },
      { kind: "project", label: "x", date: "2026-01-01" },
      { kind: "faculty_verified", label: "x", date: "2026-01-01" },
      { kind: "industry_verified", label: "x", date: "2026-01-01" },
    ]);
    expect(r.confidence).toBe("verified");
    expect(r.hasHumanVerification).toBe(true);
  });
  it("is deterministic", () => {
    const ev = [
      { kind: "assessment" as const, label: "x", date: "2026-01-01" },
      { kind: "project" as const, label: "x", date: "2026-01-01" },
    ];
    expect(scoreEvidence(ev)).toEqual(scoreEvidence(ev));
  });
});

describe("dataset coherence", () => {
  const d = getDataset();
  it("meets the demo-data volume targets", () => {
    expect(d.students.length).toBeGreaterThanOrEqual(50);
    expect(d.employers.length).toBeGreaterThanOrEqual(15);
    expect(d.opportunities.length).toBeGreaterThanOrEqual(30);
    expect(d.applications.length).toBeGreaterThanOrEqual(50);
    expect(d.skills.length).toBeGreaterThanOrEqual(40);
    expect(d.roles.length).toBeGreaterThanOrEqual(10);
  });
  it("every application points at a real student and opportunity", () => {
    for (const a of d.applications) {
      expect(d.studentById.has(a.studentId)).toBe(true);
      expect(d.opportunityById.has(a.opportunityId)).toBe(true);
    }
  });
  it("every role requirement references a real competency", () => {
    for (const r of d.roles) {
      for (const req of r.requirements) {
        expect(d.competencyById.has(req.competencyId)).toBe(true);
      }
    }
  });
  it("is deterministic across calls", () => {
    expect(getDataset().students[10].id).toBe(d.students[10].id);
  });
});

describe("hero persona: Aarav → ML Engineer", () => {
  const dash = getStudentDashboard("stu-aarav");
  it("is developing/near-ready, not placement-ready (deployment gap)", () => {
    expect(dash.readiness.score).toBeGreaterThan(45);
    expect(dash.readiness.score).toBeLessThan(85);
  });
  it("surfaces MLOps / deployment as a gap", () => {
    const names = dash.gap.gaps.map((g) => g.name.toLowerCase()).join(" ");
    expect(names).toMatch(/mlops|deployment/);
  });
  it("has a sequenced roadmap that ends in verifiable evidence", () => {
    expect(dash.gap.roadmap.length).toBeGreaterThan(0);
    expect(dash.gap.roadmap[0].producesEvidence).toMatch(
      /evidence|assessment|project/i,
    );
  });
  it("ranks opportunities with explanations", () => {
    const ranked = rankOpportunitiesForStudent("stu-aarav");
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0].match.factors.length).toBe(7);
    expect(ranked[0].match.score).toBeGreaterThanOrEqual(ranked[1].match.score);
  });
  it("closest role is in the Data & AI family", () => {
    const close = closestRoles("stu-aarav", 3);
    expect(close[0].role.family).toBe("Data & AI");
  });
});

describe("hero persona: Ananya → Formulation QA", () => {
  const dash = getStudentDashboard("stu-ananya");
  it("surfaces GMP or QC lab as a gap", () => {
    const names = dash.gap.gaps.map((g) => g.name.toLowerCase()).join(" ");
    expect(names).toMatch(/gmp|qc|laboratory|hptlc|quality/);
  });
});

describe("recruiter ranking is reconcilable with student match", () => {
  it("Aarav's score for opp-hero-ml matches from both sides", () => {
    const fromStudent = rankOpportunitiesForStudent("stu-aarav").find(
      (r) => r.opportunity.id === "opp-hero-ml",
    );
    const fromRecruiter = rankCandidatesForOpportunity("opp-hero-ml").find(
      (c) => c.student.id === "stu-aarav",
    );
    expect(fromStudent).toBeDefined();
    expect(fromRecruiter).toBeDefined();
    expect(fromStudent!.match.score).toBe(fromRecruiter!.match.score);
  });
});

describe("institution overview", () => {
  const ov = getInstitutionOverview("inst-coep");
  it("produces a heatmap with department rows and skill columns", () => {
    expect(ov.heatmap.length).toBeGreaterThan(0);
    expect(ov.heatmapSkillIds.length).toBeGreaterThan(3);
    expect(ov.heatmap[0].cells.length).toBe(ov.heatmapSkillIds.length);
  });
  it("reports mean readiness in 0..100", () => {
    expect(ov.meanReadiness).toBeGreaterThanOrEqual(0);
    expect(ov.meanReadiness).toBeLessThanOrEqual(100);
  });
});

describe("credential verification", () => {
  it("verifies a known credential and rejects an unknown one", () => {
    const ok = verifyCredential("KS-PASSPORT-AARAV");
    expect(ok.found).toBe(true);
    const bad = verifyCredential("KS-NOPE-0000");
    expect(bad.found).toBe(false);
  });
});
