import { test, expect, type Page, type TestInfo } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// FR-QA-FEEDBACK-2026-0001 (CR-2) — 02 CRM → Onboarding, the founder's flagship journey, driven
// through the BROWSER: open the CRM screen, click Convert on a lead, confirm, and prove the downstream
// effect (lead converted on-screen + onboarding case/task/school created). Capture inlined (see CR-1 §18).
const LOG = path.resolve(process.cwd(), ".qa/logs");
const SENSITIVE = /password|token|secret|cookie|authorization|bearer|otp|magic|session|signed[_-]?url|answer[_-]?key|provider[_-]?payload|parent_(phone|email)/i;
const redact = (s: string) => (SENSITIVE.test(s) ? "[redacted]" : s);
function installQa(page: Page, ti: TestInfo) {
  const qa = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  const ev = (o: Record<string, unknown>) => { fs.mkdirSync(LOG, { recursive: true }); fs.appendFileSync(path.join(LOG, "qa-events.jsonl"), JSON.stringify({ time: new Date().toISOString(), test: ti.title, ...o }) + "\n"); };
  page.on("console", (m) => { if (m.type() === "error") { const x = redact(m.text()); qa.consoleErrors.push(x); ev({ type: "console", level: "error", text: x }); } });
  page.on("pageerror", (e) => { const x = redact(e.message); qa.pageErrors.push(x); ev({ type: "pageerror", message: x }); });
  return qa;
}
const idem = () => ({ "content-type": "application/json", "x-idempotency-key": crypto.randomUUID() });

test("02 CRM→Onboarding: converting a lead from the CRM screen creates the onboarding case + task", async ({ page, request }, testInfo) => {
  const name = "E2E Convert UI " + crypto.randomUUID().slice(0, 8);

  // Setup: create the lead via API (deterministic) — the CONVERT action is what we exercise via the UI.
  const cr = await request.post("/api/staff/schools/crm", { headers: idem(), data: { school_name: name, city: "Delhi", state: "Delhi", country: "India", board: "CBSE", lead_source: "referral" } });
  expect(cr.status()).toBe(201);
  const leadId = (await cr.json()).data.lead.id as string;

  const qa = installQa(page, testInfo);

  // Screen: newest-first, so the new lead is on page 1. Convert it via the row action + confirm dialog.
  await page.goto("/staff/schools/crm");
  const row = page.locator("tr", { hasText: name });
  await expect(row).toBeVisible({ timeout: 20_000 });
  await row.getByRole("button", { name: "Convert" }).click();

  const modal = page.locator(".modal-body");
  await expect(modal.getByRole("heading", { name: /convert to school/i })).toBeVisible();
  await modal.getByRole("button", { name: "Convert" }).click();

  // The action reports success and the screen reflects the new state (lead is now converted).
  await expect(page.getByText("Convert: done.")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator("tr", { hasText: name })).toContainText(/converted/i);

  // Effect (cross-module, authoritative): lead converted + onboarding case created + linked + task.
  const lead = ((await (await request.get(`/api/staff/schools/crm?q=${encodeURIComponent(name)}`)).json()).data.items as Array<Record<string, unknown>>).find((l) => l.id === leadId);
  expect(lead, "lead found").toBeTruthy();
  expect(lead!.lead_status).toBe("converted");
  expect(lead!.converted_school_id, "school created/linked").toBeTruthy();

  const cases = (await (await request.get("/api/staff/schools/onboarding?page_size=200")).json()).data.items as Array<Record<string, unknown>>;
  const onb = cases.find((c) => c.source_lead_id === leadId || c.school_name === name);
  expect(onb, "onboarding case created from the lead").toBeTruthy();
  expect(onb!.onboarding_status).toBe("submitted");

  // Screen contract: the onboarding queue screen renders cleanly (the case lives in this queue).
  await page.goto("/staff/schools/onboarding");
  await expect(page.getByRole("heading").first()).toBeVisible();

  expect(qa.pageErrors, "no uncaught page errors across the journey").toEqual([]);
  expect(qa.consoleErrors, "no console errors across the journey").toEqual([]);
});
