// FR-DASH-SCOPE-2026-0001 — dashboard counts honour the actor's assignment scope (no global-total leak).
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Actor } from "@/server/types";

const h = vi.hoisted(() => ({ inCalls: [] as Array<[string, string[]]> }));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({
    from: () => {
      const b: Record<string, unknown> = {
        select: () => b, is: () => b, eq: () => b,
        in: (col: string, vals: string[]) => { h.inCalls.push([col, vals]); return b; },
        then: (resolve: (v: { count: number }) => void) => resolve({ count: 0 }),
      };
      return b;
    },
  }),
}));

import { getStaffKpis } from "@/server/lib/dashboard";
const mk = (scopes: string[], roles: string[]): Actor => ({ actor_id: "u", actor_type: "staff", roles, scopes });

beforeEach(() => { h.inCalls = []; });

describe("FR-DASH-SCOPE-0001 dashboard count scoping", () => {
  it("global actor: counts are unrestricted (no scope .in filters)", async () => {
    const kpis = await getStaffKpis(mk(["global"], ["operations_head"]));
    expect(kpis.length).toBeGreaterThan(0);
    expect(h.inCalls).toHaveLength(0);
  });
  it("school-scoped non-admin: counts are filtered to the assigned school", async () => {
    await getStaffKpis(mk(["school:S1"], ["operations_executive"]));
    expect(h.inCalls.some(([c, v]) => c === "school_id" && v.includes("S1"))).toBe(true);
  });
  it("region-scoped non-admin: counts are filtered to the assigned region", async () => {
    await getStaffKpis(mk(["region:north"], ["operations_executive"]));
    expect(h.inCalls.some(([c, v]) => c === "state" && v.includes("north"))).toBe(true);
  });
});
