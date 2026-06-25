import { describe, it, expect } from "vitest";
import { checkSlotCapacity } from "@/server/lib/slotCapacity";

const base = { capacityStudents: 500, capacitySchools: 10, bookedStudents: 0, bookedSchoolIds: [] as string[], newSchoolId: "s1", newCount: 1 };

describe("exam-slot capacity (FR-SLOT-CAPACITY-0013)", () => {
  it("allows a booking within seat capacity", () => {
    expect(checkSlotCapacity({ ...base, bookedStudents: 100, newCount: 50 }).ok).toBe(true);
  });
  it("allows booking exactly up to capacity", () => {
    expect(checkSlotCapacity({ ...base, capacityStudents: 10, bookedStudents: 7, newCount: 3 }).ok).toBe(true);
  });
  it("blocks a booking that exceeds seat capacity", () => {
    const r = checkSlotCapacity({ ...base, capacityStudents: 10, bookedStudents: 8, newCount: 3 });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/full|seats/i);
  });
  it("blocks a single booking larger than the whole slot", () => {
    expect(checkSlotCapacity({ ...base, capacityStudents: 500, newCount: 600 }).ok).toBe(false);
  });
  it("blocks when a NEW school exceeds the school limit", () => {
    const r = checkSlotCapacity({ ...base, capacitySchools: 2, bookedSchoolIds: ["a", "b"], newSchoolId: "c", newCount: 1 });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/school limit/i);
  });
  it("does NOT count a re-booking school against the school limit", () => {
    expect(checkSlotCapacity({ ...base, capacitySchools: 2, bookedSchoolIds: ["a", "b"], newSchoolId: "a", newCount: 1 }).ok).toBe(true);
  });
  it("rejects a non-positive count", () => {
    expect(checkSlotCapacity({ ...base, newCount: 0 }).ok).toBe(false);
  });
});
