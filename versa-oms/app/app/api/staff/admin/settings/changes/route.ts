// WF-014 Admin Setting Change Governance (FR-ADMIN-SETTINGS-CHAIN-2026-0025). Propose a setting change:
// creates the next setting_version (the proposed value) + a setting_change_request linking it. The change
// then goes through maker-checker approve + apply (generated dualApproval transitions); apply activates
// the new version + supersedes the old (settingEffects). requested_by is server-set, never client.
import { NextRequest, NextResponse } from "next/server";
import { requireStaffScope } from "@/server/guards/requireStaffScope";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { SYSTEM_STAFF_ID } from "@/server/auth/actor";
import { ok, err, meta } from "@/server/http/envelope";
import { createHash } from "node:crypto";

const MOD = "admin_settings";
const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export async function GET(request: NextRequest) {
  const guard = await requireStaffScope(request, MOD, "read");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("setting_change_requests")
    .select("id, change_request_code, change_type, reason, request_status, created_at")
    .is("archived_at", null).order("created_at", { ascending: false }).limit(100);
  return NextResponse.json(ok({ items: data ?? [], pagination: { page: 1, page_size: 100, total_count: (data ?? []).length, has_next: false, next_cursor: null } }, meta(guard.requestId, MOD)));
}

export async function POST(request: NextRequest) {
  const guard = await requireStaffScope(request, MOD, "write");
  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { body = {}; }
  const settingKey = String(body.setting_key ?? "").trim();
  const reason = String(body.reason ?? "").trim();
  const fieldErrors = [
    ...(settingKey ? [] : [{ field: "setting_key", message: "A setting_key is required." }]),
    ...(reason ? [] : [{ field: "reason", message: "A reason is required." }]),
    ...("new_value" in body ? [] : [{ field: "new_value", message: "A new_value is required." }]),
  ];
  if (fieldErrors.length) return NextResponse.json(err("VALIDATION_FAILED", "Validation failed.", meta(guard.requestId, MOD), { field_errors: fieldErrors }), { status: 422 });

  const supabase = createSupabaseAdminClient();
  const { data: def } = await supabase.from("setting_definitions").select("setting_key").eq("setting_key", settingKey).eq("definition_status", "active").maybeSingle();
  if (!def) return NextResponse.json(err("CONFLICT", `No active setting '${settingKey}'.`, meta(guard.requestId, MOD)), { status: 409 });

  // Next version number for this setting_key.
  const { data: last } = await supabase.from("setting_versions").select("setting_version").eq("setting_key", settingKey).order("setting_version", { ascending: false }).limit(1).maybeSingle();
  const nextVersion = Number(((last as Record<string, unknown> | null)?.setting_version as number) ?? 0) + 1;
  const requestedBy = isUuid(guard.actor.actor_id) ? guard.actor.actor_id : SYSTEM_STAFF_ID;
  const value = body.new_value;
  const valueHash = createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 32);

  const { data: ver, error: ve } = await supabase.from("setting_versions").insert({
    setting_key: settingKey, setting_version: nextVersion, setting_value: value, value_hash: valueHash,
    requested_by: requestedBy, version_status: "under_review", updated_at: new Date().toISOString(),
  }).select("id").single();
  if (ve || !ver) return NextResponse.json(err("INTERNAL", "Could not propose the new version.", meta(guard.requestId, MOD)), { status: 500 });

  const { data: cr, error: ce } = await supabase.from("setting_change_requests").insert({
    change_request_code: "SCR-" + crypto.randomUUID().slice(0, 8).toUpperCase(), setting_version_id: String((ver as Record<string, unknown>).id),
    change_type: "update", reason, impact_summary: String(body.impact_summary ?? "").trim() || null, rollback_plan: String(body.rollback_plan ?? "").trim() || null,
    requested_by: requestedBy, request_status: "submitted", updated_at: new Date().toISOString(),
  }).select("id, change_request_code, request_status").single();
  if (ce || !cr) return NextResponse.json(err("INTERNAL", "Could not create the change request.", meta(guard.requestId, MOD)), { status: 500 });

  await createAuditEvent({ sourceModule: MOD, action: "propose_setting_change", actor: guard.actor, entityType: "setting_change_requests", entityId: String((cr as Record<string, unknown>).id), reason });
  return NextResponse.json(ok(cr, meta(guard.requestId, MOD)));
}
