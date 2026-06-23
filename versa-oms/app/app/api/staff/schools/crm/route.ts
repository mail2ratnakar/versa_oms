import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { listLeads, createLead } from "@/server/crm/leadService";
import { ValidationError } from "@/server/lib/defineModule";
import { ok, err, meta } from "@/server/http/envelope";

// Custom CRM collection route (lead service: server-filled codes + dedupe). Hand-maintained.
export async function GET(request: NextRequest) {
  const guard = await requireStaffScope(request, "school_crm", "read");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const data = await listLeads(guard.actor, request.nextUrl.searchParams);
  return NextResponse.json(ok(data, meta(guard.requestId, "school_crm")));
}

export async function POST(request: NextRequest) {
  const guard = await requireStaffScope(request, "school_crm", "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const idem = request.headers.get("x-idempotency-key");
  if (!idem) {
    return NextResponse.json(err("IDEMPOTENCY_KEY_REQUIRED", "X-Idempotency-Key is required.", meta(guard.requestId, "school_crm")), { status: 400 });
  }
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    payload = {};
  }
  try {
    const res = await createLead(guard.actor, payload);
    return NextResponse.json(ok(res, meta(guard.requestId, "school_crm")), { status: 201 });
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json(err("VALIDATION_FAILED", "Validation failed.", meta(guard.requestId, "school_crm"), { field_errors: e.fieldErrors }), { status: 422 });
    }
    return NextResponse.json(err("INTERNAL", "Unexpected error.", meta(guard.requestId, "school_crm")), { status: 500 });
  }
}
