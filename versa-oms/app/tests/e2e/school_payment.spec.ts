import { test, expect } from "@playwright/test";

// School-side payment action: the school turns its draft payment into a payment link
// (workflow: create_payment_link, actor school_coordinator). School-scoped.
// Fixture: _validation/seed_chain3.sql (E2E-PAY-CH5 in payment_draft).
const SID_HDR = (sid: string) => ({ "content-type": "application/json", "x-dev-school": sid });

test("school initiates its payment (draft -> payment_link_created)", async ({ request }) => {
  const schools = (await (await request.get("/api/staff/core/schools?q=E2E-CH3-SCH")).json()).data.items as Array<Record<string, unknown>>;
  const school = schools.find((s) => s.school_code === "E2E-CH3-SCH");
  test.skip(!school, "run _validation/seed_chain3.sql for the payment fixture");
  const sid = String(school!.id);

  const items = (await (await request.get("/api/school/payments?q=E2E-PAY-CH5", { headers: { "x-dev-school": sid } })).json()).data.items as Array<Record<string, unknown>>;
  const pay = items.find((p) => p.payment_code === "E2E-PAY-CH5");
  expect(pay, "draft payment visible to the school").toBeTruthy();

  const res = await request.post(`/api/school/payments/${pay!.id}/actions/create_link`, { headers: SID_HDR(sid), data: {} });
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(body.data.applied).toBe(true);
  expect(body.data.status).toBe("payment_link_created");
});
