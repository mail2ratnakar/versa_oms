import { defineConfig } from "@playwright/test";

// E2E/journey tests run against the live dev server (keep `next dev` on :3300).
// FR-QA-FEEDBACK-2026-0001 (CR-1): browser QA feedback loop — capture + .qa artifacts + auto dev server.
// See spec/BROWSER_FEEDBACK_LOOP.md. Run: `npm run test:journeys` (auto-starts `npm run dev:qa`).
const BASE_URL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3300";

export default defineConfig({
  testDir: "./tests/e2e",
  // Warm fixture routes + the DB connection pool so the first cold query doesn't silently test.skip.
  globalSetup: "./tests/global-setup.ts",
  fullyParallel: false,
  workers: 1, // e2e share live DB state — run serially to avoid cross-test races
  retries: 1, // the first test after a cold dev-server start can flake on Next's on-demand compile
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: ".qa/reports/playwright-results.json" }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev:qa",
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
