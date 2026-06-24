// FR-UI-HARDENING-2026-0004 — childWrite: add + review a child row (mass-assignment-safe, server-set actor).
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Actor } from "@/server/types";

const h = vi.hoisted(() => ({ inserts: [] as Array<{ table: string; row: Record<string, unknown> }>, updates: [] as Array<{ table: string; patch: Record<string, unknown> }>, audits: [] as Array<Record<string, unknown>>, singles: {} as Record<string, Record<string, unknown> | null> }));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    from(table: string) {
      const ctx: { last?: { data: unknown; error: null } } = {};
      const b: Record<string, unknown> = {
        insert(row: Record<string, unknown>) { h.inserts.push({ table, row }); ctx.last = { data: { id: "new-1", ...row }, error: null }; return b; },
        update(patch: Record<string, unknown>) { h.updates.push({ table, patch }); ctx.last = { data: { id: "upd-1", ...patch }, error: null }; return b; },
        select() { return b; }, eq() { return b; },
        single: async () => ctx.last ?? { data: h.singles[table] ?? null, error: null },
        maybeSingle: async () => ctx.last ?? { data: h.singles[table] ?? null },
      };
      return b;
    },
  }),
}));
vi.mock("@/server/audit/createAuditEvent", () => ({ createAuditEvent: async (a: Record<string, unknown>) => { h.audits.push(a); } }));

import { addChildRecord, reviewChildRecord } from "@/server/lib/childWrite";
const actor: Actor = { actor_id: "11111111-1111-1111-1111-111111111111", actor_type: "staff", roles: ["operations_head"], scopes: ["global"] };
const opts = { required: ["document_type"], allowed: ["document_type", "review_note"], actorColumn: "uploaded_by", defaults: { review_status: "uploaded" }, module: "school_onboarding_ops" };

beforeEach(() => { h.inserts = []; h.updates = []; h.audits = []; h.singles = {}; });

describe("FR-0004 addChildRecord", () => {
  it("writes fk + allowed fields + server actor/defaults; ignores non-allowed (mass-assignment)", async () => {
    await addChildRecord("school_onboarding_documents", "onboarding_case_id", "case-1",
      { document_type: "school_id_proof", review_note: "n", review_status: "accepted", id: "forged" }, actor, opts);
    const r = h.inserts[0].row;
    expect(r.onboarding_case_id).toBe("case-1");
    expect(r.document_type).toBe("school_id_proof");
    expect(r.uploaded_by).toBe(actor.actor_id);          // server-set
    expect(r.review_status).toBe("uploaded");             // default, NOT the client's "accepted"
    expect(r.id).toBeUndefined();                          // not an allowed field
  });
  it("rejects a missing required field", async () => {
    await expect(addChildRecord("school_onboarding_documents", "onboarding_case_id", "c", { review_note: "x" }, actor, opts)).rejects.toThrow();
    expect(h.inserts).toHaveLength(0);
  });
});

describe("FR-0004 reviewChildRecord", () => {
  const rOpts = { editable: ["review_status", "review_note"], reviewerColumn: "reviewed_by", reviewedAtColumn: "reviewed_at", module: "school_onboarding_ops" };
  it("updates editable fields + stamps reviewer/time + audits", async () => {
    h.singles["school_onboarding_documents"] = { id: "d1", review_status: "uploaded" };
    await reviewChildRecord("school_onboarding_documents", "d1", "onboarding_case_id", "case-1", { review_status: "accepted", review_note: "ok" }, actor, rOpts);
    const p = h.updates[0].patch;
    expect(p.review_status).toBe("accepted");
    expect(p.review_note).toBe("ok");
    expect(p.reviewed_by).toBe(actor.actor_id);
    expect(typeof p.reviewed_at).toBe("string");
    expect(h.audits.some((a) => a.action === "review_school_onboarding_documents")).toBe(true);
  });
  it("rejects review of a non-existent child", async () => {
    h.singles["school_onboarding_documents"] = null;
    await expect(reviewChildRecord("school_onboarding_documents", "x", "onboarding_case_id", "c", { review_status: "accepted" }, actor, rOpts)).rejects.toThrow();
  });
});
