// FR-SCHOOL-CRM-2026-0005 — follow-up automation (task + reminders) + edit-with-reason.
// P4.6 dimensions: functional, security (OWASP), concurrency.
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Actor } from "@/server/types";

const h = vi.hoisted(() => ({
  inserts: [] as Array<{ table: string; row: Record<string, unknown> }>,
  updates: [] as Array<{ table: string; patch: Record<string, unknown> }>,
  audits: [] as Array<Record<string, unknown>>,
  listData: {} as Record<string, Array<Record<string, unknown>>>,
  singles: {} as Record<string, Record<string, unknown> | null>,
  ids: {} as Record<string, number>,
}));

// Chainable Supabase mock supporting insert/update/select/eq/order/single/maybeSingle and direct-await insert.
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    from(table: string) {
      const ctx: { last?: { data: unknown; error: null } } = {};
      const nextId = () => { h.ids[table] = (h.ids[table] ?? 0) + 1; return `${table}-${h.ids[table]}`; };
      const b: Record<string, unknown> = {
        insert(row: Record<string, unknown> | Array<Record<string, unknown>>) {
          (Array.isArray(row) ? row : [row]).forEach((r) => h.inserts.push({ table, row: r }));
          ctx.last = { data: { id: nextId(), ...(Array.isArray(row) ? {} : row) }, error: null };
          return b;
        },
        update(patch: Record<string, unknown>) { h.updates.push({ table, patch }); ctx.last = { data: { id: `${table}-upd`, ...patch }, error: null }; return b; },
        select() { return b; },
        eq() { return b; },
        order: async () => ({ data: h.listData[table] ?? [] }),
        single: async () => ctx.last ?? { data: h.singles[table] ?? null, error: null },
        maybeSingle: async () => ctx.last ?? { data: h.singles[table] ?? null },
        then: (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) => Promise.resolve(ctx.last ?? { data: h.singles[table] ?? null, error: null }).then(res, rej),
      };
      return b;
    },
  }),
}));
vi.mock("@/server/audit/createAuditEvent", () => ({ createAuditEvent: async (a: Record<string, unknown>) => { h.audits.push(a); } }));

import { addInteraction, editInteraction } from "@/server/crm/leadService";

const LEAD = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const IID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const actor: Actor = { actor_id: "11111111-1111-1111-1111-111111111111", actor_type: "staff", roles: ["sales_school_outreach_executive"], scopes: ["region:Delhi"] };
const byTable = (t: string) => h.inserts.filter((i) => i.table === t);

beforeEach(() => { h.inserts = []; h.updates = []; h.audits = []; h.listData = {}; h.singles = {}; h.ids = {}; });

describe("FR-0005 functional: follow-up automation on add", () => {
  it("with next_followup_at -> creates a system_follow_up task + two reminders + audit", async () => {
    await addInteraction(actor, LEAD, { interaction_type: "call", summary: "spoke", next_followup_at: "2026-07-01" });
    expect(byTable("work_tasks")).toHaveLength(1);
    expect(byTable("work_tasks")[0].row.task_type).toBe("system_follow_up");
    const notifs = byTable("notification_events");
    expect(notifs).toHaveLength(2);
    expect(notifs.map((n) => n.row.recipient_resolver).sort()).toEqual(["lead_owner", "sales_manager"]);
    expect(h.audits.some((a) => a.action === "schedule_followup")).toBe(true);
  });

  it("without next_followup_at -> no task, no reminders", async () => {
    await addInteraction(actor, LEAD, { interaction_type: "call", summary: "spoke" });
    expect(byTable("work_tasks")).toHaveLength(0);
    expect(byTable("notification_events")).toHaveLength(0);
    expect(h.audits.some((a) => a.action === "schedule_followup")).toBe(false);
  });

  it("reuses the CRM_FOLLOWUP queue when it already exists (no new queue insert)", async () => {
    h.singles["task_queues"] = { id: "queue-existing" };
    await addInteraction(actor, LEAD, { interaction_type: "demo", summary: "x", next_followup_at: "2026-07-02" });
    expect(byTable("task_queues")).toHaveLength(0);   // not re-created
    expect(byTable("work_tasks")).toHaveLength(1);    // task still created against the existing queue
  });
});

describe("FR-0005 functional: edit-with-reason", () => {
  beforeEach(() => { h.singles["school_lead_interactions"] = { id: IID, interaction_type: "call", summary: "old", outcome: null, next_followup_at: null, interaction_status: "recorded" }; });

  it("updates editable fields and sets interaction_status='edited'", async () => {
    await editInteraction(actor, LEAD, IID, { summary: "corrected", outcome: "positive", reason: "fixed a typo" });
    const upd = h.updates.find((u) => u.table === "school_lead_interactions");
    expect(upd?.patch.summary).toBe("corrected");
    expect(upd?.patch.outcome).toBe("positive");
    expect(upd?.patch.interaction_status).toBe("edited");
  });

  it("writes an audit event with the reason + previous status + original snapshot", async () => {
    await editInteraction(actor, LEAD, IID, { summary: "v2", reason: "context changed" });
    const ev = h.audits.find((a) => a.action === "edit_interaction");
    expect(ev?.reason).toBe("context changed");
    expect(ev?.previousStatus).toBe("recorded");
    expect(ev?.newStatus).toBe("edited");
    expect(String(ev?.externalReference)).toContain("old"); // original summary retained (P2.11)
  });

  it("rejects editing a non-existent interaction", async () => {
    h.singles["school_lead_interactions"] = null;
    await expect(editInteraction(actor, LEAD, IID, { summary: "x", reason: "r" })).rejects.toThrow();
  });
});

describe("FR-0005 security (OWASP)", () => {
  beforeEach(() => { h.singles["school_lead_interactions"] = { id: IID, interaction_type: "call", summary: "old", interaction_status: "recorded" }; });

  it("A01/A04: edit without a reason is rejected", async () => {
    await expect(editInteraction(actor, LEAD, IID, { summary: "x" })).rejects.toThrow();
    expect(h.updates).toHaveLength(0);
  });
  it("A03: edit with out-of-enum interaction_type/outcome is rejected", async () => {
    await expect(editInteraction(actor, LEAD, IID, { interaction_type: "hack", reason: "r" })).rejects.toThrow();
    await expect(editInteraction(actor, LEAD, IID, { outcome: "nope", reason: "r" })).rejects.toThrow();
  });
  it("A08: edit cannot change server-owned fields (staff_owner_id / interaction_code / status)", async () => {
    await editInteraction(actor, LEAD, IID, { summary: "x", reason: "r", staff_owner_id: "99999999-9999-9999-9999-999999999999", interaction_code: "LINT-FORGED" });
    const upd = h.updates.find((u) => u.table === "school_lead_interactions");
    expect(upd?.patch.staff_owner_id).toBeUndefined();
    expect(upd?.patch.interaction_code).toBeUndefined();
    expect(upd?.patch.interaction_status).toBe("edited"); // server-controlled, not the client value
  });
  it("A09: every edit is audited (non-repudiation)", async () => {
    await editInteraction(actor, LEAD, IID, { summary: "x", reason: "r" });
    expect(h.audits.filter((a) => a.action === "edit_interaction")).toHaveLength(1);
  });
});

describe("FR-0005 concurrency", () => {
  it("two parallel follow-up adds -> distinct reminder idempotency keys", async () => {
    await Promise.all([
      addInteraction(actor, LEAD, { interaction_type: "call", summary: "a", next_followup_at: "2026-07-01" }),
      addInteraction(actor, LEAD, { interaction_type: "call", summary: "b", next_followup_at: "2026-07-01" }),
    ]);
    const keys = byTable("notification_events").map((n) => n.row.event_idempotency_key);
    expect(keys).toHaveLength(4);
    expect(new Set(keys).size).toBe(4); // unique per interaction per resolver
  });
});
