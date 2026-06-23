import { describe, it, expect } from "vitest";
import * as staffUsers from "@/server/modules/staff_users/service";
import * as students from "@/server/modules/school_students/service";
import { ValidationError } from "@/server/lib/defineModule";
import { forbiddenFieldsIn } from "@/server/security/pii";
import { assertNotSelfRoleChange, PolicyError } from "@/server/security/staffPolicy";
import type { Actor } from "@/server/types";

const admin: Actor = { actor_id: "u-admin", actor_type: "staff", roles: ["super_admin"], scopes: [] };
const school: Actor = { actor_id: "sc", actor_type: "school", roles: ["school_coordinator"], scopes: [], school_id: "s1" };

describe("forbidden PII fields are rejected", () => {
  it("detects forbidden keys in any casing/separator", () => {
    expect(forbiddenFieldsIn({ Aadhaar_Number: "x", name: "ok" })).toContain("Aadhaar_Number");
    expect(forbiddenFieldsIn({ "bank account": "x" })).toContain("bank account");
    expect(forbiddenFieldsIn({ name: "ok" })).toEqual([]);
  });
  it("rejects a roster upload carrying a forbidden field", async () => {
    await expect(
      students.createModuleRecord({
        actor: school,
        payload: { student_name: "A", grade: "5", consent_obtained: true, passport_number: "P1" },
        idempotencyKey: "f1",
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("self role-change is blocked", () => {
  it("assertNotSelfRoleChange throws when actor edits own role", () => {
    expect(() => assertNotSelfRoleChange(admin, "u-admin", { primary_role: "company_admin" })).toThrow(PolicyError);
    expect(() => assertNotSelfRoleChange(admin, "someone-else", { primary_role: "company_admin" })).not.toThrow();
  });
  it("kernel rejects a staff updating their own role", async () => {
    await expect(
      staffUsers.updateModuleRecord({ actor: admin, id: "u-admin", payload: { primary_role: "company_admin" } })
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
