// Screenshot a page with Playwright. Usage: node scripts/shot.mjs <url> <outPath>
import { chromium } from "@playwright/test";

const url = process.argv[2];
const out = process.argv[3];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 90000 }).catch((e) => {
  console.error("nav warn:", e.message);
  return null;
});
await page.waitForTimeout(3000);
await page.screenshot({ path: out, fullPage: true });
const title = await page.title();
await browser.close();
console.log(JSON.stringify({ url, status: resp ? resp.status() : null, title, out }));
