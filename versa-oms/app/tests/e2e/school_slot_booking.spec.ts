import { test, expect } from "@playwright/test";

// School-side slot BOOKING — the school books an exam slot (book_slot none->confirmed) and
// can cancel it (cancel_booking confirmed->cancelled). School-scoped, server-gen BOOK-* code.
// Fixtures: seed_chain3.sql (E2E-SLOT-CH5 via E2E-ASSIGN-OK, E2E-PART-CH3).
const SID = (sid: string) => ({ "content-type": "application/json", "x-dev-school": sid });

test("school books an exam slot (confirmed) then cancels it", async ({ request }) => {
  const schools = (await (await request.get("/api/staff/core/schools?q=E2E-CH3-SCH")).json()).data.items as Array<Record<string, unknown>>;
  const school = schools.find((s) => s.school_code === "E2E-CH3-SCH");
  test.skip(!school, "run _validation/seed_chain3.sql");
  const sid = String(school!.id);

  const assigns = (await (await request.get("/api/school/exam-slots?q=E2E-ASSIGN-OK", { headers: { "x-dev-school": sid } })).json()).data.items as Array<Record<string, unknown>>;
  const assign = assigns.find((a) => a.assignment_code === "E2E-ASSIGN-OK");
  test.skip(!assign || !assign.exam_slot_id, "need an assignment with an exam_slot_id");
  const examSlotId = String(assign!.exam_slot_id);

  const parts = (await (await request.get("/api/staff/core/participations?q=E2E-PART-CH3")).json()).data.items as Array<Record<string, unknown>>;
  const part = parts.find((p) => p.participation_code === "E2E-PART-CH3");
  test.skip(!part, "run _validation/seed_chain3.sql (participation)");

  const booked = await (await request.post("/api/school/slot-bookings", {
    headers: { ...SID(sid), "x-idempotency-key": `book-${sid}` },
    data: { participation_id: part!.id, exam_slot_id: examSlotId, confirmed_student_count: 2, payment_status_at_booking: "pending" },
  })).json();
  expect(booked.ok).toBe(true);
  expect(String(booked.data.booking_code)).toMatch(/^BOOK-/);
  expect(booked.data.status).toBe("confirmed");

  const cancelled = await (await request.post(`/api/school/slot-bookings/${booked.data.id}/actions/cancel`, { headers: SID(sid), data: {} })).json();
  expect(cancelled.ok).toBe(true);
  expect(cancelled.data.applied).toBe(true);
  expect(cancelled.data.status).toBe("cancelled");
});
