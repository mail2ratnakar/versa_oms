// Audit tamper-evidence verifier (FR-SECURITY-AUDIT-VERIFY-2026-0026). Each audit_events row commits to
// sha256(prev_hash + canonical-core); recomputing it from the STORED row detects any tampering/forgery of
// the audited action/entity/actor/status. PURE — reuses createAuditEvent's auditCore/auditEventHash so it
// can never drift from the writer. Unit-tested.
import { auditCore, auditEventHash } from "@/server/audit/createAuditEvent";

export type AuditRow = {
  id: string; action?: string | null; entity_name?: string | null; entity_id?: string | null;
  actor_role?: string | null; new_status?: string | null; prev_hash?: string | null; event_hash?: string | null;
};

export function verifyAuditEvent(row: AuditRow): boolean {
  const core = auditCore({
    id: String(row.id), action: String(row.action ?? ""), entityType: String(row.entity_name ?? ""),
    entityId: row.entity_id ?? "", actorRole: String(row.actor_role ?? ""), newStatus: row.new_status ?? null,
  });
  return auditEventHash(String(row.prev_hash ?? ""), core) === row.event_hash;
}

export function verifyAuditChain(rows: AuditRow[]): { ok: boolean; checked: number; tampered: number; tampered_ids: string[] } {
  const tampered_ids = rows.filter((r) => !verifyAuditEvent(r)).map((r) => String(r.id));
  return { ok: tampered_ids.length === 0, checked: rows.length, tampered: tampered_ids.length, tampered_ids };
}
