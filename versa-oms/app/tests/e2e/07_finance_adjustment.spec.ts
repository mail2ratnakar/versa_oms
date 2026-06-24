import { test, expect, type Page, type TestInfo } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// FR-UI-HARDENING-2026-0005 — second module opts into write panels: finance invoice -> Adjustments (add-only).
// Exercises the generalized write path: server-generated code, school_id inherited from the parent invoice.
const LOG = path.resolve(process.cwd(), ".qa/logs");
function installQa(page: Page, ti: TestInfo) {
  const qa = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  const ev = (o: Record<string, unknown>) => { fs.mkdirSync(LOG, { recursive: true }); fs.appendFileSync(path.join(LOG, "qa-events.jsonl"), JSON.stringify({ time: new Date().toISOString(), test: ti.title, ...o }) + "\n"); };
  page.on("console", (m) => { if (m.type() === "error") { qa.consoleErrors.push(m.text()); ev({ type: "console", level: "error", text: m.text() }); } });
  page.on("pageerror", (e) => { qa.pageErrors.push(e.message); ev({ type: "pageerror", message: e.message }); });
  return qa;
}
const idem = () => ({ "content-type": "application/json", "x-idempotency-key": crypto.randomUUID() });

test("07 finance: request an adjustment on an invoice (server code + inherited school_id) + panel UI", async ({ page, request }, testInfo) => {
  const invoices = (await (await request.get("/api/staff/finance?page_size=200")).json()).data.items as Array<Record<string, unknown>>;
  const inv = invoices?.find((i) => i.invoice_number === "E2E-INV-CH4") ?? invoices?.[0];
  test.skip(!inv, "run _validation/seed_chain3.sql for the finance invoice fixture");
  const invId = String(inv.id);

  // Server: the generalized write path generates a code and inherits school_id from the parent invoice.
  const adj = (await (await request.post(`/api/staff/finance/${invId}/adjustments`, { headers: idem(), data: { adjustment_type: "discount", amount: "50", reason: "e2e goodwill", adjustment_status: "approved" } })).json()).data;
  expect(String(adj.adjustment_code)).toMatch(/^ADJ-/);     // server-generated code
  expect(adj.invoice_id).toBe(invId);                        // parent fk
  expect(adj.school_id).toBe(inv.school_id);                 // inherited from invoice
  expect(adj.adjustment_status).toBe("draft");              // default, NOT the client's "approved" (mass-assignment-safe)

  // Screen: the Adjustments write panel renders its add form for an invoice.
  const qa = installQa(page, testInfo);
  await page.goto("/staff/finance");
  await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 20_000 });
  await page.getByPlaceholder(/search/i).fill(String(inv.invoice_number ?? ""));
  const row = page.locator("tr", { hasText: String(inv.invoice_number ?? "") });
  await expect(row.first()).toBeVisible({ timeout: 10_000 });
  await row.first().getByRole("button", { name: "Adjustments" }).click();
  const modal = page.locator(".modal-body");
  await expect(modal.getByRole("heading", { name: /Adjustments/ })).toBeVisible();
  await expect(modal.getByRole("button", { name: "Add" })).toBeVisible();   // write panel (add form present)

  expect(qa.pageErrors).toEqual([]);
  expect(qa.consoleErrors).toEqual([]);
});
