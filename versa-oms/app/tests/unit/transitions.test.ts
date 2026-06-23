import { describe, it, expect } from "vitest";
import * as finance from "@/server/modules/finance_ops/service";
import * as onboarding from "@/server/modules/school_onboarding_ops/service";
import { ValidationError } from "@/server/lib/defineModule";
import type { Actor } from "@/server/types";

const superAdmin: Actor = { actor_id: "super", actor_type: "staff", roles: ["super_admin"], scopes: ["global"] };

describe("spec-derived status transitions", () => {
  it("finance_ops exposes high-risk transitions with reason + dual-approval", () => {
    const t = finance.getTransition("mark_paid");
    expect(t).toBeTruthy();
    expect(t!.klass).toBe("approve");
    expect(t!.reasonRequired).toBe(true);
    expect(t!.dualApproval).toBe(true);
  });

  it("rejects a high-risk transition with no reason", async () => {
    await expect(
      finance.transitionModuleRecord({ actor: superAdmin, id: "inv-1", action: "mark_paid", reason: null })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects an unknown action", async () => {
    await expect(
      finance.transitionModuleRecord({ actor: superAdmin, id: "inv-1", action: "teleport", reason: "x" })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("applies a valid transition and reports the target status (local path)", async () => {
    const res = await onboarding.transitionModuleRecord({
      actor: superAdmin,
      id: "case-1",
      action: "approve",
      reason: "verified identity and contacts",
    });
    expect(res.action).toBe("approve");
    expect(res.onboarding_status).toBe("approved");
  });
});
