import { test, expect, type Page, type TestInfo } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// FR-QA-FEEDBACK-2026-0001 (CR-1) — 00 Health: API health responds + the home page renders in a real
// browser with no console/page errors. Capture is inlined (self-contained) to match the e2e convention —
// Playwright 1.61 crashes on relative TS helper imports under Next's bundler tsconfig (see tests/e2e/README.md).
const LOG = path.resolve(process.cwd(), ".qa/logs");
const SENSITIVE = /password|token|secret|cookie|authorization|bearer|otp|magic|session|signed[_-]?url|answer[_-]?key|provider[_-]?payload|parent_(phone|email)/i;
const redact = (s: string) => (SENSITIVE.test(s) ? "[redacted]" : s);
function installQa(page: Page, ti: TestInfo) {
  const qa = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  const ev = (o: Record<string, unknown>) => { fs.mkdirSync(LOG, { recursive: true }); fs.appendFileSync(path.join(LOG, "qa-events.jsonl"), JSON.stringify({ time: new Date().toISOString(), test: ti.title, ...o }) + "\n"); };
  page.on("console", (m) => { const t = m.type(); if (t === "error") { const x = redact(m.text()); qa.consoleErrors.push(x); ev({ type: "console", level: t, text: x }); } });
  page.on("pageerror", (e) => { const x = redact(e.message); qa.pageErrors.push(x); ev({ type: "pageerror", message: x }); });
  return qa;
}

test("00 health: /api/health is 200 and home renders without console/page errors", async ({ page, request }, testInfo) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(body.data.status).toBe("ok");

  const qa = installQa(page, testInfo);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /staff console/i })).toBeVisible();
  expect(qa.pageErrors, "no uncaught page errors on /").toEqual([]);
  expect(qa.consoleErrors, "no console errors on /").toEqual([]);
});
