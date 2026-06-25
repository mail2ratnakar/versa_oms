import { test, expect } from "@playwright/test";

// FR-SLOT-CAPACITY-2026-0013 — booking an exam slot is gated by the slot's real seat capacity
// (computed from existing bookings, not a manual flag). Fixture: seed_chain3.sql (E2E-SLOT-CH5 =
// 500 seats, E2E-CH3-SCH, E2E-PART-CH3).
const SID = (sid: string, key: string) => ({ "content-type": "application/json", "x-dev-school": sid, "x-idempotency-key": key });

test("slot capacity gate: within seats books, beyond seats is blocked", async ({ request }) => {
  const schools = (await (await request.get("/api/staff/core/schools?q=E2E-CH3-SCH")).json()).data.items as Array<Record<string, unknown>>;
  const school = schools.find((s) => s.school_code === "E2E-CH3-SCH");
  const slots = (await (await request.get("/api/staff/core/exam-slots?q=E2E-SLOT-CH5")).json()).data.items as Array<Record<string, unknown>>;
  const slot = slots.find((s) => s.slot_code === "E2E-SLOT-CH5");
  const parts = (await (await request.get("/api/staff/core/participations?q=E2E-PART-CH3")).json()).data.items as Array<Record<string, unknown>>;
  const part = parts.find((p) => p.participation_code === "E2E-PART-CH3");
  test.skip(!school || !slot || !part, "run _validation/seed_chain3.sql");
  const sid = String(school!.id);
  const u = `${Date.now()}`;
  const body = (count: number) => ({ participation_id: part!.id, exam_slot_id: slot!.id, confirmed_student_count: count, payment_status_at_booking: "paid" });

  // Within capacity (1 of 500) -> books.
  const ok = await request.post("/api/school/slot-bookings", { headers: SID(sid, `cap-ok-${u}`), data: body(1) });
  expect((await ok.json()).ok).toBe(true);

  // A single booking beyond the slot's seats (600 > 500) -> blocked, deterministically.
  const over = await request.post("/api/school/slot-bookings", { headers: SID(sid, `cap-over-${u}`), data: body(600) });
  expect(over.status()).toBe(422);
  expect(JSON.stringify(await over.json())).toMatch(/full|seats|capacity/i);
});
