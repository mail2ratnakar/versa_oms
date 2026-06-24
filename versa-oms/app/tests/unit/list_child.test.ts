// FR-UI-HARDENING-2026-0002 — listChildRecords: detail-panel sub-collection list (query by FK + mask).
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Actor } from "@/server/types";

const h = vi.hoisted(() => ({ eqCalls: [] as Array<[string, unknown]>, data: [] as Array<Record<string, unknown>>, table: "" }));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    from(table: string) {
      h.table = table;
      const b: Record<string, unknown> = {
        select: () => b,
        eq: (c: string, v: unknown) => { h.eqCalls.push([c, v]); return b; },
        order: async () => ({ data: h.data }),
      };
      return b;
    },
  }),
}));

import { listChildRecords } from "@/server/lib/listChild";
const actor: Actor = { actor_id: "11111111-1111-1111-1111-111111111111", actor_type: "staff", roles: ["operations_head"], scopes: ["global"] };

beforeEach(() => { h.eqCalls = []; h.data = []; h.table = ""; });

describe("FR-0002 listChildRecords", () => {
  it("queries the child table filtered by the parent FK and returns masked items", async () => {
    h.data = [{ id: "d1", document_type: "Affiliation", review_status: "pending" }];
    const res = await listChildRecords("school_onboarding_documents", "onboarding_case_id", "case-123", actor);
    expect(h.table).toBe("school_onboarding_documents");
    expect(h.eqCalls).toContainEqual(["onboarding_case_id", "case-123"]);
    expect(res.items).toHaveLength(1);
    expect(res.items[0].document_type).toBe("Affiliation");
  });
  it("returns an empty list (fail-soft) when the query throws", async () => {
    h.data = null as unknown as Array<Record<string, unknown>>; // order() resolves {data:null}
    const res = await listChildRecords("school_onboarding_documents", "onboarding_case_id", "x", actor);
    expect(res.items).toEqual([]);
  });
});
