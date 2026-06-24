// GENERATED from spec/actions/<m>.actions.json by _validation/gen_actions.py — DO NOT EDIT.
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { ValidationError } from "@/server/lib/defineModule";
import { ok, err, meta } from "@/server/http/envelope";
import { editInteraction } from "@/server/crm/leadService";

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string; iid: string }> }) {
  const guard = await requireStaffScope(request, "school_crm", "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const { id, iid } = await ctx.params;
  let body: Record<string, unknown> = {};
  try { body = (await request.json()) as Record<string, unknown>; } catch { body = {}; }
  try {
    return NextResponse.json(ok(await editInteraction(guard.actor, id, iid, body), meta(guard.requestId, "school_crm")));
  } catch (e) {
    if (e instanceof ValidationError) return NextResponse.json(err("VALIDATION_FAILED", "Validation failed.", meta(guard.requestId, "school_crm"), { field_errors: e.fieldErrors }), { status: 422 });
    return NextResponse.json(err("INTERNAL", "Unexpected error.", meta(guard.requestId, "school_crm")), { status: 500 });
  }
}
