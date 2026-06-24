import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { getStaffKpis } from "@/server/lib/dashboard";
import { ok, meta } from "@/server/http/envelope";

export async function GET(request: NextRequest) {
  const guard = await requireStaffScope(request, "company_dashboard", "read");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const kpis = await getStaffKpis(guard.actor);
  return NextResponse.json(ok({ kpis }, meta(guard.requestId, "company_dashboard")));
}
