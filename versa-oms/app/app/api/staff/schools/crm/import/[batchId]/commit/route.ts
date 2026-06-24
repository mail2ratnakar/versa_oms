// GENERATED from spec/actions/<m>.actions.json by _validation/gen_actions.py — DO NOT EDIT.
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { ValidationError } from "@/server/lib/defineModule";
import { ok, err, meta } from "@/server/http/envelope";
import { commitImport } from "@/server/crm/leadService";

export async function POST(request: NextRequest, ctx: { params: Promise<{ batchId: string }> }) {
  const guard = await requireStaffScope(request, "school_crm", "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const { batchId } = await ctx.params;
  let body: { reason?: string } = {};
  try { body = (await request.json()) as typeof body; } catch { body = {}; }
  try {
    return NextResponse.json(ok(await commitImport(guard.actor, batchId, body), meta(guard.requestId, "school_crm")));
  } catch (e) {
    if (e instanceof ValidationError) return NextResponse.json(err("VALIDATION_FAILED", "Validation failed.", meta(guard.requestId, "school_crm"), { field_errors: e.fieldErrors }), { status: 422 });
    return NextResponse.json(err("INTERNAL", "Unexpected error.", meta(guard.requestId, "school_crm")), { status: 500 });
  }
}
