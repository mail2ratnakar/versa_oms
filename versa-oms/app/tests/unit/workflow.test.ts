import { describe, it, expect } from "vitest";
import { isDuplicate, findDuplicates } from "@/server/crm/dedupe";
import { taskFromTransition } from "@/server/tasks/autoTask";
import { reconcileCount } from "@/server/courier/reconcile";

describe("CRM duplicate detection", () => {
  it("matches by email, phone, and name+city", () => {
    expect(isDuplicate({ email: "a@x.com" }, { email: "A@X.com" })).toBe(true);
    expect(isDuplicate({ phone: "+91 98765 43210" }, { phone: "9876543210" })).toBe(true);
    expect(isDuplicate({ school_name: "Delhi Public", city: "Delhi" }, { school_name: "delhi  public", city: "DELHI" })).toBe(true);
    expect(isDuplicate({ school_name: "A", city: "X" }, { school_name: "B", city: "Y" })).toBe(false);
  });
  it("splits incoming into unique vs duplicates", () => {
    const existing = [{ email: "a@x.com" }];
    const { unique, duplicates } = findDuplicates([{ email: "a@x.com" }, { email: "b@x.com" }, { email: "b@x.com" }], existing);
    expect(unique.length).toBe(1);
    expect(duplicates.length).toBe(2);
  });
});

describe("auto-task from workflow events", () => {
  it("creates a task for mapped transitions, null otherwise", () => {
    expect(taskFromTransition("finance_ops", "mark_paid", "p1")?.title).toBe("Verify payment confirmation");
    expect(taskFromTransition("results_ops", "publish", "r1")?.queue).toBe("results");
    expect(taskFromTransition("finance_ops", "noop", "p1")).toBeNull();
  });
});

describe("courier count reconciliation", () => {
  it("classifies matched / shortage / excess and approval need", () => {
    expect(reconcileCount(100, 100)).toEqual({ status: "matched", diff: 0, needsApproval: false });
    expect(reconcileCount(100, 97)).toEqual({ status: "shortage", diff: -3, needsApproval: true });
    expect(reconcileCount(100, 102, 5)).toEqual({ status: "excess", diff: 2, needsApproval: false });
  });
});
