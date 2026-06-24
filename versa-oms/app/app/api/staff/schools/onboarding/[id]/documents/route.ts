// FR-UI-HARDENING-2026-0002 — onboarding case → documents detail panel (read-only sub-collection).
// Hand-written sub-route (gen_modules does not generate sub-collections); reuses the shared listChild helper.
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { ok, meta } from "@/server/http/envelope";
import { listChildRecords } from "@/server/lib/listChild";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireStaffScope(request, "school_onboarding_ops", "read");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const { id } = await ctx.params;
  const data = await listChildRecords("school_onboarding_documents", "onboarding_case_id", id, guard.actor);
  return NextResponse.json(ok(data, meta(guard.requestId, "school_onboarding_ops")));
}
