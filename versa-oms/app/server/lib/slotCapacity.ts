// Exam-slot capacity check (FRAMEWORK — FR-SLOT-CAPACITY-0013). PURE: given a slot's seat + school
// limits and the currently-booked totals, decide whether a new booking fits. Computed from real
// bookings, not a manual flag. Unit-tested.
export type SlotCapacityInput = {
  capacityStudents: number;
  capacitySchools: number;
  bookedStudents: number; // sum of confirmed_student_count across active bookings for the slot
  bookedSchoolIds: string[]; // distinct schools with an active booking
  newSchoolId: string;
  newCount: number;
};

export function checkSlotCapacity(i: SlotCapacityInput): { ok: boolean; reason?: string } {
  if (!Number.isFinite(i.newCount) || i.newCount <= 0) {
    return { ok: false, reason: "Confirmed student count must be at least 1." };
  }
  if (i.bookedStudents + i.newCount > i.capacityStudents) {
    return { ok: false, reason: `Slot is full: ${i.bookedStudents}/${i.capacityStudents} seats booked; cannot add ${i.newCount}.` };
  }
  const schoolsAfter = new Set(i.bookedSchoolIds);
  schoolsAfter.add(i.newSchoolId);
  if (schoolsAfter.size > i.capacitySchools) {
    return { ok: false, reason: `Slot school limit reached (${i.capacitySchools} schools).` };
  }
  return { ok: true };
}
