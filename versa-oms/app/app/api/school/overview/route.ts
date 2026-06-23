import { NextRequest, NextResponse } from "next/server";
import { requireSchoolScope } from "@/server/guards/requireSchoolScope";
import { getSchoolKpis } from "@/server/lib/dashboard";
import { ok, meta } from "@/server/http/envelope";

export async function GET(request: NextRequest) {
  const guard = await requireSchoolScope(request, "school_overview");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const kpis = await getSchoolKpis(guard.actor.school_id ?? "");
  return NextResponse.json(ok({ kpis }, meta(guard.requestId, "school_overview")));
}
