import { test, expect } from "@playwright/test";

// Depth e2e over newly-built STAFF secondary entities (staff-scoped, super_admin dev actor).
// Fixtures: _validation/seed_chain3.sql (E2E-FPAY-7001 pending payment, E2E-AKEY-7002 under_review key).
const H = { "content-type": "application/json" };

// Apply a transition; if it needs dual approval (maker != checker), add a second distinct approver.
async function applyTransition(request: any, url: string) {
  let b = await (await request.post(url, { headers: H, data: { reason: "first" } })).json();
  if (b.ok && b.data && b.data.applied === false && b.data.dual_approval_required) {
    const checker = `e2e-checker-${Date.now()}`;
    b = await (await request.post(url, { headers: { ...H, "x-dev-actor": checker }, data: { reason: "second" } })).json();
  }
  return b;
}

test("staff confirms a finance payment (pending -> confirmed, dual approval)", async ({ request }) => {
  const items = (await (await request.get("/api/staff/finance/payments?page_size=200")).json()).data.items as Array<Record<string, unknown>>;
  // payment_reference is masked (finance PII) -> match by the unmasked tail
  const pay = items.find((p) => String(p.payment_reference).endsWith("7001"));
  test.skip(!pay, "run _validation/seed_chain3.sql");
  const b = await applyTransition(request, `/api/staff/finance/payments/${pay!.id}/actions/confirm`);
  expect(b.ok).toBe(true);
  expect(b.data.applied).toBe(true);
  expect(b.data.payment_status).toBe("confirmed");
});

test("staff approves an evaluation answer key (under_review -> approved)", async ({ request }) => {
  const items = (await (await request.get("/api/staff/evaluation/answer-keys?page_size=200")).json()).data.items as Array<Record<string, unknown>>;
  // answer_key_code is masked to null -> match by the distinctive unmasked key_version
  const key = items.find((k) => Number(k.key_version) === 7002);
  test.skip(!key, "run _validation/seed_chain3.sql");
  const b = await applyTransition(request, `/api/staff/evaluation/answer-keys/${key!.id}/actions/approve`);
  expect(b.ok).toBe(true);
  expect(b.data.applied).toBe(true);
  expect(b.data.key_status).toBe("approved");
});

test("staff approves a certificate request (under_review -> approved)", async ({ request }) => {
  const items = (await (await request.get("/api/staff/certificates/requests?page_size=200")).json()).data.items as Array<Record<string, unknown>>;
  const req = items.find((r) => String(r.request_code).endsWith("7003"));
  test.skip(!req, "run _validation/seed_chain3.sql");
  const b = await applyTransition(request, `/api/staff/certificates/requests/${req!.id}/actions/approve`);
  expect(b.ok).toBe(true);
  expect(b.data.applied).toBe(true);
  expect(b.data.request_status).toBe("approved");
});

test("staff publishes a result publication (approved -> published)", async ({ request }) => {
  const items = (await (await request.get("/api/staff/results/publications?page_size=200")).json()).data.items as Array<Record<string, unknown>>;
  const pub = items.find((p) => String(p.publication_code).endsWith("7004"));
  test.skip(!pub, "run _validation/seed_chain3.sql");
  const b = await applyTransition(request, `/api/staff/results/publications/${pub!.id}/actions/publish`);
  expect(b.ok).toBe(true);
  expect(b.data.applied).toBe(true);
  expect(b.data.status).toBe("published");
});
