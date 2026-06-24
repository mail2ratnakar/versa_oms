// FR-QA-FEEDBACK-2026-0001 (CR-1) — turn the Playwright JSON report into a compact QA summary
// (.qa/reports/latest-run-summary.{json,md}) that Claude reads to diagnose the next gap.
const fs = require("node:fs");
const path = require("node:path");

const RES = path.resolve(process.cwd(), ".qa/reports/playwright-results.json");
const OUT_JSON = path.resolve(process.cwd(), ".qa/reports/latest-run-summary.json");
const OUT_MD = path.resolve(process.cwd(), ".qa/reports/latest-run-summary.md");

if (!fs.existsSync(RES)) {
  console.error("No .qa/reports/playwright-results.json — run `npm run test:journeys` first.");
  process.exit(1);
}

const r = JSON.parse(fs.readFileSync(RES, "utf8"));
let passed = 0, failed = 0, skipped = 0;
const failures = [];

function walk(suite) {
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests ?? []) {
      const last = t.results?.[t.results.length - 1];
      const status = last?.status ?? t.status ?? "unknown";
      if (spec.ok === false || status === "failed" || status === "unexpected" || status === "timedOut") {
        failed++;
        failures.push({ test: spec.title, status, error: String(last?.error?.message ?? "").split("\n")[0] });
      } else if (status === "skipped") {
        skipped++;
      } else {
        passed++;
      }
    }
  }
  for (const child of suite.suites ?? []) walk(child);
}
for (const s of r.suites ?? []) walk(s);

const summary = {
  status: failed > 0 ? "fail" : passed > 0 ? "pass" : "blocked",
  generated_at: new Date().toISOString(),
  base_url: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3300",
  tests_total: passed + failed + skipped,
  tests_passed: passed,
  tests_failed: failed,
  tests_skipped: skipped,
  top_failures: failures.slice(0, 10),
};

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(summary, null, 2));
const md =
  `# QA Run Summary\n\n` +
  `- status: **${summary.status}**\n- generated: ${summary.generated_at}\n- base url: ${summary.base_url}\n` +
  `- total ${summary.tests_total} · passed ${summary.tests_passed} · failed ${summary.tests_failed} · skipped ${summary.tests_skipped}\n\n` +
  (failures.length ? "## Failures\n\n" + failures.map((f) => `- **${f.test}** (${f.status}) — ${f.error || ""}`).join("\n") + "\n" : "No failures.\n");
fs.writeFileSync(OUT_MD, md);

console.log(`QA summary: ${summary.status} — ${summary.tests_passed}/${summary.tests_total} passed, ${summary.tests_failed} failed, ${summary.tests_skipped} skipped`);
