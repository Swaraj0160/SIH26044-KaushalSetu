/**
 * Career Copilot — a context-aware assistant, NOT a general chatbot.
 *
 * Every answer is composed from the student's real, deterministic engine output
 * (readiness, matches, skill gaps, roadmap). The active AiProvider (mock by
 * default, Gemini when configured) is used only to phrase the grounded facts —
 * it never invents readiness numbers, gaps, or matches.
 */

import { getAiProvider } from "@/lib/ai";
import {
  closestRoles,
  getStudentDashboard,
  rankOpportunitiesForStudent,
  simulateRoles,
} from "@/lib/data";
import { getDataset } from "@/lib/demo/dataset";
import type { Id } from "@/lib/domain/types";

export interface CopilotAnswer {
  intent:
    | "readiness"
    | "gaps"
    | "roadmap"
    | "opportunities"
    | "role_fit"
    | "strengths"
    | "overview";
  /** Grounded, structured facts the UI can render as blocks. */
  facts: string[];
  /** Provider-phrased summary (mock = deterministic template). */
  narrative: string;
  provider: string;
  followups: string[];
}

const SUGGESTED = [
  "Am I ready for my target role?",
  "What are my biggest skill gaps?",
  "Give me a 2-week plan to improve",
  "Which internships fit me best right now?",
  "Which role am I closest to?",
  "What are my strongest, best-evidenced skills?",
];

export function suggestedQuestions(): string[] {
  return SUGGESTED;
}

function classify(q: string): CopilotAnswer["intent"] {
  const s = q.toLowerCase();
  if (/(ready|readiness|prepared)/.test(s)) return "readiness";
  if (/(plan|roadmap|weeks?|days?|schedule|prepare)/.test(s)) return "roadmap";
  if (/(gap|missing|lack|weak)/.test(s)) return "gaps";
  if (/(intern|job|opportunit|apply|role.*fit|fit.*role|for me)/.test(s))
    return "opportunities";
  if (/(closest|which role|switch|pivot|other role)/.test(s)) return "role_fit";
  if (/(strong|strength|best|good at|evidence)/.test(s)) return "strengths";
  return "overview";
}

export async function askCopilot(
  studentId: Id,
  question: string,
): Promise<CopilotAnswer> {
  const d = getDataset();
  const dash = getStudentDashboard(studentId);
  const intent = classify(question);
  const facts: string[] = [];
  const followups = SUGGESTED.filter(
    (s) => s.toLowerCase() !== question.toLowerCase(),
  ).slice(0, 3);

  if (intent === "readiness" || intent === "overview") {
    facts.push(`Target role: ${dash.targetRole.title}.`);
    facts.push(
      `Career readiness: ${dash.readiness.score}/100 — ${dash.readiness.headline}.`,
    );
    for (const f of dash.readiness.factors.slice(0, 4)) {
      facts.push(
        `• ${f.label}: ${Math.round(f.value * 100)}% (weight ${Math.round(f.weight * 100)}%) — ${f.detail}`,
      );
    }
    if (dash.biggestGap)
      facts.push(
        `Largest single gap: ${dash.biggestGap.name} (${dash.biggestGap.gap} levels).`,
      );
  }

  if (intent === "gaps") {
    const gaps = dash.gap.gaps.filter((g) => g.gap > 0).slice(0, 6);
    facts.push(`${gaps.length} skill gap(s) for ${dash.targetRole.title}:`);
    for (const g of gaps) {
      facts.push(
        `• ${g.name} — have L${g.current}, need L${g.required} (${g.priority} priority${g.mandatory ? ", mandatory" : ""})`,
      );
    }
  }

  if (intent === "roadmap") {
    facts.push(
      `Development plan for ${dash.targetRole.title} — ~${dash.gap.totalWeeks} weeks total:`,
    );
    for (const step of dash.gap.roadmap.slice(0, 6)) {
      facts.push(
        `${step.order}. ${step.activity} (${step.estWeeks}w) → evidence: ${step.producesEvidence}`,
      );
    }
  }

  if (intent === "opportunities") {
    const ranked = rankOpportunitiesForStudent(studentId).slice(0, 3);
    facts.push("Best-matching opportunities right now:");
    for (const r of ranked) {
      facts.push(
        `• ${r.opportunity.title} — ${r.match.score}% match (${r.match.band}); missing: ${
          r.match.missing
            .slice(0, 2)
            .map((m) => m.name)
            .join(", ") || "nothing critical"
        }`,
      );
    }
  }

  if (intent === "role_fit") {
    const close = closestRoles(studentId, 4);
    facts.push("Roles you are closest to, by match score:");
    for (const rf of close) {
      facts.push(
        `• ${rf.role.title} — ${rf.match.score}% match, readiness ${rf.readiness.score}/100`,
      );
    }
    const target = simulateRoles(studentId, [dash.targetRole.id])[0];
    facts.push(
      `For reference, your declared target ${dash.targetRole.title} is ${target.match.score}% match.`,
    );
  }

  if (intent === "strengths") {
    const strong = [...dash.profile.skills.values()]
      .filter((s) => s.effectiveLevel >= 4 && s.evidence.score >= 0.3)
      .sort((a, b) => b.evidence.score - a.evidence.score)
      .slice(0, 6);
    facts.push("Strongest, best-evidenced skills:");
    for (const s of strong) {
      facts.push(
        `• ${s.skill?.name ?? s.skillId} — level ${s.effectiveLevel}, evidence ${Math.round(
          s.evidence.score * 100,
        )}% (${s.evidence.confidence}); ${s.evidence.rationale.slice(0, 2).join(", ")}`,
      );
    }
  }

  void d;

  const provider = getAiProvider();
  const prompt =
    `Rephrase these grounded facts about a student's career readiness into a concise, ` +
    `encouraging 2–3 sentence answer to the question "${question}". Do not add new numbers.\n\n` +
    facts.join("\n");
  const completion = await provider.generateText(prompt, {
    system:
      "You are KaushalSetu's career copilot. Be specific and grounded. Never invent metrics.",
  });

  // The mock provider echoes the prompt; give a clean deterministic narrative
  // rather than surfacing the echo. A real Gemini response would replace this.
  const narrative =
    provider.name === "mock"
      ? deterministicNarrative(intent, dash)
      : completion.text;

  return { intent, facts, narrative, provider: provider.name, followups };
}

function deterministicNarrative(
  intent: CopilotAnswer["intent"],
  dash: ReturnType<typeof getStudentDashboard>,
): string {
  switch (intent) {
    case "gaps":
      return `Your path to ${dash.targetRole.title} is blocked mainly by ${
        dash.biggestGap?.name ?? "a few skills"
      }. Focus there first — the gaps below are ordered by priority and each names the evidence that will close it.`;
    case "roadmap":
      return `Here is a sequenced plan for ${dash.targetRole.title}. It respects skill prerequisites and each step ends in something a recruiter can verify, not just a completion tick.`;
    case "opportunities":
      return `These are your strongest current matches. The gap on each is small and specific — closing one or two skills moves several of them into "strong".`;
    case "role_fit":
      return `You are well positioned for more than one role. If your target feels far, an adjacent role with a higher match is a legitimate on-ramp, not a compromise.`;
    case "strengths":
      return `These skills are not just self-declared — they carry assessment, project, or verification evidence, so they hold up in matching. Lead with them.`;
    default:
      return `You are at ${dash.readiness.score}/100 readiness for ${dash.targetRole.title}. ${dash.readiness.headline}. The factors below show exactly where the points are and aren't.`;
  }
}
