// FR-SCHOOL-CRM-2026-0006 — parent-scope enforcement on CRM record actions + sub-collections
// (OWASP A01 IDOR). Tests recordInScope directly and the service-level fail-closed enforcement.
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Actor } from "@/server/types";
import { recordInScope } from "@/server/security/scope";

const h = vi.hoisted(() => ({
  inserts: [] as Array<{ table: string; row: Record<string, unknown> }>,
  updates: [] as Array<{ table: string; patch: Record<string, unknown> }>,
  audits: [] as Array<Record<string, unknown>>,
  listData: {} as Record<string, Array<Record<string, unknown>>>,
  singles: {} as Record<string, Record<string, unknown> | null>,
  ids: {} as Record<string, number>,
}));

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
        in() { return b; },
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

import { addInteraction, listInteractions, editInteraction, setStage } from "@/server/crm/leadService";

const LEAD = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const IID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const ME = "11111111-1111-1111-1111-111111111111";
const exec: Actor = { actor_id: ME, actor_type: "staff", roles: ["sales_school_outreach_executive"], scopes: ["region:Delhi"] };
const globalStaff: Actor = { actor_id: ME, actor_type: "staff", roles: ["operations_head"], scopes: ["global"] };
const byTable = (t: string) => h.inserts.filter((i) => i.table === t);

beforeEach(() => { h.inserts = []; h.updates = []; h.audits = []; h.listData = {}; h.singles = {}; h.ids = {}; });

describe("FR-0006 recordInScope (unit)", () => {
  it("global / unscoped staff are unrestricted", () => {
    expect(recordInScope(globalStaff, "school_leads", { state: "Mumbai" }, "lead_owner_id")).toBe(true);
  });
  it("region-scoped staff: in-region record passes, out-of-region fails", () => {
    expect(recordInScope(exec, "school_leads", { state: "Delhi" }, "lead_owner_id")).toBe(true);
    expect(recordInScope(exec, "school_leads", { state: "Mumbai" }, "lead_owner_id")).toBe(false);
  });
  it("ownership escape hatch: an owned out-of-region record still passes ('assigned OR region')", () => {
    expect(recordInScope(exec, "school_leads", { state: "Mumbai", lead_owner_id: ME }, "lead_owner_id")).toBe(true);
    expect(recordInScope(exec, "school_leads", { state: "Mumbai", lead_owner_id: "someone-else" }, "lead_owner_id")).toBe(false);
  });
  it("school actors are not restricted by staff-assignment scope here", () => {
    const school: Actor = { actor_id: "s", actor_type: "school", roles: ["school_coordinator"], scopes: ["school:s1"], school_id: "s1" };
    expect(recordInScope(school, "school_leads", { state: "Mumbai" }, "lead_owner_id")).toBe(true);
  });
});

describe("FR-0006 service enforcement (OWASP A01 IDOR)", () => {
  it("add: rejects an interaction on an out-of-scope lead, writes nothing", async () => {
    h.singles["school_leads"] = { id: LEAD, state: "Mumbai", lead_owner_id: "other" };
    await expect(addInteraction(exec, LEAD, { interaction_type: "call", summary: "x" })).rejects.toMatchObject({ fieldErrors: [{ message: expect.stringMatching(/scope/i) }] });
    expect(byTable("school_lead_interactions")).toHaveLength(0);
  });
  it("add: allows an interaction on an in-scope lead", async () => {
    h.singles["school_leads"] = { id: LEAD, state: "Delhi", lead_owner_id: "other" };
    await addInteraction(exec, LEAD, { interaction_type: "call", summary: "x" });
    expect(byTable("school_lead_interactions")).toHaveLength(1);
  });
  it("setStage: rejects on an out-of-scope lead (row action)", async () => {
    h.singles["school_leads"] = { id: LEAD, state: "Mumbai", lead_owner_id: "other" };
    await expect(setStage(exec, LEAD, "contacted")).rejects.toMatchObject({ fieldErrors: [{ message: expect.stringMatching(/scope/i) }] });
    expect(h.updates).toHaveLength(0);
  });
  it("edit: rejects on an out-of-scope lead", async () => {
    h.singles["school_leads"] = { id: LEAD, state: "Mumbai", lead_owner_id: "other" };
    await expect(editInteraction(exec, LEAD, IID, { summary: "x", reason: "r" })).rejects.toMatchObject({ fieldErrors: [{ message: expect.stringMatching(/scope/i) }] });
  });
  it("list: returns empty for an out-of-scope lead (no leak)", async () => {
    h.singles["school_leads"] = { id: LEAD, state: "Mumbai", lead_owner_id: "other" };
    h.listData["school_lead_interactions"] = [{ id: IID, summary: "secret" }];
    expect((await listInteractions(exec, LEAD)).items).toEqual([]);
  });
  it("global staff bypass the per-record check (no false-deny)", async () => {
    h.singles["school_leads"] = { id: LEAD, state: "Mumbai", lead_owner_id: "other" };
    await addInteraction(globalStaff, LEAD, { interaction_type: "call", summary: "x" });
    expect(byTable("school_lead_interactions")).toHaveLength(1);
  });
});
