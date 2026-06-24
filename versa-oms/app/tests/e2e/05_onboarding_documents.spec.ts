import { test, expect, type Page, type TestInfo } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// FR-UI-HARDENING-2026-0002 — onboarding case → Documents detail panel: the case's child documents are
// viewable in context (sub-route + in-screen drawer), not only on a separate flat page.
const LOG = path.resolve(process.cwd(), ".qa/logs");
function installQa(page: Page, ti: TestInfo) {
  const qa = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  const ev = (o: Record<string, unknown>) => { fs.mkdirSync(LOG, { recursive: true }); fs.appendFileSync(path.join(LOG, "qa-events.jsonl"), JSON.stringify({ time: new Date().toISOString(), test: ti.title, ...o }) + "\n"); };
  page.on("console", (m) => { if (m.type() === "error") { qa.consoleErrors.push(m.text()); ev({ type: "console", level: "error", text: m.text() }); } });
  page.on("pageerror", (e) => { qa.pageErrors.push(e.message); ev({ type: "pageerror", message: e.message }); });
  return qa;
}
const idem = () => ({ "content-type": "application/json", "x-idempotency-key": crypto.randomUUID() });

test("05 onboarding: a case's Documents open in an in-screen detail panel (sub-route)", async ({ page, request }, testInfo) => {
  const name = "E2E Docs UI " + crypto.randomUUID().slice(0, 8);
  const leadId = (await (await request.post("/api/staff/schools/crm", { headers: idem(), data: { school_name: name, city: "Delhi", state: "Delhi", country: "India", lead_source: "referral" } })).json()).data.lead.id as string;
  const caseId = (await (await request.post(`/api/staff/schools/crm/${leadId}/convert`, { headers: idem() })).json()).data.onboarding_case_id as string;

  // Sub-route works and returns the case's documents (read-only sub-collection).
  const sub = await (await request.get(`/api/staff/schools/onboarding/${caseId}/documents`)).json();
  expect(sub.ok).toBe(true);
  expect(Array.isArray(sub.data.items)).toBe(true);

  // Screen: the Documents detail panel opens in context for that case.
  const qa = installQa(page, testInfo);
  await page.goto("/staff/schools/onboarding");
  const row = page.locator("tr", { hasText: name });
  await expect(row).toBeVisible({ timeout: 20_000 });
  await row.getByRole("button", { name: "Documents" }).click();
  await expect(page.locator(".modal-body").getByRole("heading", { name: /Documents/ })).toBeVisible();

  expect(qa.pageErrors).toEqual([]);
  expect(qa.consoleErrors).toEqual([]);
});
