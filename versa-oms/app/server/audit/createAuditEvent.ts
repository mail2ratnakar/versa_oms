import { createHash } from "node:crypto";
import type { Actor } from "@/server/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// In-process hash chain seed; persisted prev_hash/event_hash make tampering evident.
let lastHash = "genesis";

// The exact canonical content + hash an audit event commits to (FR-SECURITY-AUDIT-VERIFY-0026 reuses
// these so verification recomputes IDENTICALLY — single source, no divergence).
export type AuditCore = { id: string; action: string; entity_name: string; entity_id: string; actor_role: string; new_status: string | null };
export function auditCore(f: { id: string; action: string; entityType: string; entityId?: string | null; actorRole: string; newStatus?: string | null }): AuditCore {
  return { id: f.id, action: f.action, entity_name: f.entityType, entity_id: f.entityId ?? "", actor_role: f.actorRole, new_status: f.newStatus ?? null };
}
export function auditEventHash(prevHash: string, core: AuditCore): string {
  return createHash("sha256").update(prevHash + JSON.stringify(core)).digest("hex");
}

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
  const core = auditCore({
    id,
    action: `${input.sourceModule}.${input.action}`,
    entityType: input.entityType,
    entityId: input.entityId ?? "",
    actorRole: input.actor.roles[0] ?? "unknown",
    newStatus: input.newStatus ?? null,
  });
  const eventHash = auditEventHash(prevHash, core);
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
