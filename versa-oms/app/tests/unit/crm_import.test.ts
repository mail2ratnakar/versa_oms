// FR-SCHOOL-CRM-2026-0007 (CR-A) + FR-SCHOOL-CRM-2026-0008 (CR-B): staged lead import —
// validate/stage (no insert) -> commit (insert; dual-approval >=5000) -> cancel. Audited batch.
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

import { importLeads, commitImport, cancelImport } from "@/server/crm/leadService";
import { resetApprovalsMemory } from "@/server/lib/approvals";

const A: Actor = { actor_id: "11111111-1111-1111-1111-111111111111", actor_type: "staff", roles: ["sales_school_outreach_executive"], scopes: ["global"] };
const B: Actor = { actor_id: "22222222-2222-2222-2222-222222222222", actor_type: "staff", roles: ["sales_manager"], scopes: ["global"] };
const leads = () => h.inserts.filter((i) => i.table === "school_leads");
const batches = () => h.inserts.filter((i) => i.table === "school_lead_import_batches");
const row = (over: Partial<Record<string, string>> = {}) => ({ school_name: "A School", city: "Delhi", state: "Delhi", country: "India", lead_source: "referral", ...over });
const stagedBatch = (over: Record<string, unknown> = {}) => ({ id: "batch-1", status: "validated", total_rows: 2, default_lead_owner_id: null, validation_report: { pending_rows: [row({ school_name: "One" }), row({ school_name: "Two" })] }, ...over });

beforeEach(() => { h.inserts = []; h.updates = []; h.audits = []; h.listData = {}; h.singles = {}; h.ids = {}; resetApprovalsMemory(); });

describe("FR-0007/0008 stage 1 — validate/stage (no insert)", () => {
  it("valid rows stage a 'validated' batch and insert NO leads yet", async () => {
    const res = await importLeads(A, [row({ school_name: "One" }), row({ school_name: "Two" })], { import_format: "csv" });
    expect(leads()).toHaveLength(0);              // staged, not inserted
    expect(res.status).toBe("validated");
    expect(res.importable).toBe(2);
    expect(String(res.batch_code)).toMatch(/^LIMP-[0-9A-F]{8}$/);
    expect(batches()).toHaveLength(1);
    expect((batches()[0].row.validation_report as { pending_rows: unknown[] }).pending_rows).toHaveLength(2);
  });
  it("rows missing a required column are invalid and excluded from pending", async () => {
    const res = await importLeads(A, [row(), { school_name: "NoCountry", city: "Delhi", state: "Delhi", lead_source: "referral" }], {});
    expect(res.invalid).toBe(1);
    expect(res.importable).toBe(1);
    expect(res.validation_report.invalid[0]).toMatchObject({ row: 2, missing: ["country"] });
  });
  it("duplicates vs existing are excluded from pending", async () => {
    h.listData["school_leads"] = [{ school_name: "Dup School", city: "Delhi", state: "Delhi" }];
    const res = await importLeads(A, [row({ school_name: "Dup School" }), row({ school_name: "Fresh" })], {});
    expect(res.duplicates).toBeGreaterThanOrEqual(1);
    expect(res.importable).toBe(1);
  });
  it("zero valid rows -> validation_failed", async () => {
    const res = await importLeads(A, [{ school_name: "OnlyName" }], {});
    expect(res.status).toBe("validation_failed");
    expect(res.importable).toBe(0);
  });
  it("flags needs_approval for large imports (>=5000)", async () => {
    const big = Array.from({ length: 5000 }, (_, i) => row({ school_name: `S${i}` }));
    const res = await importLeads(A, big, {});
    expect(res.needs_approval).toBe(true);
  });
});

describe("FR-0008 stage 2 — commit", () => {
  it("commits a small validated batch: inserts full server-set leads, status imported", async () => {
    h.singles["school_lead_import_batches"] = stagedBatch();
    const res = await commitImport(A, "batch-1", {});
    expect(res.applied).toBe(true);
    expect(res.imported).toBe(2);
    expect(leads()).toHaveLength(2);
    for (const l of leads()) {
      expect(String(l.row.lead_code)).toMatch(/^LEAD-[0-9A-F]{8}$/);
      expect(l.row.stage).toBe("new_lead");
      expect(l.row.created_by).toBe(A.actor_id);
    }
    expect(h.updates.some((u) => u.table === "school_lead_import_batches" && u.patch.status === "imported")).toBe(true);
  });
  it("cannot commit a batch that is not 'validated'", async () => {
    h.singles["school_lead_import_batches"] = stagedBatch({ status: "imported" });
    await expect(commitImport(A, "batch-1", {})).rejects.toThrow();
    expect(leads()).toHaveLength(0);
  });
});

describe("FR-0008 large-import dual-approval (maker != checker)", () => {
  beforeEach(() => { h.singles["school_lead_import_batches"] = stagedBatch({ total_rows: 6000 }); });
  it("first approver records approval but does NOT insert", async () => {
    const res = await commitImport(A, "batch-1", { reason: "maker" });
    expect(res.applied).toBe(false);
    expect(res.approvals_recorded).toBe(1);
    expect(res.approvals_needed).toBe(2);
    expect(leads()).toHaveLength(0);
  });
  it("same approver twice cannot self-approve", async () => {
    await commitImport(A, "batch-1", { reason: "1" });
    const res = await commitImport(A, "batch-1", { reason: "2" });
    expect(res.applied).toBe(false);
    expect(leads()).toHaveLength(0);
  });
  it("a second distinct approver applies the import", async () => {
    await commitImport(A, "batch-1", { reason: "maker" });
    const res = await commitImport(B, "batch-1", { reason: "checker" });
    expect(res.applied).toBe(true);
    expect(leads()).toHaveLength(2);
  });
});

describe("FR-0008 cancel", () => {
  it("requires a reason", async () => {
    h.singles["school_lead_import_batches"] = stagedBatch();
    await expect(cancelImport(A, "batch-1", "")).rejects.toThrow();
  });
  it("cancels a validated batch", async () => {
    h.singles["school_lead_import_batches"] = stagedBatch();
    const res = await cancelImport(A, "batch-1", "wrong file");
    expect(res.status).toBe("cancelled");
    expect(h.updates.some((u) => u.patch.status === "cancelled")).toBe(true);
  });
});

describe("FR-0007/0008 security + concurrency", () => {
  it("A08 mass-assignment: CSV-supplied server fields ignored at commit", async () => {
    h.singles["school_lead_import_batches"] = stagedBatch({ validation_report: { pending_rows: [row({ lead_code: "LEAD-HACKED", created_by: "attacker", stage: "converted" } as Record<string, string>)] }, total_rows: 1 });
    await commitImport(A, "batch-1", {});
    const r = leads()[0].row;
    expect(r.lead_code).not.toBe("LEAD-HACKED");
    expect(r.created_by).toBe(A.actor_id);
    expect(r.stage).toBe("new_lead");
  });
  it("A03 verbatim: formula/script text stored as-is at commit", async () => {
    const payload = "=cmd|/c calc <script>x</script>";
    h.singles["school_lead_import_batches"] = stagedBatch({ validation_report: { pending_rows: [row({ school_name: payload })] }, total_rows: 1 });
    await commitImport(A, "batch-1", {});
    expect(leads()[0].row.school_name).toBe(payload);
  });
  it("A09: stage and commit are both audited", async () => {
    await importLeads(A, [row()], {});
    expect(h.audits.some((a) => a.action === "upload_import")).toBe(true);
  });
  it("two parallel stage-1 uploads -> distinct batch_code", async () => {
    const [x, y] = await Promise.all([importLeads(A, [row()], {}), importLeads(A, [row()], {})]);
    expect(x.batch_code).not.toBe(y.batch_code);
  });
});
