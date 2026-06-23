import { describe, it, expect, beforeEach } from "vitest";
import * as finance from "@/server/modules/finance_ops/service";
import { resetApprovalsMemory } from "@/server/lib/approvals";
import type { Actor } from "@/server/types";

const A: Actor = { actor_id: "approver-A", actor_type: "staff", roles: ["finance_admin"], scopes: [] };
const B: Actor = { actor_id: "approver-B", actor_type: "staff", roles: ["company_admin"], scopes: [] };

describe("dual-approval enforcement (maker != checker)", () => {
  beforeEach(() => resetApprovalsMemory());

  it("first approver records approval but does NOT apply", async () => {
    const r = await finance.transitionModuleRecord({ actor: A, id: "inv-9", action: "mark_paid", reason: "verified transfer" });
    expect(r.applied).toBe(false);
    expect(r.approvals_recorded).toBe(1);
    expect(r.approvals_needed).toBe(2);
  });

  it("the same approver twice cannot self-approve", async () => {
    await finance.transitionModuleRecord({ actor: A, id: "inv-9", action: "mark_paid", reason: "x" });
    const r = await finance.transitionModuleRecord({ actor: A, id: "inv-9", action: "mark_paid", reason: "again" });
    expect(r.applied).toBe(false);
    expect(r.approvals_recorded).toBe(1);
  });

  it("a second distinct approver applies the transition", async () => {
    await finance.transitionModuleRecord({ actor: A, id: "inv-9", action: "mark_paid", reason: "maker" });
    const r = await finance.transitionModuleRecord({ actor: B, id: "inv-9", action: "mark_paid", reason: "checker" });
    expect(r.applied).toBe(true);
    expect(r.invoice_status).toBe("paid");
  });
});
