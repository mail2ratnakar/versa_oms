import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { ValidationError } from "@/server/lib/defineModule";
import { ok, err, meta } from "@/server/http/envelope";
import { listInteractions, addInteraction } from "@/server/crm/leadService";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireStaffScope(request, "school_crm", "read");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const { id } = await ctx.params;
  return NextResponse.json(ok(await listInteractions(guard.actor, id), meta(guard.requestId, "school_crm")));
}

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireStaffScope(request, "school_crm", "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const { id } = await ctx.params;
  let body: { channel?: string; note?: string } = {};
  try { body = (await request.json()) as typeof body; } catch { body = {}; }
  try {
    return NextResponse.json(ok(await addInteraction(guard.actor, id, body), meta(guard.requestId, "school_crm")), { status: 201 });
  } catch (e) {
    if (e instanceof ValidationError) return NextResponse.json(err("VALIDATION_FAILED", "Validation failed.", meta(guard.requestId, "school_crm"), { field_errors: e.fieldErrors }), { status: 422 });
    return NextResponse.json(err("INTERNAL", "Unexpected error.", meta(guard.requestId, "school_crm")), { status: 500 });
  }
}
