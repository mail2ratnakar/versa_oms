// Notification fan-out (FRAMEWORK — FR-NOTIFY-FANOUT-0014). The missing nervous system: turn a raised
// notification_event into a batch of resolved recipients. Honors the spec — every batch renders from
// an APPROVED/active template (template_id is required); an event with no active template is SUPPRESSED
// and surfaced (a config gap), never bypassed. resolveRecipients is pure (unit-tested).
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import type { Actor } from "@/server/types";

type Db = ReturnType<typeof createSupabaseAdminClient>;

export type FanoutEvent = { event_code: string; school_id?: string | null; participation_id?: string | null; recipient_resolver: string };
export type ResolvedRecipient = { recipient_key: string; recipient_type: string; recipient_entity_id: string | null; school_id: string | null; channel: string; channel_address: string };

function isUuid(s: string): boolean { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s); }

// Map an event's recipient_resolver -> concrete recipients (in-app routing addresses). Pure.
export function resolveRecipients(event: FanoutEvent, channel: string): ResolvedRecipient[] {
  const r = (event.recipient_resolver || "").toLowerCase();
  if (r.includes("school") || r.includes("coordinator")) {
    if (!event.school_id) return [];
    return [{ recipient_key: `school:${event.school_id}`, recipient_type: "school_user", recipient_entity_id: event.school_id, school_id: event.school_id, channel, channel_address: `school:${event.school_id}` }];
  }
  if (r.includes("ops") || r.includes("staff") || r.includes("manager") || r.includes("admin") || r.includes("approver")) {
    return [{ recipient_key: `staff:${r}`, recipient_type: "staff_user", recipient_entity_id: null, school_id: event.school_id ?? null, channel, channel_address: `inbox:${r}` }];
  }
  return [];
}

export type FanoutResult = { event_id: string; fanned: boolean; reason?: string; batch_id?: string; recipients?: number };

export async function fanoutEvent(supabase: Db, eventId: string, actor: Actor): Promise<FanoutResult> {
  const { data: ev } = await supabase.from("notification_events").select("*").eq("id", eventId).maybeSingle();
  if (!ev) return { event_id: eventId, fanned: false, reason: "event not found" };
  const e = ev as Record<string, unknown>;
  if (String(e.status) !== "created") return { event_id: eventId, fanned: false, reason: `already ${e.status}` };

  // Resolve an APPROVED/active template for this event (governed messaging — never bypass).
  const { data: tmpls } = await supabase.from("notification_templates").select("id, channel").eq("event_code", e.event_code).eq("status", "active").limit(1);
  const template = (tmpls ?? [])[0] as Record<string, unknown> | undefined;
  if (!template) {
    await supabase.from("notification_events").update({ status: "suppressed" }).eq("id", eventId);
    await createAuditEvent({ sourceModule: "notification_ops", action: "fanout_suppressed", actor, entityType: "notification_events", entityId: eventId, newStatus: "suppressed", reason: `no active template for event_code '${String(e.event_code)}'` });
    return { event_id: eventId, fanned: false, reason: `no active template for '${String(e.event_code)}'` };
  }

  const channel = String(template.channel ?? "in_app");
  const recipients = resolveRecipients(
    { event_code: String(e.event_code), school_id: e.school_id as string | null, participation_id: e.participation_id as string | null, recipient_resolver: String(e.recipient_resolver ?? "") },
    channel
  );

  const { data: batchRows, error: be } = await supabase.from("notification_batches").insert({
    batch_code: "NB-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    batch_type: "event_triggered",
    template_id: template.id,
    source_module: e.source_module,
    source_entity_type: e.source_entity,
    source_entity_id: e.source_entity_id,
    recipient_scope_snapshot: { resolver: e.recipient_resolver, school_id: e.school_id ?? null },
    recipient_count: recipients.length,
    batch_status: "queued",
    created_by: isUuid(actor.actor_id) ? actor.actor_id : null,
  }).select("id").single();
  if (be || !batchRows) return { event_id: eventId, fanned: false, reason: "batch insert failed" };
  const batchId = String((batchRows as Record<string, unknown>).id);

  if (recipients.length) {
    const { error: re } = await supabase.from("notification_recipients").insert(
      recipients.map((rc) => ({
        batch_id: batchId, recipient_key: rc.recipient_key, recipient_type: rc.recipient_type,
        recipient_entity_id: rc.recipient_entity_id, school_id: rc.school_id, channel: rc.channel,
        channel_address: rc.channel_address, recipient_status: "resolved",
      }))
    );
    if (re) return { event_id: eventId, fanned: false, reason: "recipient insert failed" }; // never a batch with phantom recipients (P4.5)
  }
  await supabase.from("notification_events").update({ status: "queued" }).eq("id", eventId);
  await createAuditEvent({ sourceModule: "notification_ops", action: "fanout", actor, entityType: "notification_events", entityId: eventId, newStatus: "queued", reason: `fanned out to ${recipients.length} recipient(s) via template ${batchId}` });
  return { event_id: eventId, fanned: true, batch_id: batchId, recipients: recipients.length };
}

export async function drainPendingEvents(actor: Actor): Promise<{ processed: number; fanned: number; suppressed: number }> {
  const supabase = createSupabaseAdminClient();
  const { data: events } = await supabase.from("notification_events").select("id").eq("status", "created").is("archived_at", null).limit(100);
  let fanned = 0, suppressed = 0;
  for (const ev of (events ?? []) as Array<{ id: string }>) {
    const r = await fanoutEvent(supabase, ev.id, actor);
    if (r.fanned) fanned += 1; else suppressed += 1;
  }
  return { processed: (events ?? []).length, fanned, suppressed };
}
