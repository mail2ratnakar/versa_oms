import { defineConfig } from "@playwright/test";

// E2E/journey tests run against the live dev server (keep `next dev` on :3300).
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  reporter: "list",
  use: { baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3300" },
});
