import { NextResponse } from "next/server";

import { askCopilot } from "@/lib/ai/copilot";
import { getPersona } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const persona = await getPersona();
  if (!persona || persona.role !== "student") {
    return NextResponse.json(
      { error: "Career Copilot is a student feature." },
      { status: 403 },
    );
  }
  const body = (await req.json().catch(() => ({}))) as { question?: unknown };
  const question =
    typeof body.question === "string" ? body.question.slice(0, 400) : "";
  if (!question.trim()) {
    return NextResponse.json({ error: "Empty question." }, { status: 400 });
  }
  const answer = await askCopilot(persona.refId, question);
  return NextResponse.json(answer);
}
