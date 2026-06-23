import { describe, it, expect } from "vitest";
import { isGlobalActor, assignedSchoolIds, staffSchoolScopeFilter, SCHOOL_BEARING } from "@/server/security/scope";
import type { Actor } from "@/server/types";

const admin: Actor = { actor_id: "a", actor_type: "staff", roles: ["super_admin"], scopes: ["global"] };
const scopedStaff: Actor = { actor_id: "s", actor_type: "staff", roles: ["operations_executive"], scopes: ["school:s1", "school:s2"] };
const school: Actor = { actor_id: "sc", actor_type: "school", roles: ["school_coordinator"], scopes: ["school:s1"], school_id: "s1" };

describe("staff assignment-scope", () => {
  it("admin/global roles see everything (no filter)", () => {
    expect(isGlobalActor(admin)).toBe(true);
    expect(staffSchoolScopeFilter(admin)).toBeNull();
  });
  it("non-admin staff are narrowed to assigned schools", () => {
    expect(isGlobalActor(scopedStaff)).toBe(false);
    expect(assignedSchoolIds(scopedStaff)).toEqual(["s1", "s2"]);
    expect(staffSchoolScopeFilter(scopedStaff)).toEqual(["s1", "s2"]);
  });
  it("school actors are not staff-scope-filtered (handled by school scope)", () => {
    expect(staffSchoolScopeFilter(school)).toBeNull();
  });
  it("knows the school-bearing tables", () => {
    expect(SCHOOL_BEARING.has("students")).toBe(true);
    expect(SCHOOL_BEARING.has("finance_invoices")).toBe(false);
  });
});
