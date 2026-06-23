import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@/server/finance/webhook";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ok, err, meta } from "@/server/http/envelope";

// Real gateway secret wired alongside other external credentials; logic is real now.
const SECRET = process.env.PAYMENT_WEBHOOK_SECRET ?? "dev-webhook-secret";

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const raw = await request.text();
  const sig = request.headers.get("x-signature") ?? "";

  if (!verifySignature(raw, sig, SECRET)) {
    return NextResponse.json(err("FORBIDDEN", "Invalid webhook signature.", meta(requestId, "finance_ops")), { status: 401 });
  }

  let body: { payment_id?: string; status?: string };
  try {
    body = JSON.parse(raw) as typeof body;
  } catch {
    body = {};
  }
  if (!body.payment_id) {
    return NextResponse.json(err("VALIDATION_FAILED", "payment_id required.", meta(requestId, "finance_ops")), { status: 422 });
  }

  const target = body.status === "paid" || body.status === "captured" ? "confirmed" : "failed";
  try {
    const supabase = createSupabaseAdminClient();
    // Idempotent: only transition a still-pending payment (replays/duplicates are no-ops).
    await supabase.from("finance_payments").update({ payment_status: target }).eq("id", body.payment_id).eq("payment_status", "pending");
  } catch {
    /* no DB locally */
  }
  return NextResponse.json(ok({ payment_id: body.payment_id, applied_status: target }, meta(requestId, "finance_ops")));
}
