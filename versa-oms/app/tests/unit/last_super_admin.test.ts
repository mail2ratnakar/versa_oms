import { describe, it, expect } from "vitest";
import { isLastActiveSuperAdmin } from "@/server/lib/customPreconditions";

// Negative pack GLOBAL-RBAC-003 / WF-012-NEG-002 — the final active super admin cannot be removed.
describe("last super admin guard (GLOBAL-RBAC-003 / WF-012-NEG-002)", () => {
  it("blocks suspending a super_admin who is the last active one", () => {
    expect(isLastActiveSuperAdmin("super_admin", 1)).toBe(true);
    expect(isLastActiveSuperAdmin("super_admin", 0)).toBe(true);
  });
  it("allows when other active super_admins remain", () => {
    expect(isLastActiveSuperAdmin("super_admin", 2)).toBe(false);
    expect(isLastActiveSuperAdmin("super_admin", 5)).toBe(false);
  });
  it("does not apply to non-super_admin roles", () => {
    expect(isLastActiveSuperAdmin("ops_manager", 1)).toBe(false);
    expect(isLastActiveSuperAdmin("legacy_admin", 0)).toBe(false);
  });
});
