import crypto from "node:crypto";
import { db } from "@/server/core/db";
import type { ResolvedActor } from "@/server/auth/resolveActor";

export async function writeAuditEvent(input: {
  sourceModule: string;
  action: string;
  actor: ResolvedActor;
  entityType: string;
  entityId: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  reason?: string | null;
  requestId?: string | null;
  jobId?: string | null;
  risk?: "low" | "medium" | "high" | "critical";
  safeSnapshot?: Record<string, unknown>;
}) {
  const auditEventId = `aud_${crypto.randomUUID()}`;
  const eventHash = crypto
    .createHash("sha256")
    .update(JSON.stringify({ auditEventId, ...input, created_at: new Date().toISOString() }))
    .digest("hex");

  await db.execute(
    `insert into audit_events (
      audit_event_id, source_module, action, actor_id, actor_type, role_snapshot, scope_snapshot,
      entity_type, entity_id, previous_status, new_status, reason, request_id, job_id, risk, safe_snapshot, event_hash
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
    [
      auditEventId,
      input.sourceModule,
      input.action,
      input.actor.actor_id,
      input.actor.actor_type,
      JSON.stringify(input.actor.roles),
      JSON.stringify(input.actor.scopes),
      input.entityType,
      input.entityId,
      input.previousStatus ?? null,
      input.newStatus ?? null,
      input.reason ?? null,
      input.requestId ?? null,
      input.jobId ?? null,
      input.risk ?? "medium",
      JSON.stringify(input.safeSnapshot ?? {}),
      eventHash
    ]
  );

  return { audit_event_id: auditEventId, event_hash: eventHash };
}
