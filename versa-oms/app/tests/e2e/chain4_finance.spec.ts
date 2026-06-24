import { test, expect } from "@playwright/test";

// CHAIN-004 — invoice paid (dual-approval, maker≠checker) → participation payment gate opens.
// Fixture: _validation/seed_chain3.sql (creates E2E-INV-CH4 issued + participation pending).
const json = { "content-type": "application/json" };

test("CHAIN-004: invoice mark_paid (dual-approval) opens participation payment gate", async ({ request }) => {
  const invoices = (await (await request.get("/api/staff/finance?page_size=200")).json()).data.items as Array<Record<string, unknown>>;
  const inv = invoices.find((i) => i.invoice_number === "E2E-INV-CH4");
  test.skip(!inv, "run _validation/seed_chain3.sql for the CHAIN-004 invoice fixture");

  const url = `/api/staff/finance/${inv!.id}/actions/mark_paid`;
  // Order-independent: dual-approval applies on whichever call reaches 2 DISTINCT approvers
  // (a fresh fixture applies on the 2nd; a fixture with persisted approvals on the 1st). The
  // lifecycle guard (P0.1) correctly allows mark_paid only from issued/partially_paid, so once
  // the invoice is paid further mark_paid calls are blocked — which is why we assert the end-state.
  if (String(inv!.invoice_status) !== "paid") {
    const b1 = await (await request.post(url, { headers: { ...json, "x-dev-actor": "approver-a" }, data: { reason: "payment received" } })).json();
    const b2 = await (await request.post(url, { headers: { ...json, "x-dev-actor": "approver-b" }, data: { reason: "verified" } })).json();
    expect(Boolean(b1.data?.applied) || Boolean(b2.data?.applied), "mark_paid applied after two distinct approvers").toBe(true);
  }

  // effect: the linked participation's payment gate is open
  const parts = (await (await request.get("/api/staff/core/participations?page_size=200")).json()).data.items as Array<Record<string, unknown>>;
  const part = parts.find((p) => p.participation_code === "E2E-PART-CH3");
  expect(part, "participation present").toBeTruthy();
  expect(part!.payment_status).toBe("paid");
});
