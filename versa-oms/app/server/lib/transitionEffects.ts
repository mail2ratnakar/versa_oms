// GENERATED from spec/effects/chains.json by _validation/gen_effects.py — DO NOT EDIT.
// Human-readable contract: spec/feature_effects/CROSS_MODULE_EFFECT_CHAINS.md
// To change a chain, edit the spec and re-run: python _validation/gen_effects.py
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import { raiseNotificationEvent } from "@/server/notifications/fanout";
import type { Actor } from "@/server/types";

type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;
function actorUuid(a: Actor): string | null { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(a.actor_id) ? a.actor_id : null; }

async function effect_CHAIN_002(supabase: Db, recordId: string, actor: Actor): Promise<void> {
  const now = new Date().toISOString();
  const { data: src } = await supabase.from("school_onboarding_cases").select("*").eq("id", recordId).maybeSingle();
  if (!src) return;
  const row = src as Record<string, unknown>;
  const linkedId = row["school_id"] as string | undefined;
  if (!linkedId) return;
  await supabase.from("schools").update({ "status": "active", "portal_enabled": true, "roster_upload_enabled": true, "updated_at": now }).eq("id", linkedId);
  await raiseNotificationEvent(supabase, { "event_code": "school_activated", "event_idempotency_key": `school_activated:${linkedId}`, "source_module": "school_onboarding_ops", "source_entity": "schools", "source_entity_id": linkedId, "event_payload": { "message": "Your school is active — you can now upload your student roster." }, "recipient_resolver": "school_coordinator" }, actor);
  await createAuditEvent({ sourceModule: "school_onboarding_ops", action: "activate_school", actor, entityType: "schools", entityId: String(linkedId ?? ""), newStatus: "active", reason: `activated from onboarding ${recordId}` });
}

async function effect_CHAIN_003(supabase: Db, recordId: string, actor: Actor): Promise<void> {
  const now = new Date().toISOString();
  const { data: src } = await supabase.from("student_roster_batches").select("*").eq("id", recordId).maybeSingle();
  if (!src) return;
  const row = src as Record<string, unknown>;
  const linkedId = row["school_id"] as string | undefined;
  if (!linkedId) return;
  const { data: lk_schoolCode } = await supabase.from("schools").select("school_code").eq("id", linkedId).maybeSingle();
  const schoolCode = ((lk_schoolCode as Record<string, unknown> | null)?.["school_code"] as string) ?? "CAND";
  const { makeCandidateId } = await import("@/server/eval/candidateId");
  const { data: kids } = await supabase.from("students").select("id").eq("school_id", linkedId).is("candidate_id", null);
  let seq = 0;
  for (const k of (kids ?? []) as Array<{ id: string }>) {
    seq++;
    const cid = makeCandidateId(String(schoolCode), seq);
    await supabase.from("students").update({ "candidate_id": cid, "status": "active" }).eq("id", k.id);
    await supabase.from("candidate_id_events").insert({ "student_id": k.id, "school_id": linkedId, "roster_batch_id": recordId, "candidate_id": cid, "event_code": "generated", "actor_id": actorUuid(actor) });
  }
  await createAuditEvent({ sourceModule: "student_roster_ops", action: "generate_candidate_ids", actor, entityType: "student_roster_batches", entityId: String(recordId ?? ""), reason: "locked roster: candidate IDs generated + students set eligible" });
}

async function effect_CHAIN_004(supabase: Db, recordId: string, actor: Actor): Promise<void> {
  const now = new Date().toISOString();
  const { data: src } = await supabase.from("finance_invoices").select("*").eq("id", recordId).maybeSingle();
  if (!src) return;
  const row = src as Record<string, unknown>;
  const linkedId = row["participation_id"] as string | undefined;
  if (!linkedId) return;
  await supabase.from("participations").update({ "payment_status": "paid" }).eq("id", linkedId);
  await createAuditEvent({ sourceModule: "finance_ops", action: "payment_gate_opened", actor, entityType: "participations", entityId: String(linkedId ?? ""), newStatus: "paid", reason: "invoice paid -> participation payment gate opened" });
}

export const TRANSITION_EFFECTS: Record<string, (supabase: Db, recordId: string, actor: Actor) => Promise<void>> = {
  "school_onboarding_ops:activate": effect_CHAIN_002,
  "student_roster_ops:lock": effect_CHAIN_003,
  "finance_ops:mark_paid": effect_CHAIN_004,
};

export async function runTransitionEffect(moduleId: string, action: string, supabase: Db, recordId: string, actor: Actor): Promise<void> {
  const fn = TRANSITION_EFFECTS[`${moduleId}:${action}`];
  if (!fn) return;
  try { await fn(supabase, recordId, actor); } catch { /* best-effort: the transition already applied */ }
}
