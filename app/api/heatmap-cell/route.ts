import { NextResponse } from "next/server";

import { getHeatmapCellDetail } from "@/lib/data";
import { getPersona } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const persona = await getPersona();
  if (
    !persona ||
    !["institution_admin", "faculty", "super_admin"].includes(persona.role)
  ) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const inst = url.searchParams.get("inst");
  const dept = url.searchParams.get("dept");
  const skill = url.searchParams.get("skill");
  if (!inst || !dept || !skill) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }
  return NextResponse.json(getHeatmapCellDetail(inst, dept, skill));
}
