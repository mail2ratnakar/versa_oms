// WF-015 hardening — permission drift scan (FR-PERMISSION-DRIFT-2026-0027). The work lives in
// runPermissionDriftScan (shared with the scheduled sweep).
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { runPermissionDriftScan } from "@/server/security/permissionDriftRun";
import { ok, meta } from "@/server/http/envelope";

const MOD = "security_audit_console";

export async function POST(request: NextRequest) {
  const guard = await requireStaffScope(request, MOD, "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const result = await runPermissionDriftScan(createSupabaseAdminClient(), guard.actor);
  return NextResponse.json(ok(result, meta(guard.requestId, MOD)));
}
