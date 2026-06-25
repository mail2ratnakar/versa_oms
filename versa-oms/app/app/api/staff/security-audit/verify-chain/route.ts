// WF-015 Security / Audit Drift (FR-SECURITY-AUDIT-VERIFY-2026-0026). Verify the audit log's integrity:
// recompute each event's hash; any mismatch = a tampered/forged row -> open a critical incident. The work
// lives in runAuditIntegrityCheck (shared with the scheduled sweep).
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { runAuditIntegrityCheck } from "@/server/security/auditIntegrity";
import { ok, meta } from "@/server/http/envelope";

const MOD = "security_audit_console";

export async function GET(request: NextRequest) {
  const guard = await requireStaffScope(request, MOD, "read");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const result = await runAuditIntegrityCheck(createSupabaseAdminClient(), guard.actor);
  return NextResponse.json(ok(result, meta(guard.requestId, MOD)));
}
