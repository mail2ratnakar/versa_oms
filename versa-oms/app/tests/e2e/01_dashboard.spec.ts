import { test, expect, type Page, type TestInfo } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// FR-QA-FEEDBACK-2026-0001 (CR-1) — 01 Staff dashboard renders for the dev/system actor
// (ALLOW_DEV_AUTH=true, the approved testing exception) with no console/page/HTTP errors.
const LOG = path.resolve(process.cwd(), ".qa/logs");
const SENSITIVE = /password|token|secret|cookie|authorization|bearer|otp|magic|session|signed[_-]?url|answer[_-]?key|provider[_-]?payload|parent_(phone|email)/i;
const redact = (s: string) => (SENSITIVE.test(s) ? "[redacted]" : s);
function installQa(page: Page, ti: TestInfo) {
  const qa = { consoleErrors: [] as string[], pageErrors: [] as string[], httpErrors: [] as Array<{ url: string; status: number }> };
  const ev = (o: Record<string, unknown>) => { fs.mkdirSync(LOG, { recursive: true }); fs.appendFileSync(path.join(LOG, "qa-events.jsonl"), JSON.stringify({ time: new Date().toISOString(), test: ti.title, ...o }) + "\n"); };
  page.on("console", (m) => { if (m.type() === "error") { const x = redact(m.text()); qa.consoleErrors.push(x); ev({ type: "console", level: "error", text: x }); } });
  page.on("pageerror", (e) => { const x = redact(e.message); qa.pageErrors.push(x); ev({ type: "pageerror", message: x }); });
  page.on("response", (r) => { const rt = r.request().resourceType(); if (r.status() >= 400 && ["document", "xhr", "fetch"].includes(rt) && !r.url().includes("/favicon")) { const u = redact(r.url()); qa.httpErrors.push({ url: u, status: r.status() }); ev({ type: "http_error", url: u, status: r.status() }); } });
  return qa;
}

test("01 staff dashboard renders without console/page/http errors", async ({ page }, testInfo) => {
  const qa = installQa(page, testInfo);
  const resp = await page.goto("/staff/dashboard");
  expect(resp?.status() ?? 0, "dashboard route responds < 400").toBeLessThan(400);
  await expect(page.getByRole("heading").first()).toBeVisible();
  expect(qa.pageErrors, "no uncaught page errors").toEqual([]);
  expect(qa.consoleErrors, "no console errors").toEqual([]);
  expect(qa.httpErrors, "no failed app/API requests").toEqual([]);
});
