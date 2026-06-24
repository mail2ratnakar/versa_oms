// FR-SCHOOL-CRM-2026-0009 (CR-C) — duplicate review: import surfacing, resolve, merge, convert-block.
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
        is() { return b; },
        in() { return b; },
        order: async () => ({ data: h.listData[table] ?? [] }),
        single: async () => ctx.last ?? { data: h.singles[table] ?? null, error: null },
        maybeSingle: async () => ctx.last ?? { data: h.singles[table] ?? null },
        then: (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) => Promise.resolve(ctx.last ?? { data: h.listData[table] ?? [], error: null }).then(res, rej),
      };
      return b;
    },
  }),
}));
vi.mock("@/server/audit/createAuditEvent", () => ({ createAuditEvent: async (a: Record<string, unknown>) => { h.audits.push(a); } }));

import { resolveDuplicate, mergeDuplicate, convertLead, importLeads, commitImport } from "@/server/crm/leadService";

const LEAD = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const TARGET = "cccccccc-cccc-cccc-cccc-cccccccccccc";
const global: Actor = { actor_id: "11111111-1111-1111-1111-111111111111", actor_type: "staff", roles: ["operations_head"], scopes: ["global"] };
const scoped: Actor = { actor_id: "22222222-2222-2222-2222-222222222222", actor_type: "staff", roles: ["sales_school_outreach_executive"], scopes: ["region:Delhi"] };
const leadRow = (o: Record<string, string> = {}) => ({ school_name: "S", city: "Delhi", state: "Delhi", country: "India", lead_source: "referral", ...o });
const upd = (t: string) => h.updates.filter((u) => u.table === t);

beforeEach(() => { h.inserts = []; h.updates = []; h.audits = []; h.listData = {}; h.singles = {}; h.ids = {}; });

describe("FR-0009 resolveDuplicate", () => {
  beforeEach(() => { h.singles["school_leads"] = { id: LEAD, state: "Delhi", duplicate_status: "possible_duplicate", lead_status: "duplicate_review" }; });
  it("not_duplicate clears review (lead_status active, pointer null)", async () => {
    await resolveDuplicate(global, LEAD, "not_duplicate");
    const p = upd("school_leads")[0].patch;
    expect(p.duplicate_status).toBe("not_duplicate");
    expect(p.lead_status).toBe("active");
    expect(p.duplicate_of_lead_id).toBeNull();
  });
  it("confirmed_duplicate sets status without reactivating", async () => {
    await resolveDuplicate(global, LEAD, "confirmed_duplicate");
    const p = upd("school_leads")[0].patch;
    expect(p.duplicate_status).toBe("confirmed_duplicate");
    expect(p.lead_status).toBeUndefined();
  });
  it("A03: rejects an out-of-enum resolution", async () => {
    await expect(resolveDuplicate(global, LEAD, "whatever")).rejects.toThrow();
  });
  it("A01: rejects resolving an out-of-scope lead", async () => {
    h.singles["school_leads"] = { id: LEAD, state: "Mumbai", lead_owner_id: "other", duplicate_status: "possible_duplicate" };
    await expect(resolveDuplicate(scoped, LEAD, "not_duplicate")).rejects.toMatchObject({ fieldErrors: [{ message: expect.stringMatching(/scope/i) }] });
  });
});

describe("FR-0009 mergeDuplicate", () => {
  beforeEach(() => { h.singles["school_leads"] = { id: LEAD, state: "Delhi" }; });
  it("re-parents interactions and archives the merged lead, audited", async () => {
    await mergeDuplicate(global, LEAD, { target_lead_id: TARGET, reason: "same school" });
    expect(upd("school_lead_interactions")[0].patch.school_lead_id).toBe(TARGET); // history preserved (moved)
    const lead = upd("school_leads")[0].patch;
    expect(lead.duplicate_status).toBe("merged");
    expect(lead.lead_status).toBe("archived");
    expect(lead.duplicate_of_lead_id).toBe(TARGET);
    const ev = h.audits.find((a) => a.action === "merge_duplicate");
    expect(ev?.reason).toBe("same school");
    expect(String(ev?.externalReference)).toContain(TARGET);
  });
  it("requires reason and target, and rejects self-merge", async () => {
    await expect(mergeDuplicate(global, LEAD, { target_lead_id: TARGET })).rejects.toThrow();
    await expect(mergeDuplicate(global, LEAD, { reason: "x" })).rejects.toThrow();
    await expect(mergeDuplicate(global, LEAD, { target_lead_id: LEAD, reason: "x" })).rejects.toThrow();
  });
});

describe("FR-0009 convert blocked on confirmed duplicate (P3.11)", () => {
  it("blocks convert when duplicate_status = confirmed_duplicate", async () => {
    h.singles["school_leads"] = { id: LEAD, state: "Delhi", duplicate_status: "confirmed_duplicate", school_name: "S", city: "Delhi" };
    await expect(convertLead(global, LEAD)).rejects.toMatchObject({ fieldErrors: [{ message: expect.stringMatching(/confirmed duplicate/i) }] });
    expect(h.inserts.filter((i) => i.table === "schools")).toHaveLength(0);
  });
  it("allows convert when not a confirmed duplicate", async () => {
    h.singles["school_leads"] = { id: LEAD, state: "Delhi", duplicate_status: "unchecked", school_name: "S", city: "Delhi", email: "s@x.com" };
    const res = await convertLead(global, LEAD);
    expect(res.applied).toBe(true);
    expect(h.inserts.filter((i) => i.table === "schools")).toHaveLength(1);
  });
});

describe("FR-0009 import surfaces collisions for review", () => {
  it("stage 1 stages a collision as a pending_duplicate pointing at the matched master", async () => {
    h.listData["school_leads"] = [{ id: "master-1", school_name: "Dup", city: "Delhi", state: "Delhi", email: "d@x.com" }];
    const res = await importLeads(global, [leadRow({ school_name: "Dup2", email: "d@x.com" }), leadRow({ school_name: "Fresh", email: "f@x.com" })], {});
    expect(res.importable).toBe(1);
    expect(res.duplicates).toBe(1);
    const batch = h.inserts.find((i) => i.table === "school_lead_import_batches")!.row;
    const pd = (batch.validation_report as { pending_duplicates: Array<{ duplicate_of: string }> }).pending_duplicates;
    expect(pd[0].duplicate_of).toBe("master-1");
  });
  it("commit inserts staged duplicates as possible_duplicate (duplicate_review) pointing at the master", async () => {
    h.singles["school_lead_import_batches"] = { id: "b1", status: "validated", total_rows: 1, default_lead_owner_id: null, validation_report: { pending_rows: [], pending_duplicates: [{ lead: leadRow({ school_name: "Dup2" }), duplicate_of: "master-1" }] } };
    await commitImport(global, "b1", {});
    const inserted = h.inserts.find((i) => i.table === "school_leads")!.row;
    expect(inserted.duplicate_status).toBe("possible_duplicate");
    expect(inserted.lead_status).toBe("duplicate_review");
    expect(inserted.duplicate_of_lead_id).toBe("master-1");
  });
});
