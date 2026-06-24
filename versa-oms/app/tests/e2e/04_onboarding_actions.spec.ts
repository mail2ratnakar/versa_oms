import { test, expect, type Page, type TestInfo } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// FR-UI-HARDENING-2026-0001 (#2) — destructive lifecycle actions show a branded confirm warning (P1.6)
// and require a reason (P1.8 -> audit). Validated on a submitted onboarding case via the screen.
const LOG = path.resolve(process.cwd(), ".qa/logs");
function installQa(page: Page, ti: TestInfo) {
  const qa = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  const ev = (o: Record<string, unknown>) => { fs.mkdirSync(LOG, { recursive: true }); fs.appendFileSync(path.join(LOG, "qa-events.jsonl"), JSON.stringify({ time: new Date().toISOString(), test: ti.title, ...o }) + "\n"); };
  page.on("console", (m) => { if (m.type() === "error") { qa.consoleErrors.push(m.text()); ev({ type: "console", level: "error", text: m.text() }); } });
  page.on("pageerror", (e) => { qa.pageErrors.push(e.message); ev({ type: "pageerror", message: e.message }); });
  return qa;
}
const idem = () => ({ "content-type": "application/json", "x-idempotency-key": crypto.randomUUID() });

test("04 onboarding: a destructive action (Reject) warns + requires a reason before confirm", async ({ page, request }, testInfo) => {
  // Seed a submitted onboarding case via the CRM convert chain.
  const name = "E2E Reject UI " + crypto.randomUUID().slice(0, 8);
  const leadId = (await (await request.post("/api/staff/schools/crm", { headers: idem(), data: { school_name: name, city: "Delhi", state: "Delhi", country: "India", lead_source: "referral" } })).json()).data.lead.id as string;
  await request.post(`/api/staff/schools/crm/${leadId}/convert`, { headers: idem() });

  const qa = installQa(page, testInfo);
  await page.goto("/staff/schools/onboarding");
  const row = page.locator("tr", { hasText: name });
  await expect(row).toBeVisible({ timeout: 20_000 });
  await row.getByRole("button", { name: "Reject" }).click();

  const modal = page.locator(".modal-body");
  await expect(modal.getByText(/high-impact change/i)).toBeVisible();            // danger warning (P1.6)
  const confirm = modal.getByRole("button", { name: /Confirm Reject/i });
  await expect(confirm).toBeDisabled();                                          // reason required (P1.8)
  await modal.getByRole("textbox").fill("documents incomplete");
  await expect(confirm).toBeEnabled();
  // Don't mutate further — the gating behavior is what we validate here.
  await modal.getByRole("button", { name: "Cancel" }).click();

  expect(qa.pageErrors).toEqual([]);
  expect(qa.consoleErrors).toEqual([]);
});
