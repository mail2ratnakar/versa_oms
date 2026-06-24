import { test, expect } from "@playwright/test";

// Unit tests for FR-SCHOOL-CRM-2026-0003 (P4.6: test each unit).
const idem = () => ({ "content-type": "application/json", "x-idempotency-key": crypto.randomUUID() });
const CRM = "/api/staff/schools/crm";

// Fix 1 (data): a newly created lead is the newest -> first row on the default page 1.
test("new lead lands at the top of page 1 (newest-first)", async ({ request }) => {
  const name = `Top${Date.now().toString().slice(-7)} School`;
  const cr = await request.post(CRM, { headers: idem(), data: { school_name: name, city: "Pune", state: "Maharashtra", country: "India", lead_source: "referral" } });
  expect(cr.status()).toBe(201);
  const items = (await (await request.get(`${CRM}?page=1&page_size=5`)).json()).data.items as Array<Record<string, unknown>>;
  expect(String(items[0]?.school_name)).toBe(name);
});

// Fix 2 (UI): clicking Next returns the user to the top of the list.
test("paging scrolls back to the top of the list", async ({ page }) => {
  await page.goto("/staff/schools/crm");
  await page.locator(".list-pager").waitFor({ timeout: 20000 }); // pager renders once data + pagination load
  const next = page.locator(".pager-btns button", { hasText: "Next" });
  test.skip(!(await next.isEnabled()), "no second page available");
  await next.scrollIntoViewIfNeeded();
  const yBefore = await page.evaluate(() => window.scrollY);
  expect(yBefore).toBeGreaterThan(40); // we scrolled down to reach the pager
  await next.click();
  await page.waitForFunction(() => window.scrollY < 150, null, { timeout: 5000 }); // wait for the smooth scroll to settle
  const yAfter = await page.evaluate(() => window.scrollY);
  expect(yAfter).toBeLessThan(yBefore);
  expect(yAfter).toBeLessThan(150); // back near the top
});
