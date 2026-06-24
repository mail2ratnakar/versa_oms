// FR-SCHOOL-CRM-2026-0007 (CR-A) — lead import: validate + dedupe + full-field insert + audited batch.
// P4.6 dimensions: functional, security (OWASP), concurrency.
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Actor } from "@/server/types";

const h = vi.hoisted(() => ({
  inserts: [] as Array<{ table: string; row: Record<string, unknown> }>,
  audits: [] as Array<Record<string, unknown>>,
  listData: {} as Record<string, Array<Record<string, unknown>>>,
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
        select() { return b; },
        eq() { return b; },
        is() { return b; },
        in() { return b; },
        order: async () => ({ data: h.listData[table] ?? [] }),
        single: async () => ctx.last ?? { data: null, error: null },
        maybeSingle: async () => ctx.last ?? { data: null },
        // Awaited plain select chains (e.g. the dedupe query) resolve to a list; insert/update resolve to ctx.last.
        then: (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) => Promise.resolve(ctx.last ?? { data: h.listData[table] ?? [], error: null }).then(res, rej),
      };
      return b;
    },
  }),
}));
vi.mock("@/server/audit/createAuditEvent", () => ({ createAuditEvent: async (a: Record<string, unknown>) => { h.audits.push(a); } }));

import { importLeads } from "@/server/crm/leadService";

const actor: Actor = { actor_id: "11111111-1111-1111-1111-111111111111", actor_type: "staff", roles: ["sales_school_outreach_executive"], scopes: ["global"] };
const leadRows = (t: string) => h.inserts.filter((i) => i.table === "school_leads");
const batchRows = () => h.inserts.filter((i) => i.table === "school_lead_import_batches");
const row = (over: Partial<Record<string, string>> = {}) => ({ school_name: "A School", city: "Delhi", state: "Delhi", country: "India", lead_source: "referral", ...over });

beforeEach(() => { h.inserts = []; h.audits = []; h.listData = {}; h.ids = {}; });

describe("FR-0007 functional", () => {
  it("valid rows insert with full server-set fields and a terminal 'imported' batch", async () => {
    const res = await importLeads(actor, [row({ school_name: "One" }), row({ school_name: "Two" })], { import_format: "csv" });
    const leads = leadRows("school_leads");
    expect(leads).toHaveLength(2);
    for (const l of leads) {
      expect(String(l.row.lead_code)).toMatch(/^LEAD-[0-9A-F]{8}$/); // server-generated (P2.4), not from CSV
      expect(l.row.stage).toBe("new_lead");
      expect(l.row.lead_status).toBe("active");
      expect(l.row.created_by).toBe(actor.actor_id);
      expect(l.row.normalized_school_name).toBeTruthy();
    }
    expect(res.imported).toBe(2);
    expect(res.status).toBe("imported");
    expect(String(res.batch_code)).toMatch(/^LIMP-[0-9A-F]{8}$/);
    expect(batchRows()).toHaveLength(1);
    expect(batchRows()[0].row.total_rows).toBe(2);
  });

  it("rows missing a required column are invalid, not inserted, and reported (partially_imported)", async () => {
    const res = await importLeads(actor, [row({ school_name: "Good" }), { school_name: "NoCountry", city: "Delhi", state: "Delhi", lead_source: "referral" }], {});
    expect(leadRows("school_leads")).toHaveLength(1);
    expect(res.invalid).toBe(1);
    expect(res.validation_report.invalid[0]).toMatchObject({ row: 2, missing: ["country"] });
    expect(res.status).toBe("partially_imported");
  });

  it("duplicates vs existing leads are skipped and reported", async () => {
    h.listData["school_leads"] = [{ school_name: "Dup School", city: "Delhi", state: "Delhi" }];
    const res = await importLeads(actor, [row({ school_name: "Dup School" }), row({ school_name: "Fresh" })], {});
    expect(res.duplicates).toBeGreaterThanOrEqual(1);
    expect(leadRows("school_leads").map((l) => l.row.school_name)).toContain("Fresh");
    expect(leadRows("school_leads").map((l) => l.row.school_name)).not.toContain("Dup School");
  });

  it("zero valid rows -> validation_failed, nothing inserted", async () => {
    const res = await importLeads(actor, [{ school_name: "OnlyName" }], {});
    expect(leadRows("school_leads")).toHaveLength(0);
    expect(res.status).toBe("validation_failed");
    expect(res.imported).toBe(0);
  });

  it("applies default_lead_owner_id when a row has no owner", async () => {
    await importLeads(actor, [row()], { default_lead_owner_id: "22222222-2222-2222-2222-222222222222" });
    expect(leadRows("school_leads")[0].row.lead_owner_id).toBe("22222222-2222-2222-2222-222222222222");
  });

  it("writes an audited batch event", async () => {
    await importLeads(actor, [row()], {});
    expect(h.audits.some((a) => a.action === "import_leads" && a.entityType === "school_lead_import_batches")).toBe(true);
  });
});

describe("FR-0007 security (OWASP)", () => {
  it("A08 mass-assignment: CSV-supplied server-owned fields are ignored", async () => {
    await importLeads(actor, [row({ lead_code: "LEAD-HACKED", created_by: "attacker", stage: "converted", lead_status: "won" } as Record<string, string>)], {});
    const r = leadRows("school_leads")[0].row;
    expect(r.lead_code).not.toBe("LEAD-HACKED");
    expect(r.created_by).toBe(actor.actor_id);
    expect(r.stage).toBe("new_lead");
    expect(r.lead_status).toBe("active");
  });
  it("A03: a cell with formula/script text is stored verbatim (no interpretation)", async () => {
    const payload = '=cmd|/c calc!A1 <script>x</script>';
    await importLeads(actor, [row({ school_name: payload })], {});
    expect(leadRows("school_leads")[0].row.school_name).toBe(payload);
  });
});

describe("FR-0007 concurrency", () => {
  it("two parallel imports -> distinct batch_code", async () => {
    const [a, b] = await Promise.all([importLeads(actor, [row()], {}), importLeads(actor, [row()], {})]);
    expect(a.batch_code).not.toBe(b.batch_code);
    expect(batchRows()).toHaveLength(2);
  });
});
