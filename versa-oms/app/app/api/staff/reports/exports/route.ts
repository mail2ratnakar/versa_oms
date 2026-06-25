// WF-011 Sensitive Export (FR-EXPORT-CHAIN-2026-0024). Staff request a sensitive export (reason required;
// requested_by is server-set, never client). Approval is maker-checker (the generated export-requests
// approve transition, dualApproval). GET lists requests.
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { SYSTEM_STAFF_ID } from "@/server/auth/actor";
import { ok, err, meta } from "@/server/http/envelope";
import { createHash } from "node:crypto";

const MOD = "reports_exports";
const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const FORMATS = new Set(["csv", "xlsx"]);
const SENS = new Set(["internal", "sensitive", "restricted"]);

export async function GET(request: NextRequest) {
  const guard = await requireStaffScope(request, MOD, "read");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("export_requests")
    .select("id, export_code, requested_format, sensitivity_level, reason, export_status, created_at")
    .is("archived_at", null).order("created_at", { ascending: false }).limit(100);
  return NextResponse.json(ok({ items: data ?? [], pagination: { page: 1, page_size: 100, total_count: (data ?? []).length, has_next: false, next_cursor: null } }, meta(guard.requestId, MOD)));
}

export async function POST(request: NextRequest) {
  const guard = await requireStaffScope(request, MOD, "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { body = {}; }
  const reason = String(body.reason ?? "").trim();
  if (!reason) return NextResponse.json(err("VALIDATION_FAILED", "A reason is required for a sensitive export.", meta(guard.requestId, MOD), { field_errors: [{ field: "reason", message: "A reason is required for a sensitive export." }] }), { status: 422 });

  const supabase = createSupabaseAdminClient();
  let rd = typeof body.report_definition_id === "string" ? body.report_definition_id : undefined;
  if (rd) { const { data: c } = await supabase.from("report_definitions").select("id").eq("id", rd).eq("report_status", "active").maybeSingle(); if (!c) rd = undefined; }
  if (!rd) { const { data: d } = await supabase.from("report_definitions").select("id").eq("report_status", "active").order("created_at", { ascending: true }).limit(1).maybeSingle(); rd = (d as Record<string, unknown> | null)?.id as string | undefined; }
  if (!rd) return NextResponse.json(err("CONFLICT", "No active report definition to export.", meta(guard.requestId, MOD)), { status: 409 });

  const fmt = FORMATS.has(String(body.requested_format)) ? String(body.requested_format) : "csv";
  const sens = SENS.has(String(body.sensitivity_level)) ? String(body.sensitivity_level) : "restricted";
  const filter = body.filter_payload && typeof body.filter_payload === "object" ? (body.filter_payload as Record<string, unknown>) : {};
  const code = "EXP-" + crypto.randomUUID().slice(0, 8).toUpperCase();
  const { data, error } = await supabase.from("export_requests").insert({
    export_code: code, report_definition_id: rd, requested_format: fmt, filter_payload: filter,
    filter_hash: createHash("sha256").update(JSON.stringify(filter)).digest("hex").slice(0, 32),
    reason, sensitivity_level: sens, requested_by: isUuid(guard.actor.actor_id) ? guard.actor.actor_id : SYSTEM_STAFF_ID,
    export_status: "submitted", updated_at: new Date().toISOString(),
  }).select("id, export_code, export_status").single();
  if (error || !data) return NextResponse.json(err("INTERNAL", "Could not create the export request.", meta(guard.requestId, MOD)), { status: 500 });
  await createAuditEvent({ sourceModule: MOD, action: "request_sensitive_export", actor: guard.actor, entityType: "export_requests", entityId: String((data as Record<string, unknown>).id), reason });
  return NextResponse.json(ok(data, meta(guard.requestId, MOD)));
}
