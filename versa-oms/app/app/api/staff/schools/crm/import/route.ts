// GENERATED from spec/actions/<m>.actions.json by _validation/gen_actions.py — DO NOT EDIT.
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { ValidationError } from "@/server/lib/defineModule";
import { ok, err, meta } from "@/server/http/envelope";
import { importLeads } from "@/server/crm/leadService";

export async function POST(request: NextRequest) {
  const guard = await requireStaffScope(request, "school_crm", "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const idem = request.headers.get("x-idempotency-key");
  if (!idem) return NextResponse.json(err("IDEMPOTENCY_KEY_REQUIRED", "X-Idempotency-Key is required.", meta(guard.requestId, "school_crm")), { status: 400 });
  let body: { leads?: Array<Record<string, unknown>> } = {};
  try { body = (await request.json()) as typeof body; } catch { body = {}; }
  if (!Array.isArray(body.leads)) return NextResponse.json(err("VALIDATION_FAILED", "leads[] is required.", meta(guard.requestId, "school_crm")), { status: 422 });
  try {
    const res = await importLeads(guard.actor, body.leads);
    return NextResponse.json(ok(res, meta(guard.requestId, "school_crm")), { status: 201 });
  } catch (e) {
    if (e instanceof ValidationError) return NextResponse.json(err("VALIDATION_FAILED", "Validation failed.", meta(guard.requestId, "school_crm"), { field_errors: e.fieldErrors }), { status: 422 });
    return NextResponse.json(err("INTERNAL", "Unexpected error.", meta(guard.requestId, "school_crm")), { status: 500 });
  }
}
