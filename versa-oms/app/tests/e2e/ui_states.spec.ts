import { test, expect } from "@playwright/test";

// Negative pack UI-001 (no broken blank screen) + UI-010 (no blocking runtime errors). The custom staff
// pages must actually render in a browser — heading visible, no uncaught page errors. (Visual/mobile/a11y
// cases UI-005/UI-011/UI-012 remain manual/visual QA — see reports/NEGATIVE_TEST_STATUS.md.)
const PAGES = [
  { path: "/staff/security-audit/integrity", heading: /Audit Integrity/i },
  { path: "/staff/reports/exports", heading: /Sensitive Exports/i },
  { path: "/staff/admin/settings/changes", heading: /Setting Changes/i },
];

for (const p of PAGES) {
  test(`renders without a blank screen or runtime error: ${p.path} (UI-001/UI-010)`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(String(e)));
    await page.goto(p.path, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: p.heading })).toBeVisible({ timeout: 20000 });
    expect(pageErrors, `uncaught runtime errors on ${p.path}`).toEqual([]);
  });
}

test("an interactive control is clickable and tolerates a double-click (UI-007)", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  await page.goto("/staff/security-audit/integrity", { waitUntil: "domcontentloaded" });
  const btn = page.getByRole("button", { name: /Verify audit integrity/i });
  await expect(btn).toBeVisible({ timeout: 20000 });
  await btn.click();
  await btn.click({ force: true }).catch(() => { /* disabled while busy is fine */ });
  expect(pageErrors, "no runtime error on rapid clicks").toEqual([]);
});
