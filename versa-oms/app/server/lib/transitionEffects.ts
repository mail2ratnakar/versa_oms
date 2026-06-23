import { createAuditEvent } from "@/server/audit/createAuditEvent";
import type { Actor } from "@/server/types";

/**
 * Post-transition effect chains (the cross-module CHAINs). Registered by
 * `moduleId:action`; the kernel runs the matching effect after a transition
 * applies. Effects are best-effort (the transition itself already succeeded).
 */
type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;

// CHAIN-002 — onboarding activation → school portal access.
async function activateSchool(supabase: Db, caseId: string, actor: Actor): Promise<void> {
  const { data: oc } = await supabase.from("school_onboarding_cases").select("school_id").eq("id", caseId).maybeSingle();
  const schoolId = (oc as { school_id?: string } | null)?.school_id;
  if (!schoolId) return;

  // 1 + 2 + 4 — school active, portal access + roster upload enabled
  await supabase.from("schools").update({ status: "active", portal_enabled: true, roster_upload_enabled: true, updated_at: new Date().toISOString() }).eq("id", schoolId);

  // 3 — school notified (raise a notification event for the delivery pipeline)
  await supabase.from("notification_events").insert({
    event_code: "school_activated",
    event_idempotency_key: `school_activated:${schoolId}`,
    source_module: "school_onboarding_ops",
    source_entity: "schools",
    source_entity_id: schoolId,
    event_payload: { message: "Your school is active — you can now upload your student roster." },
    recipient_resolver: "school_coordinator",
  });

  // 5 — audit
  await createAuditEvent({ sourceModule: "school_onboarding_ops", action: "activate_school", actor, entityType: "schools", entityId: schoolId, newStatus: "active", reason: `activated from onboarding ${caseId}` });
}

export const TRANSITION_EFFECTS: Record<string, (supabase: Db, recordId: string, actor: Actor) => Promise<void>> = {
  "school_onboarding_ops:activate": activateSchool,
};

export async function runTransitionEffect(moduleId: string, action: string, supabase: Db, recordId: string, actor: Actor): Promise<void> {
  const fn = TRANSITION_EFFECTS[`${moduleId}:${action}`];
  if (!fn) return;
  try {
    await fn(supabase, recordId, actor);
  } catch {
    /* best-effort: the transition already applied */
  }
}
