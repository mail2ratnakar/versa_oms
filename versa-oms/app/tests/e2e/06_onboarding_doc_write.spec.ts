import { test, expect, type Page, type TestInfo } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// FR-UI-HARDENING-2026-0004 — write detail panel: register a document on a case and review it (approve),
// in-screen. File bytes are deferred (storage not wired); this covers register + review with audit.
const LOG = path.resolve(process.cwd(), ".qa/logs");
function installQa(page: Page, ti: TestInfo) {
  const qa = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  const ev = (o: Record<string, unknown>) => { fs.mkdirSync(LOG, { recursive: true }); fs.appendFileSync(path.join(LOG, "qa-events.jsonl"), JSON.stringify({ time: new Date().toISOString(), test: ti.title, ...o }) + "\n"); };
  page.on("console", (m) => { if (m.type() === "error") { qa.consoleErrors.push(m.text()); ev({ type: "console", level: "error", text: m.text() }); } });
  page.on("pageerror", (e) => { qa.pageErrors.push(e.message); ev({ type: "pageerror", message: e.message }); });
  return qa;
}
const idem = () => ({ "content-type": "application/json", "x-idempotency-key": crypto.randomUUID() });

test("06 onboarding: register a document on a case, then review it (approve) in-screen", async ({ page, request }, testInfo) => {
  const name = "E2E DocWrite " + crypto.randomUUID().slice(0, 8);
  const leadId = (await (await request.post("/api/staff/schools/crm", { headers: idem(), data: { school_name: name, city: "Delhi", state: "Delhi", country: "India", lead_source: "referral" } })).json()).data.lead.id as string;
  await request.post(`/api/staff/schools/crm/${leadId}/convert`, { headers: idem() });

  const qa = installQa(page, testInfo);
  await page.goto("/staff/schools/onboarding");
  const row = page.locator("tr", { hasText: name });
  await expect(row).toBeVisible({ timeout: 20_000 });
  await row.getByRole("button", { name: "Documents" }).click();
  const modal = page.locator(".modal-body");
  await expect(modal.getByRole("heading", { name: /Documents/ })).toBeVisible();

  // Register a document (add). Assert on the listed item card (not the select options).
  await modal.locator("select").first().selectOption("school_id_proof");
  await modal.getByRole("button", { name: "Add" }).click();
  const item = modal.locator(".card").first();
  await expect(item).toContainText(/school id proof/i);     // listed (document_type)
  await expect(item).toContainText(/uploaded/i);            // default review_status

  // Review it (accept) via the item Edit form.
  await item.getByRole("button", { name: "Edit" }).click();
  await modal.locator("select").first().selectOption("accepted");
  await modal.getByRole("button", { name: "Save" }).click();
  await expect(modal.locator(".card").first()).toContainText(/accepted/i);   // review applied + listed

  expect(qa.pageErrors).toEqual([]);
  expect(qa.consoleErrors).toEqual([]);
});
