import { test, expect, type Page, type TestInfo } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// FR-UI-HARDENING-2026-0001 — validate the generator CR (gen_modules listConfig + gen_ui toolbar/clean columns)
// on the spine module school_onboarding_ops: the page ships a working toolbar (status facet + search), the
// kernel list filters/facets server-side, and system/normalized fields are no longer columns (P2.9).
const LOG = path.resolve(process.cwd(), ".qa/logs");
function installQa(page: Page, ti: TestInfo) {
  const qa = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  const ev = (o: Record<string, unknown>) => { fs.mkdirSync(LOG, { recursive: true }); fs.appendFileSync(path.join(LOG, "qa-events.jsonl"), JSON.stringify({ time: new Date().toISOString(), test: ti.title, ...o }) + "\n"); };
  page.on("console", (m) => { if (m.type() === "error") { qa.consoleErrors.push(m.text()); ev({ type: "console", level: "error", text: m.text() }); } });
  page.on("pageerror", (e) => { qa.pageErrors.push(e.message); ev({ type: "pageerror", message: e.message }); });
  return qa;
}

test("03 onboarding: server list filters+facets via listConfig; page renders a toolbar with clean columns", async ({ page, request }, testInfo) => {
  // Server: the kernel list returns facet counts when ?facet=<col> is requested (listConfig.facetColumn).
  const list = (await (await request.get("/api/staff/schools/onboarding?facet=onboarding_status")).json()).data;
  expect(list.facets, "facet counts present").toBeTruthy();
  expect(typeof list.facets._all, "facet _all total present").toBe("number");
  const filtered = (await (await request.get("/api/staff/schools/onboarding?onboarding_status=submitted&page_size=50")).json()).data.items as Array<Record<string, unknown>>;
  for (const it of filtered) expect(it.onboarding_status, "status filter applied server-side").toBe("submitted");

  // Screen: toolbar (status facet pills + search) renders; system column is gone (P2.9).
  const qa = installQa(page, testInfo);
  await page.goto("/staff/schools/onboarding");
  await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 20_000 });
  const pill = page.getByRole("button", { name: /Submitted/ });
  await expect(pill.first()).toBeVisible();
  await expect(page.locator("thead")).not.toContainText(/normalized/i);
  // Facet pill click filters without error.
  await pill.first().click();
  await expect(page.getByPlaceholder(/search/i)).toBeVisible();

  expect(qa.pageErrors, "no uncaught page errors").toEqual([]);
  expect(qa.consoleErrors, "no console errors").toEqual([]);
});
