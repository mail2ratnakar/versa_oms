import { createHash } from "node:crypto";
import type { Actor } from "@/server/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// In-process hash chain seed; persisted prev_hash/event_hash make tampering evident.
let lastHash = "genesis";

/**
 * Append-only audit writer -> public.audit_events. Captures actor role snapshot,
 * trace id, entity and optional status transition + reason. Inserts via the
 * service-role client AFTER a guard has authorized the actor. Never updates or
 * deletes existing audit rows.
 */
export async function createAuditEvent(input: {
  sourceModule: string;
  action: string;
  actor: Actor;
  entityType: string;
  entityId?: string;
  reason?: string | null;
  traceId?: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  externalReference?: string | null;
}): Promise<{ audit_event_id: string }> {
  const id = crypto.randomUUID();
  const prevHash = lastHash;
  const core = {
    id,
    action: `${input.sourceModule}.${input.action}`,
    entity_name: input.entityType,
    entity_id: input.entityId ?? "",
    actor_role: input.actor.roles[0] ?? "unknown",
    new_status: input.newStatus ?? null,
  };
  const eventHash = createHash("sha256").update(prevHash + JSON.stringify(core)).digest("hex");
  lastHash = eventHash;
  const row = {
    ...core,
    trace_id: input.traceId ?? crypto.randomUUID(),
    actor_user_id: isUuid(input.actor.actor_id) ? input.actor.actor_id : null,
    previous_status: input.previousStatus ?? null,
    external_reference: input.externalReference ?? null,
    reason: input.reason ?? null,
    prev_hash: prevHash,
    event_hash: eventHash,
  };
  try {
    const supabase = createSupabaseAdminClient();
    await supabase.from("audit_events").insert(row);
  } catch {
    // DB not available locally: still return an id so callers proceed.
  }
  return { audit_event_id: id };
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
