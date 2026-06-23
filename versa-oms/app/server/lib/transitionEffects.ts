// GENERATED from spec/effects/chains.json by _validation/gen_effects.py — DO NOT EDIT.
// Human-readable contract: spec/feature_effects/CROSS_MODULE_EFFECT_CHAINS.md
// To change a chain, edit the spec and re-run: python _validation/gen_effects.py
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import type { Actor } from "@/server/types";

type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;

async function effect_CHAIN_002(supabase: Db, recordId: string, actor: Actor): Promise<void> {
  const now = new Date().toISOString();
  const { data: src } = await supabase.from("school_onboarding_cases").select("*").eq("id", recordId).maybeSingle();
  if (!src) return;
  const row = src as Record<string, unknown>;
  const linkedId = row["school_id"] as string | undefined;
  if (!linkedId) return;
  await supabase.from("schools").update({ "status": "active", "portal_enabled": true, "roster_upload_enabled": true, "updated_at": now }).eq("id", linkedId);
  await supabase.from("notification_events").insert({ "event_code": "school_activated", "event_idempotency_key": `school_activated:${linkedId}`, "source_module": "school_onboarding_ops", "source_entity": "schools", "source_entity_id": linkedId, "event_payload": { "message": "Your school is active — you can now upload your student roster." }, "recipient_resolver": "school_coordinator" });
  await createAuditEvent({ sourceModule: "school_onboarding_ops", action: "activate_school", actor, entityType: "schools", entityId: String(linkedId ?? ""), newStatus: "active", reason: `activated from onboarding ${recordId}` });
}

export const TRANSITION_EFFECTS: Record<string, (supabase: Db, recordId: string, actor: Actor) => Promise<void>> = {
  "school_onboarding_ops:activate": effect_CHAIN_002,
};

export async function runTransitionEffect(moduleId: string, action: string, supabase: Db, recordId: string, actor: Actor): Promise<void> {
  const fn = TRANSITION_EFFECTS[`${moduleId}:${action}`];
  if (!fn) return;
  try { await fn(supabase, recordId, actor); } catch { /* best-effort: the transition already applied */ }
}
