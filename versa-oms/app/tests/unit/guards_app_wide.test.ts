// FR-GATES-2026-0001 — lifecycle-edge enforcement is now app-wide (was school_onboarding_ops only).
import { describe, it, expect } from "vitest";
import { isActionAllowedFrom, TRANSITION_GUARDS } from "@/server/lib/transitionGuards";

describe("FR-GATES-0001 app-wide lifecycle guards", () => {
  it("guards many modules now (not just onboarding)", () => {
    expect(Object.keys(TRANSITION_GUARDS).length).toBeGreaterThan(10);
    expect(TRANSITION_GUARDS.finance_ops).toBeTruthy();
  });
  it("finance invoice: mark_paid allowed from issued, blocked once paid (no double-pay)", () => {
    expect(isActionAllowedFrom("finance_ops", "issued", "mark_paid")).toBe(true);
    expect(isActionAllowedFrom("finance_ops", "paid", "mark_paid")).toBe(false);
  });
  it("onboarding still enforced (regression)", () => {
    expect(isActionAllowedFrom("school_onboarding_ops", "submitted", "approve")).toBe(true);
    expect(isActionAllowedFrom("school_onboarding_ops", "approved", "submit")).toBe(false);
  });
  it("unknown module / unknown status stays permissive (fail-open only when truly unmapped)", () => {
    expect(isActionAllowedFrom("nonexistent_module", "x", "y")).toBe(true);
    expect(isActionAllowedFrom("finance_ops", null, "mark_paid")).toBe(true);
  });
});
