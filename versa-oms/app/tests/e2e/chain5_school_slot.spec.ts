import { test, expect } from "@playwright/test";

// CHAIN-005 — the SCHOOL confirms its slot assignment (school portal action), gated by
// school_active + payment/roster/capacity gates. Foundation: school-side transitions +
// action routes + the gen_guards precondition. Fixture: _validation/seed_chain3.sql.
const SID_HDR = (sid: string) => ({ "content-type": "application/json", "x-dev-school": sid });

test("CHAIN-005: school confirms slot (gates passed) + blocked when a gate fails", async ({ request }) => {
  const schools = (await (await request.get("/api/staff/core/schools?page_size=200")).json()).data.items as Array<Record<string, unknown>>;
  const school = schools.find((s) => s.school_code === "E2E-CH3-SCH");
  test.skip(!school, "run _validation/seed_chain3.sql for the CHAIN-005 fixture");
  const sid = String(school!.id);

  const items = (await (await request.get("/api/school/exam-slots?page_size=200", { headers: { "x-dev-school": sid } })).json()).data.items as Array<Record<string, unknown>>;
  const ok = items.find((a) => a.assignment_code === "E2E-ASSIGN-OK");
  const blocked = items.find((a) => a.assignment_code === "E2E-ASSIGN-BLOCKED");
  expect(ok && blocked, "both seeded assignments visible to the school").toBeTruthy();

  // gates passed -> school confirms -> confirmed
  const r1 = await request.post(`/api/school/exam-slots/${ok!.id}/actions/confirm`, { headers: SID_HDR(sid), data: {} });
  const b1 = await r1.json();
  expect(b1.ok).toBe(true);
  expect(b1.data.applied).toBe(true);

  // roster gate failed -> confirm blocked by precondition (fail-closed)
  const r2 = await request.post(`/api/school/exam-slots/${blocked!.id}/actions/confirm`, { headers: SID_HDR(sid), data: {} });
  const b2 = await r2.json();
  expect(b2.ok).toBe(false);
  expect(JSON.stringify(b2.error)).toContain("gate");
});
