// WF-015 hardening — suspicious-login scan (FR-SUSPICIOUS-LOGIN-2026-0030). The work lives in
// runSuspiciousLoginScan (shared with the scheduled sweep).
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { runSuspiciousLoginScan } from "@/server/security/suspiciousLoginsRun";
import { ok, meta } from "@/server/http/envelope";

const MOD = "security_audit_console";

export async function POST(request: NextRequest) {
  const guard = await requireStaffScope(request, MOD, "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const result = await runSuspiciousLoginScan(createSupabaseAdminClient(), guard.actor);
  return NextResponse.json(ok(result, meta(guard.requestId, MOD)));
}
