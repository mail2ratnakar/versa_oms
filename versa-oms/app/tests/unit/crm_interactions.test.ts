// FR-SCHOOL-CRM-2026-0004 — Comms (lead interactions) write/read against the canonical
// school_lead_interactions schema. Tests across P4.6 dimensions: functional, security (OWASP), concurrency.
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Actor } from "@/server/types";

// Shared mock state (hoisted so the vi.mock factories can see it).
const h = vi.hoisted(() => ({ inserts: [] as Array<{ table: string; row: Record<string, unknown> }>, listData: [] as Array<Record<string, unknown>>, audits: [] as Array<Record<string, unknown>> }));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    from: (table: string) => ({
      insert: (row: Record<string, unknown>) => ({
        select: () => ({ single: async () => { h.inserts.push({ table, row }); return { data: { id: "int-1", ...row }, error: null }; } }),
      }),
      select: () => ({ eq: () => ({ order: async () => ({ data: h.listData }) }) }),
    }),
  }),
}));
vi.mock("@/server/audit/createAuditEvent", () => ({ createAuditEvent: async (a: Record<string, unknown>) => { h.audits.push(a); } }));

import { addInteraction, listInteractions } from "@/server/crm/leadService";

const LEAD = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const actor: Actor = { actor_id: "11111111-1111-1111-1111-111111111111", actor_type: "staff", roles: ["operations_executive"], scopes: ["region:Delhi"] };
const lastRow = () => h.inserts[h.inserts.length - 1].row;

beforeEach(() => { h.inserts = []; h.listData = []; h.audits = []; });

describe("FR-0004 functional: addInteraction writes canonical columns", () => {
  it("required-only add maps to the canonical schema with server-set fields", async () => {
    const res = await addInteraction(actor, LEAD, { interaction_type: "call", summary: "  spoke to coordinator  " });
    const row = lastRow();
    expect(h.inserts[0].table).toBe("school_lead_interactions");
    expect(row.school_lead_id).toBe(LEAD);                       // parent fk (was wrongly 'lead_id')
    expect(row.interaction_type).toBe("call");
    expect(row.summary).toBe("spoke to coordinator");            // trimmed
    expect(row.outcome).toBeNull();                              // optional -> null, not ""
    expect(row.next_followup_at).toBeNull();
    expect(row.staff_owner_id).toBe(actor.actor_id);            // server-set from actor (was 'created_by')
    expect(row.interaction_status).toBe("recorded");            // server default
    expect(String(row.interaction_code)).toMatch(/^LINT-[0-9A-F]{8}$/); // server-generated code (P2.4)
    expect(typeof row.interaction_at).toBe("string");
    expect((res as { applied: boolean }).applied).toBe(true);
  });

  it("persists optional outcome + next_followup_at when provided", async () => {
    await addInteraction(actor, LEAD, { interaction_type: "demo", summary: "ran demo", outcome: "positive", next_followup_at: "2026-07-01" });
    const row = lastRow();
    expect(row.outcome).toBe("positive");
    expect(row.next_followup_at).toBe("2026-07-01");
  });

  it("writes an audit event for the interaction", async () => {
    await addInteraction(actor, LEAD, { interaction_type: "note", summary: "note" });
    expect(h.audits).toHaveLength(1);
    expect(h.audits[0].action).toBe("record_interaction");
    expect(h.audits[0].entityType).toBe("school_lead_interactions");
  });

  it("rejects when required fields are missing (interaction_type, summary)", async () => {
    await expect(addInteraction(actor, LEAD, { summary: "no type" })).rejects.toThrow();
    await expect(addInteraction(actor, LEAD, { interaction_type: "call" })).rejects.toThrow();
    await expect(addInteraction(actor, LEAD, { interaction_type: "call", summary: "   " })).rejects.toThrow();
    expect(h.inserts).toHaveLength(0); // nothing written on validation failure
  });

  it("listInteractions returns the rows (empty state included)", async () => {
    expect((await listInteractions(actor, LEAD)).items).toEqual([]);
    h.listData = [{ id: "x", interaction_type: "call", summary: "s" }];
    expect((await listInteractions(actor, LEAD)).items).toHaveLength(1);
  });
});

describe("FR-0004 security (OWASP)", () => {
  it("A03: rejects out-of-enum interaction_type", async () => {
    await expect(addInteraction(actor, LEAD, { interaction_type: "hack", summary: "x" })).rejects.toThrow();
    expect(h.inserts).toHaveLength(0);
  });
  it("A03: rejects out-of-enum outcome", async () => {
    await expect(addInteraction(actor, LEAD, { interaction_type: "call", summary: "x", outcome: "wormhole" })).rejects.toThrow();
  });
  it("A03: 'system' interaction_type is not accepted from clients (machine-only)", async () => {
    await expect(addInteraction(actor, LEAD, { interaction_type: "system", summary: "x" })).rejects.toThrow();
  });
  it("A08 mass-assignment: client-supplied server-owned fields are ignored", async () => {
    await addInteraction(actor, LEAD, {
      interaction_type: "call", summary: "x",
      staff_owner_id: "99999999-9999-9999-9999-999999999999", // attacker tries to forge owner
      interaction_code: "LINT-DEADBEEF",                       // and the code
      interaction_status: "archived",                          // and the status
      id: "forged-id",
    });
    const row = lastRow();
    expect(row.staff_owner_id).toBe(actor.actor_id);           // not the forged value
    expect(row.interaction_code).not.toBe("LINT-DEADBEEF");    // server-generated
    expect(row.interaction_status).toBe("recorded");           // server-set
    expect(row.id).toBeUndefined();                            // not a mapped column
  });
  it("A03: arbitrary text in summary is stored verbatim (parameterized, not interpreted)", async () => {
    const payload = "Robert'); DROP TABLE school_lead_interactions;-- <script>alert(1)</script>";
    await addInteraction(actor, LEAD, { interaction_type: "note", summary: payload });
    expect(lastRow().summary).toBe(payload);                    // stored as-is via the driver's parameterization
  });
});

describe("FR-0004 concurrency", () => {
  it("two parallel adds get DISTINCT interaction_code (P2.4 unique under interleaving)", async () => {
    await Promise.all([
      addInteraction(actor, LEAD, { interaction_type: "call", summary: "a" }),
      addInteraction(actor, LEAD, { interaction_type: "call", summary: "b" }),
    ]);
    const codes = h.inserts.map((i) => i.row.interaction_code);
    expect(codes).toHaveLength(2);
    expect(new Set(codes).size).toBe(2);
  });
});
