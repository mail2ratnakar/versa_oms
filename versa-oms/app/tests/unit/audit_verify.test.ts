import { describe, it, expect } from "vitest";
import { auditCore, auditEventHash } from "@/server/audit/createAuditEvent";
import { verifyAuditEvent, verifyAuditChain, type AuditRow } from "@/server/audit/verifyAuditChain";

// A self-consistent audit row (event_hash matches its fields) — exactly how createAuditEvent writes it.
function validRow(over: Partial<AuditRow> = {}): AuditRow {
  const id = String(over.id ?? "11111111-1111-4111-8111-111111111111");
  const prev_hash = String(over.prev_hash ?? "genesis");
  const core = auditCore({ id, action: "mod.act", entityType: "schools", entityId: "e1", actorRole: "super_admin", newStatus: "active" });
  return { id, action: core.action, entity_name: core.entity_name, entity_id: core.entity_id, actor_role: core.actor_role, new_status: core.new_status, prev_hash, event_hash: auditEventHash(prev_hash, core) };
}

describe("audit tamper-evidence (FR-SECURITY-AUDIT-VERIFY-2026-0026)", () => {
  it("verifies an untampered event", () => {
    expect(verifyAuditEvent(validRow())).toBe(true);
  });
  it("detects a tampered action / entity / actor / status (hash no longer matches)", () => {
    expect(verifyAuditEvent({ ...validRow(), action: "mod.HACKED" })).toBe(false);
    expect(verifyAuditEvent({ ...validRow(), entity_id: "other-entity" })).toBe(false);
    expect(verifyAuditEvent({ ...validRow(), actor_role: "attacker" })).toBe(false);
    expect(verifyAuditEvent({ ...validRow(), new_status: "tampered" })).toBe(false);
  });
  it("detects a forged event_hash", () => {
    expect(verifyAuditEvent({ ...validRow(), event_hash: "deadbeef" })).toBe(false);
  });
  it("chain summary flags exactly the tampered rows", () => {
    const r = verifyAuditChain([
      validRow({ id: "11111111-1111-4111-8111-111111111111" }),
      { ...validRow({ id: "22222222-2222-4222-8222-222222222222" }), actor_role: "attacker" },
      validRow({ id: "33333333-3333-4333-8333-333333333333" }),
    ]);
    expect(r.checked).toBe(3);
    expect(r.tampered).toBe(1);
    expect(r.tampered_ids).toEqual(["22222222-2222-4222-8222-222222222222"]);
    expect(r.ok).toBe(false);
  });
});
