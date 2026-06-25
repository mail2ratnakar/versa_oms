// Notify-on-alert (FR-INCIDENT-NOTIFY-2026-0035 — negative pack WF-015-NEG-006). When a security incident
// is opened (audit tamper / permission drift / suspicious login), raise a notification_event so the security
// team is alerted via the existing fan-out (idempotent per incident; suppressed cleanly if no template yet).
import { raiseNotificationEvent } from "@/server/notifications/fanout";
import type { Actor } from "@/server/types";

type Db = ReturnType<typeof import("@/lib/supabase/admin").createSupabaseAdminClient>;

export async function notifyIncidentOpened(
  supabase: Db,
  incident: { id: string; code: string; summary: string; severity: string },
  actor: Actor
): Promise<void> {
  await raiseNotificationEvent(supabase, {
    event_code: "security_incident_opened",
    event_idempotency_key: "security_incident_opened:" + incident.code,
    source_module: "security_audit_console",
    source_entity: "security_incidents",
    source_entity_id: incident.id,
    event_payload: { incident_code: incident.code, severity: incident.severity, message: incident.summary },
    recipient_resolver: "security_team",
  }, actor);
}
