// Admin-settings domain effects (FR-ADMIN-SETTINGS-CHAIN-2026-0025). Runs AFTER the maker-checker
// `apply` transition on a setting change request: ACTIVATE the proposed setting version and SUPERSEDE
// the previously-active version for that setting_key (governed, versioned, audited). Best-effort (the
// kernel already applied the transition); the version activation is the source of truth.
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import type { Actor } from "@/server/types";

type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;
function actorUuid(a: Actor): string | null { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(a.actor_id) ? a.actor_id : null; }

export const SETTING_DOMAIN_EFFECTS: Record<string, (supabase: Db, recordId: string, actor: Actor) => Promise<void>> = {
  // recordId = the setting_change_request id.
  "admin_settings_change_requests:apply": async (supabase, recordId, actor) => {
    const { data: cr } = await supabase.from("setting_change_requests").select("id, setting_version_id").eq("id", recordId).maybeSingle();
    const versionId = (cr as Record<string, unknown> | null)?.setting_version_id as string | undefined;
    if (!versionId) return;
    const { data: ver } = await supabase.from("setting_versions").select("id, setting_key").eq("id", versionId).maybeSingle();
    const settingKey = (ver as Record<string, unknown> | null)?.setting_key as string | undefined;
    if (!settingKey) return;
    const now = new Date().toISOString();

    // Supersede the currently-active version(s) for this setting_key (never the new one).
    await supabase.from("setting_versions").update({ version_status: "superseded", effective_to: now }).eq("setting_key", settingKey).eq("version_status", "active").neq("id", versionId);
    // Activate the proposed version.
    await supabase.from("setting_versions").update({ version_status: "active", effective_from: now }).eq("id", versionId);
    // Record the activation (best-effort) + audit.
    await supabase.from("setting_activation_events").insert({ setting_version_id: versionId, event_code: "activated", reason: "change request applied", actor_id: actorUuid(actor) });
    await createAuditEvent({ sourceModule: "admin_settings", action: "apply_setting_change", actor, entityType: "setting_versions", entityId: versionId, newStatus: "active", reason: `activated setting ${settingKey} via change request ${recordId}` });
  },
};
