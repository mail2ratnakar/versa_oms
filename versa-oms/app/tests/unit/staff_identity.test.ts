// FR-STAFF-USERS-2026-0001 — staff identity foundation: actor resolution maps the REAL schema
// (primary_role/secondary_roles, staff_status, staff_assignment_scopes) and the system actor is a valid UUID.
import { describe, it, expect } from "vitest";
import { rolesFromProfile, scopesFromAssignments, staffActorFromProfile, SYSTEM_STAFF_ID } from "@/server/auth/actor";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("FR-STAFF-USERS-0001 roles from real columns", () => {
  it("combines primary_role + secondary_roles", () => {
    expect(rolesFromProfile({ primary_role: "operations_head", secondary_roles: ["finance_admin", "support_manager"] }))
      .toEqual(["operations_head", "finance_admin", "support_manager"]);
  });
  it("handles a profile with only primary_role", () => {
    expect(rolesFromProfile({ primary_role: "sales_manager" })).toEqual(["sales_manager"]);
  });
  it("ignores legacy/absent fields (no role/roles columns exist)", () => {
    expect(rolesFromProfile({ role: "x", roles: ["y"] })).toEqual([]);
  });
});

describe("FR-STAFF-USERS-0001 scopes from staff_assignment_scopes", () => {
  it("maps scope_type:scope_value with aliases (state->region, work_queue->queue) and global", () => {
    const rows = [
      { scope_type: "school", scope_value: "s1", scope_status: "active" },
      { scope_type: "state", scope_value: "Delhi", scope_status: "active" },
      { scope_type: "olympiad", scope_value: "o1", scope_status: "active" },
      { scope_type: "work_queue", scope_value: "finance", scope_status: "active" },
      { scope_type: "global", scope_value: "", scope_status: "active" },
    ];
    expect(scopesFromAssignments(rows)).toEqual(["school:s1", "region:Delhi", "olympiad:o1", "queue:finance", "global"]);
  });
  it("excludes non-active scopes", () => {
    const rows = [
      { scope_type: "school", scope_value: "s1", scope_status: "revoked" },
      { scope_type: "school", scope_value: "s2", scope_status: "active" },
    ];
    expect(scopesFromAssignments(rows)).toEqual(["school:s2"]);
  });
});

describe("FR-STAFF-USERS-0001 staffActorFromProfile (fail-closed)", () => {
  const profile = { id: "11111111-1111-1111-1111-111111111111", staff_status: "active", primary_role: "sales_manager", secondary_roles: [] };
  it("maps an active profile + scopes to an Actor", () => {
    const a = staffActorFromProfile(profile, [{ scope_type: "region", scope_value: "Delhi", scope_status: "active" }]);
    expect(a).toEqual({ actor_id: profile.id, actor_type: "staff", roles: ["sales_manager"], scopes: ["region:Delhi"] });
  });
  it("returns null for a non-active profile", () => {
    expect(staffActorFromProfile({ ...profile, staff_status: "suspended" }, [])).toBeNull();
    expect(staffActorFromProfile({ ...profile, staff_status: "invited" }, [])).toBeNull();
  });
  it("returns null for a missing profile", () => {
    expect(staffActorFromProfile(null, [])).toBeNull();
  });
});

describe("FR-STAFF-USERS-0001 system identity", () => {
  it("the seeded system staff id is a valid UUID (satisfies actor-stamped FK columns)", () => {
    expect(SYSTEM_STAFF_ID).toMatch(UUID);
  });
});
