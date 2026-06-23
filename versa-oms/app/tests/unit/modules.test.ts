import { describe, it, expect } from "vitest";
import * as staffUsers from "@/server/modules/staff_users/service";
import * as financeOps from "@/server/modules/finance_ops/service";
import { can } from "@/server/permissions/registry";
import { ValidationError } from "@/server/lib/defineModule";
import type { Actor } from "@/server/types";

const superAdmin: Actor = { actor_id: "super", actor_type: "staff", roles: ["super_admin"], scopes: ["global"] };
const noRole: Actor = { actor_id: "x", actor_type: "staff", roles: [], scopes: [] };

describe("generated modules register spec-derived policies", () => {
  it("superuser passes read/write on staff_users and finance_ops", () => {
    expect(can(superAdmin, "staff_users", "read")).toBe(true);
    expect(can(superAdmin, "finance_ops", "approve")).toBe(true);
  });
  it("an actor with no roles is denied", () => {
    expect(can(noRole, "staff_users", "read")).toBe(false);
  });
  it("finance_ops approve is restricted (not granted to an arbitrary role)", () => {
    const random: Actor = { actor_id: "r", actor_type: "staff", roles: ["support_executive"], scopes: [] };
    expect(can(random, "finance_ops", "approve")).toBe(false);
  });
});

describe("module kernel: validation + create", () => {
  it("rejects an invalid create payload with ValidationError", async () => {
    await expect(
      staffUsers.createModuleRecord({ actor: superAdmin, payload: {}, idempotencyKey: "k-invalid" })
    ).rejects.toBeInstanceOf(ValidationError);
  });
  it("accepts a valid create and returns a record with an id (local echo path)", async () => {
    const rec = await staffUsers.createModuleRecord({
      actor: superAdmin,
      payload: {
        full_name: "Asha",
        email: "asha@example.com",
        department: "operations",
        primary_role: "operations_executive",
        employment_type: "full_time",
        joining_date: "2026-06-01",
      },
      idempotencyKey: "k-valid-1",
    });
    expect(typeof rec.id).toBe("string");
  });
  it("list returns the standard pagination envelope", async () => {
    const res = (await financeOps.listModuleRecords({
      actor: superAdmin,
      searchParams: new URLSearchParams(),
    })) as { pagination: { page: number } };
    expect(res.pagination.page).toBe(1);
  });
});
