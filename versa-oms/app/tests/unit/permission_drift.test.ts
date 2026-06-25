import { describe, it, expect } from "vitest";
import { scanPermissionDrift, maxRisk, type RoleRow, type StaffRow } from "@/server/security/permissionDrift";

const ROLES: RoleRow[] = [
  { role_id: "super_admin", role_name: "Super Admin", risk_level: "critical", role_status: "active" },
  { role_id: "legacy_admin", role_name: "Legacy Admin", risk_level: "high", role_status: "deprecated" },
  { role_id: "disabled_ops", role_name: "Disabled Ops", risk_level: "medium", role_status: "disabled" },
];

describe("permission drift scan (FR-PERMISSION-DRIFT-2026-0027)", () => {
  it("no finding when every held role is active", () => {
    const staff: StaffRow[] = [{ id: "s1", primary_role: "super_admin", secondary_roles: null }];
    expect(scanPermissionDrift(staff, ROLES)).toEqual([]);
  });
  it("flags a held role that is no longer active (with the role's risk)", () => {
    const staff: StaffRow[] = [{ id: "s1", primary_role: "legacy_admin", secondary_roles: null }];
    const f = scanPermissionDrift(staff, ROLES);
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ staff_user_id: "s1", role_ref: "legacy_admin", risk_level: "high" });
    expect(f[0].current.role_status).toBe("deprecated");
  });
  it("scans secondary_roles too", () => {
    const staff: StaffRow[] = [{ id: "s1", primary_role: "super_admin", secondary_roles: ["disabled_ops"] }];
    const f = scanPermissionDrift(staff, ROLES);
    expect(f).toHaveLength(1);
    expect(f[0].role_ref).toBe("disabled_ops");
  });
  it("flags an unknown role as high risk", () => {
    const staff: StaffRow[] = [{ id: "s1", primary_role: "ghost_role", secondary_roles: null }];
    const f = scanPermissionDrift(staff, ROLES);
    expect(f[0]).toMatchObject({ role_ref: "ghost_role", risk_level: "high" });
    expect(f[0].current.role_status).toBe("unknown");
  });
  it("maxRisk returns the highest finding severity", () => {
    const staff: StaffRow[] = [{ id: "s1", primary_role: "legacy_admin", secondary_roles: ["disabled_ops"] }];
    expect(maxRisk(scanPermissionDrift(staff, ROLES))).toBe("high");
    expect(maxRisk([])).toBeNull();
  });
});
