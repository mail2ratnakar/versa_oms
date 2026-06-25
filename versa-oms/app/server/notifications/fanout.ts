// Notification fan-out (FRAMEWORK — FR-NOTIFY-FANOUT-0014). The missing nervous system: turn a raised
// notification_event into a batch of resolved recipients. Honors the spec — every batch renders from
// an APPROVED/active template (template_id is required); an event with no active template is SUPPRESSED
// and surfaced (a config gap), never bypassed. resolveRecipients is pure (unit-tested).
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createAuditEvent } from "@/server/audit/createAuditEvent";
import type { Actor } from "@/server/types";
import { createHash } from "node:crypto";

type Db = ReturnType<typeof createSupabaseAdminClient>;

export type FanoutEvent = { event_code: string; school_id?: string | null; participation_id?: string | null; recipient_resolver: string };
export type ResolvedRecipient = { recipient_key: string; recipient_type: string; recipient_entity_id: string | null; school_id: string | null; channel: string; channel_address: string };

function isUuid(s: string): boolean { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s); }

// Opt-out (FR-NOTIFY-OPTOUT-2026-0037 — negative pack WF-013-NEG-004). A notification_preferences row with
// is_enabled=false suppresses a contact on a channel. contactHash normalizes the address; filterOptedOut is
// PURE (unit-tested) so opted-out recipients are never delivered to.
export function contactHash(address: string): string {
  return createHash("sha256").update(String(address).trim().toLowerCase()).digest("hex");
}
export function filterOptedOut<T extends { channel_address?: string | null }>(recipients: T[], optedOutHashes: Set<string>): { kept: T[]; suppressed: number } {
  const kept = recipients.filter((r) => !(r.channel_address && optedOutHashes.has(contactHash(String(r.channel_address)))));
  return { kept, suppressed: recipients.length - kept.length };
}

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

// Pick the recipient's REAL delivery address for the channel (email / phone); fall back to the
// logical (entity-based) in-app address for in_app/push. Pure. (FR-NOTIFY-CHANNEL-0016)
export function channelAddressFor(channel: string, contact: { email?: string | null; mobile?: string | null }, logicalFallback: string): string {
  if (channel === "email") return contact.email || logicalFallback;
  if (channel.startsWith("sms") || channel.startsWith("whatsapp")) return contact.mobile || logicalFallback;
  return logicalFallback; // in_app / push_later — routed by entity, no mailbox needed
}

export type FanoutResult = { event_id: string; fanned: boolean; reason?: string; batch_id?: string; recipients?: number; suppressed_opt_out?: number };

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

  // Enrich each recipient with its REAL channel address (email/phone) so delivery can actually send.
  for (const rc of recipients) {
    if (rc.recipient_type === "school_user" && rc.school_id && (channel === "email" || channel.startsWith("sms") || channel.startsWith("whatsapp"))) {
      const { data: sch } = await supabase.from("schools").select("coordinator_email, coordinator_mobile").eq("id", rc.school_id).maybeSingle();
      const s = (sch ?? {}) as Record<string, unknown>;
      rc.channel_address = channelAddressFor(channel, { email: s.coordinator_email as string | null, mobile: s.coordinator_mobile as string | null }, rc.channel_address);
    }
    // staff_user: routed to an ops inbox (logical) — a per-staff mailbox lookup is a follow-up.
  }

  // Opt-out: drop recipients whose contact has opted out of this channel (is_enabled=false).
  const { data: prefs } = await supabase.from("notification_preferences").select("recipient_contact_hash").eq("channel", channel).eq("is_enabled", false);
  const optedOut = new Set(((prefs ?? []) as Array<Record<string, unknown>>).map((p) => String(p.recipient_contact_hash)));
  const { kept, suppressed } = filterOptedOut(recipients, optedOut);

  const { data: batchRows, error: be } = await supabase.from("notification_batches").insert({
    batch_code: "NB-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    batch_type: "event_triggered",
    template_id: template.id,
    source_module: e.source_module,
    source_entity_type: e.source_entity,
    source_entity_id: e.source_entity_id,
    recipient_scope_snapshot: { resolver: e.recipient_resolver, school_id: e.school_id ?? null, opted_out: suppressed },
    recipient_count: kept.length,
    batch_status: "queued",
    created_by: isUuid(actor.actor_id) ? actor.actor_id : null,
  }).select("id").single();
  if (be || !batchRows) return { event_id: eventId, fanned: false, reason: "batch insert failed" };
  const batchId = String((batchRows as Record<string, unknown>).id);

  if (kept.length) {
    const { error: re } = await supabase.from("notification_recipients").insert(
      kept.map((rc) => ({
        batch_id: batchId, recipient_key: rc.recipient_key, recipient_type: rc.recipient_type,
        recipient_entity_id: rc.recipient_entity_id, school_id: rc.school_id, channel: rc.channel,
        channel_address: rc.channel_address, recipient_status: "resolved",
      }))
    );
    if (re) return { event_id: eventId, fanned: false, reason: "recipient insert failed" }; // never a batch with phantom recipients (P4.5)
  }
  await supabase.from("notification_events").update({ status: "queued" }).eq("id", eventId);
  await createAuditEvent({ sourceModule: "notification_ops", action: "fanout", actor, entityType: "notification_events", entityId: eventId, newStatus: "queued", reason: `fanned out to ${kept.length} recipient(s)${suppressed ? ` (${suppressed} opted-out suppressed)` : ""} via template ${batchId}` });
  return { event_id: eventId, fanned: true, batch_id: batchId, recipients: kept.length, suppressed_opt_out: suppressed };
}

// Raise a notification event AND dispatch it immediately (FR-NOTIFY-AUTOTRIGGER-0017). Outbox pattern:
// persist the event first, then fan out best-effort — the drain endpoint is the backstop if dispatch
// fails. Used by effect chains (generated) + CRM, so a raised event reaches recipients without waiting
// for a drain. A duplicate idempotency key (already raised) is a no-op.
export async function raiseNotificationEvent(supabase: Db, values: Record<string, unknown>, actor: Actor): Promise<string | null> {
  const { data, error } = await supabase.from("notification_events").insert(values).select("id").single();
  if (error || !data) return null; // duplicate idempotency key / insert error -> already raised or nothing to dispatch
  const id = String((data as Record<string, unknown>).id);
  try { await fanoutEvent(supabase, id, actor); } catch { /* event persisted; the drain endpoint will retry */ }
  return id;
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
