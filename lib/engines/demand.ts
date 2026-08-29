/**
 * Industry Skill-Demand Intelligence — deterministic aggregation over the
 * opportunity corpus. Produces trending / emerging / declining skills, role
 * demand, and location demand, each with a plain-language explanation.
 *
 * The underlying opportunity data is SYNTHETIC and labelled as such in the UI.
 */

import type {
  DemandTrend,
  Id,
  Opportunity,
  RoleProfile,
  Skill,
} from "@/lib/domain/types";

export interface SkillDemand {
  skillId: Id;
  name: string;
  openings: number;
  employers: number;
  trend: DemandTrend;
  /** % change vs the previous synthetic period. */
  changePct: number;
  explanation: string;
}

export interface RoleDemand {
  roleId: Id;
  title: string;
  family: string;
  openings: number;
  medianStipend?: number;
  medianSalaryLpa?: number;
}

export interface LocationDemand {
  city: string;
  openings: number;
  topRole: string;
}

export interface DemandReport {
  generatedFor: string;
  totalOpportunities: number;
  surging: SkillDemand[];
  emerging: SkillDemand[];
  declining: SkillDemand[];
  allSkills: SkillDemand[];
  roles: RoleDemand[];
  locations: LocationDemand[];
}

/** Stable pseudo-random in [0,1) from a string — for synthetic prior-period data. */
function seeded(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

export function computeDemand(
  opportunities: Opportunity[],
  roles: Map<Id, RoleProfile>,
  skillsById: Map<Id, Skill>,
): DemandReport {
  const skillAgg = new Map<Id, { openings: number; employers: Set<Id> }>();
  const roleAgg = new Map<
    Id,
    { openings: number; stipends: number[]; salaries: number[] }
  >();
  const cityAgg = new Map<
    string,
    { openings: number; roles: Map<string, number> }
  >();

  for (const o of opportunities) {
    const role = roles.get(o.roleId);
    const skillIds = new Set<Id>([
      ...(role?.mandatorySkillIds ?? []),
      ...(role?.preferredSkillIds ?? []),
      ...o.extraSkillIds,
    ]);
    for (const sid of skillIds) {
      const a = skillAgg.get(sid) ?? { openings: 0, employers: new Set<Id>() };
      a.openings += o.openings;
      a.employers.add(o.employerId);
      skillAgg.set(sid, a);
    }
    const ra = roleAgg.get(o.roleId) ?? {
      openings: 0,
      stipends: [],
      salaries: [],
    };
    ra.openings += o.openings;
    if (o.stipendPerMonth) ra.stipends.push(o.stipendPerMonth);
    if (o.salaryLpa) ra.salaries.push(o.salaryLpa);
    roleAgg.set(o.roleId, ra);

    const ca = cityAgg.get(o.city) ?? {
      openings: 0,
      roles: new Map<string, number>(),
    };
    ca.openings += o.openings;
    const title = role?.title ?? o.title;
    ca.roles.set(title, (ca.roles.get(title) ?? 0) + o.openings);
    cityAgg.set(o.city, ca);
  }

  const allSkills: SkillDemand[] = [...skillAgg.entries()]
    .map(([skillId, a]) => {
      const name = skillsById.get(skillId)?.name ?? skillId;
      // synthetic previous period = current scaled by a stable factor 0.5–1.6
      const prior = Math.max(
        1,
        Math.round(a.openings * (0.5 + seeded(skillId) * 1.1)),
      );
      const changePct = Math.round(((a.openings - prior) / prior) * 100);
      const trend: DemandTrend =
        changePct >= 40
          ? "surging"
          : changePct >= 12
            ? "growing"
            : changePct <= -12
              ? "declining"
              : "stable";
      return {
        skillId,
        name,
        openings: a.openings,
        employers: a.employers.size,
        trend,
        changePct,
        explanation:
          trend === "surging"
            ? `${a.employers.size} employers added roles needing ${name} this period (+${changePct}% vs last).`
            : trend === "growing"
              ? `Steady uptick in ${name} demand (+${changePct}%), across ${a.employers.size} employers.`
              : trend === "declining"
                ? `Fewer new postings cite ${name} (${changePct}%). Still relevant, lower urgency.`
                : `${name} demand holding steady across ${a.employers.size} employers.`,
      };
    })
    .sort((a, b) => b.openings - a.openings);

  const roleList: RoleDemand[] = [...roleAgg.entries()]
    .map(([roleId, a]) => {
      const r = roles.get(roleId);
      return {
        roleId,
        title: r?.title ?? roleId,
        family: r?.family ?? "—",
        openings: a.openings,
        medianStipend: median(a.stipends),
        medianSalaryLpa: median(a.salaries),
      };
    })
    .sort((a, b) => b.openings - a.openings);

  const locations: LocationDemand[] = [...cityAgg.entries()]
    .map(([city, a]) => ({
      city,
      openings: a.openings,
      topRole:
        [...a.roles.entries()].sort((x, y) => y[1] - x[1])[0]?.[0] ?? "—",
    }))
    .sort((a, b) => b.openings - a.openings);

  return {
    generatedFor: "Rolling synthetic quarter",
    totalOpportunities: opportunities.length,
    surging: allSkills.filter((s) => s.trend === "surging").slice(0, 8),
    emerging: allSkills.filter((s) => s.trend === "growing").slice(0, 8),
    declining: allSkills.filter((s) => s.trend === "declining").slice(0, 6),
    allSkills,
    roles: roleList,
    locations,
  };
}

function median(xs: number[]): number | undefined {
  if (!xs.length) return undefined;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}
