import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { computeInvoiceAmount } from "@/server/finance/invoicing";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { isEligiblePaymentLink_create } from "@/server/rules/payment_link.generated"; // CR 2026-06-26: central rule, compiled
import { ok, err, meta } from "@/server/http/envelope";

/** Create a payment link with a SERVER-CALCULATED amount (browser totals are never trusted). */
export async function POST(request: NextRequest) {
  const guard = await requireStaffScope(request, "finance_ops", "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });

  const idem = request.headers.get("x-idempotency-key");
  if (!idem) {
    return NextResponse.json(err("IDEMPOTENCY_KEY_REQUIRED", "X-Idempotency-Key is required.", meta(guard.requestId, "finance_ops")), { status: 400 });
  }

  let body: { unit_price?: number; student_count?: number; discount?: number; gst_rate?: number };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }
  // CR 2026-06-26 (FROZEN-DEBT rule #1): the central fact lives in the catalog; this is the ONE thin call to it.
  const eligible = isEligiblePaymentLink_create(body as Record<string, unknown>);
  if (!eligible.eligible) {
    return NextResponse.json(err("VALIDATION_FAILED", eligible.reason ?? "Not eligible.", meta(guard.requestId, "finance_ops")), { status: 422 });
  }
  const amount = computeInvoiceAmount({
    unitPrice: Number(body.unit_price) || 0,
    studentCount: Number(body.student_count) || 0,
    discount: Number(body.discount) || 0,
    gstRate: Number(body.gst_rate) || 0,
  });
  const token = crypto.randomUUID();
  await createAuditEvent({
    sourceModule: "finance_ops",
    action: "create_payment_link",
    actor: guard.actor,
    entityType: "finance_payment_link",
    entityId: token,
    reason: `payment link total=${amount.total}`,
  });
  return NextResponse.json(ok({ payment_link_token: token, amount, pay_url: `/pay/${token}` }, meta(guard.requestId, "finance_ops")), { status: 201 });
}
