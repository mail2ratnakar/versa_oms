// WF-014 Admin setting-change governance — kernel ops (extracted from the route so the route is thin wiring).
// proposeSettingChange does the bespoke create: validate body, resolve the active definition, compute the next
// version + value hash, insert the setting_version + setting_change_request, audit. FROZEN-KERNEL.
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { SYSTEM_STAFF_ID } from "@/server/auth/actor";
import type { Actor } from "@/server/types";
import { createHash } from "node:crypto";

const MOD = "admin_settings";
const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export async function listSettingChanges() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("setting_change_requests")
    .select("id, change_request_code, change_type, reason, request_status, created_at")
    .is("archived_at", null).order("created_at", { ascending: false }).limit(100);
  return { items: data ?? [], pagination: { page: 1, page_size: 100, total_count: (data ?? []).length, has_next: false, next_cursor: null } };
}

type Result = { data: Record<string, unknown> } | { error: { code: "VALIDATION_FAILED" | "CONFLICT" | "INTERNAL"; message: string; status: number; field_errors?: { field: string; message: string }[] } };

export async function proposeSettingChange(actor: Actor, body: Record<string, unknown>): Promise<Result> {
  const settingKey = String(body.setting_key ?? "").trim();
  const reason = String(body.reason ?? "").trim();
  const fieldErrors = [
    ...(settingKey ? [] : [{ field: "setting_key", message: "A setting_key is required." }]),
    ...(reason ? [] : [{ field: "reason", message: "A reason is required." }]),
    ...("new_value" in body ? [] : [{ field: "new_value", message: "A new_value is required." }]),
  ];
  if (fieldErrors.length) return { error: { code: "VALIDATION_FAILED", message: "Validation failed.", status: 422, field_errors: fieldErrors } };

  const supabase = createSupabaseAdminClient();
  const { data: def } = await supabase.from("setting_definitions").select("setting_key").eq("setting_key", settingKey).eq("definition_status", "active").maybeSingle();
  if (!def) return { error: { code: "CONFLICT", message: `No active setting '${settingKey}'.`, status: 409 } };

  const { data: last } = await supabase.from("setting_versions").select("setting_version").eq("setting_key", settingKey).order("setting_version", { ascending: false }).limit(1).maybeSingle();
  const nextVersion = Number(((last as Record<string, unknown> | null)?.setting_version as number) ?? 0) + 1;
  const requestedBy = isUuid(actor.actor_id) ? actor.actor_id : SYSTEM_STAFF_ID;
  const value = body.new_value;
  const valueHash = createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 32);

  const { data: ver, error: ve } = await supabase.from("setting_versions").insert({
    setting_key: settingKey, setting_version: nextVersion, setting_value: value, value_hash: valueHash,
    requested_by: requestedBy, version_status: "under_review", updated_at: new Date().toISOString(),
  }).select("id").single();
  if (ve || !ver) return { error: { code: "INTERNAL", message: "Could not propose the new version.", status: 500 } };

  const { data: cr, error: ce } = await supabase.from("setting_change_requests").insert({
    change_request_code: "SCR-" + crypto.randomUUID().slice(0, 8).toUpperCase(), setting_version_id: String((ver as Record<string, unknown>).id),
    change_type: "update", reason, impact_summary: String(body.impact_summary ?? "").trim() || null, rollback_plan: String(body.rollback_plan ?? "").trim() || null,
    requested_by: requestedBy, request_status: "submitted", updated_at: new Date().toISOString(),
  }).select("id, change_request_code, request_status").single();
  if (ce || !cr) return { error: { code: "INTERNAL", message: "Could not create the change request.", status: 500 } };

  await createAuditEvent({ sourceModule: MOD, action: "propose_setting_change", actor, entityType: "setting_change_requests", entityId: String((cr as Record<string, unknown>).id), reason });
  return { data: cr as Record<string, unknown> };
}
