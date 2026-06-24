# Versa Browser Feedback Loop — Claude Code / Codex Implementation Instruction

> **Repo paths (this project).** App root = `versa-oms/app/` — so the proposed `playwright.config.ts`,
> `tests/journeys/`, `app/api/qa/events/route.ts`, `app/qa-recorder.tsx`, `scripts/qa/*`, and `package.json`
> all live under `versa-oms/app/`. Existing unit tests are at `versa-oms/app/tests/unit/` (catalogued in
> `spec/TEST_REGISTRY.md`, P4.7); journey/e2e tests are the "JRN e2e" referenced in `spec/BUILD_PROCESS.md`
> step 9. **Playwright is already a dependency** (`@playwright/test`, used by `versa-oms/app/scripts/shot.mjs`).
> "Resolve test staff actor" = our dev/system actor (`ALLOW_DEV_AUTH=true`, the approved testing exception in
> `spec/brain/brain/02_quality_bar.md`). **Windows:** the `dev:qa` `... | tee` script needs a Node wrapper
> (`scripts/qa/dev-server.js`) — bash `tee` won't work in the default Windows shell.
> Status: this is an INSTRUCTION/spec (not yet implemented) — implement via `BUILD_PROCESS.md` as a CR when scheduled.


## Purpose

Build a development QA feedback loop so the founder can open the dev URL, test pages, click buttons, trigger errors, and Claude Code / Codex can read real evidence from the browser and dev server instead of relying only on manual descriptions.

The goal is:

```text
Founder opens dev URL / tests manually
OR
Playwright opens pages automatically
↓
Browser console errors captured
↓
Network/API failures captured
↓
Dev server logs captured
↓
Screenshots/traces captured
↓
QA reports written to .qa/
↓
Claude reads .qa/
↓
Claude diagnoses feature/screen/API/effect/test gap
↓
Claude fixes smallest correct slice
↓
Claude reruns test
↓
Claude updates completed/pending summary (reports/BUILD_STATUS.md)
```

---

# 1. Read First

Before installing or coding, read:

```text
spec/brain/*
spec/skills/*
latest completed/pending summary (reports/BUILD_STATUS.md)
spec/feature_effects/catalogs/FEATURE_EFFECT_CATALOG.json
spec/feature_effects/catalogs/SCREEN_CONTRACTS.json
spec/feature_effects/catalogs/JOURNEY_ACCEPTANCE_TESTS.json
spec/feature_effects/catalogs/CROSS_MODULE_EFFECT_CHAINS.json
design-system/DESIGN_SYSTEM.md
API contract files
current package.json
current app routes
current test setup
```

Apply these skills:

```text
00 Project Reader
02 Effect Chain
03 Screen Contract
04 Journey Test
05 API Contract
08 Security Privacy
12 Observability
13 UI Design System
15 CI Deployment
16 Completion Verification
17 Gap Detection
```

---

# 2. Task

Recommend, install and wire the best local QA feedback infrastructure for this repo.

Do not assume the stack blindly.

Inspect the repo first, then choose the smallest correct implementation.

Expected default stack if repo is Next.js / React:

```text
Playwright
Playwright HTML report
Playwright trace viewer
Dev-server log capture
Browser console capture
Network/API error capture
Manual QA event recorder
.qa artifact folder
Journey test generator structure
```

Optional only if useful:

```text
Playwright MCP
MSW
axe accessibility check
Vitest integration
GitHub Actions workflow for QA journeys
```

Do not install unnecessary heavy tools.

---

# 3. Required Output Folder

Create:

```text
.qa/
  logs/
    dev-server.log
    browser-console.log
    network-errors.log
    qa-events.jsonl
  reports/
    latest-run-summary.json
    latest-run-summary.md
  screenshots/
  traces/
  videos/
  fixtures/
```

`.qa/` should be generated runtime output.

Add to `.gitignore`:

```text
.qa/logs/*
.qa/reports/*
.qa/screenshots/*
.qa/traces/*
.qa/videos/*
test-results/
playwright-report/
```

Keep templates/configs committed, not runtime logs.

---

# 4. Required Files To Add

Add or update:

```text
playwright.config.ts
tests/journeys/README.md
tests/journeys/00_health.spec.ts
tests/journeys/01_company_dashboard.spec.ts
tests/journeys/02_crm_to_onboarding.spec.ts
tests/journeys/helpers/qaLogger.ts
tests/journeys/helpers/auth.ts
tests/journeys/helpers/network.ts
tests/journeys/helpers/assertions.ts
tests/journeys/helpers/screenshots.ts
app/qa-recorder.tsx              # only if app router/layout supports it
app/api/qa/events/route.ts       # dev-only endpoint, if Next.js
scripts/qa/dev-server.js         # optional wrapper
scripts/qa/summarize-playwright.js
scripts/qa/check-qa-readiness.js
```

If repo structure differs, adapt paths but preserve the architecture.

---

# 5. Required package.json Scripts

Add scripts appropriate to the repo.

Expected Next.js version:

```json
{
  "scripts": {
    "dev:qa": "next dev 2>&1 | tee .qa/logs/dev-server.log",
    "test:journeys": "playwright test",
    "test:journeys:headed": "playwright test --headed",
    "test:journeys:debug": "playwright test --debug",
    "qa:report": "playwright show-report",
    "qa:summary": "node scripts/qa/summarize-playwright.js",
    "qa:check": "node scripts/qa/check-qa-readiness.js"
  }
}
```

If Windows compatibility is required, avoid shell-only `tee` or add a Node wrapper.

---

# 6. Install Dependencies

If Playwright is not installed:

```bash
npm install -D @playwright/test
npx playwright install
```

If using accessibility checks:

```bash
npm install -D @axe-core/playwright
```

Only install `@axe-core/playwright` if you actually wire at least one useful accessibility check.

Do not add Playwright MCP unless explicitly useful in the environment.

---

# 7. Playwright Configuration Requirements

`playwright.config.ts` must:

- use baseURL from env or default localhost.
- start dev server automatically if possible.
- capture traces on failure.
- capture screenshots on failure.
- capture videos only on failure or retain-on-failure.
- write reports into Playwright output/report folders.
- support Chromium first.
- optionally support WebKit for iOS-like browser behavior.
- not depend on production secrets.
- run only against local/staging test environment.

Expected base pattern:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/journeys',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: '.qa/reports/playwright-results.json' }],
    ['list']
  ],
  use: {
    baseURL: process.env.QA_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run dev:qa',
    url: process.env.QA_BASE_URL ?? 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
});
```

Adapt if the repo already has its own test config.

---

# 8. Browser Console and Network Capture

Every journey test must capture:

```text
console.error
pageerror
failed request
HTTP 400+
uncaught browser exception
React error boundary text if visible
```

Helper should write:

```text
.qa/logs/browser-console.log
.qa/logs/network-errors.log
.qa/logs/qa-events.jsonl
```

Minimum helper behavior:

```ts
page.on('console', msg => {
  if (['error', 'warning'].includes(msg.type())) {
    appendQaEvent({ type: 'console', level: msg.type(), text: msg.text(), url: page.url() });
  }
});

page.on('pageerror', err => {
  appendQaEvent({ type: 'pageerror', message: err.message, stack: err.stack, url: page.url() });
});

page.on('requestfailed', req => {
  appendQaEvent({ type: 'requestfailed', url: req.url(), method: req.method(), failure: req.failure()?.errorText });
});

page.on('response', async res => {
  if (res.status() >= 400) {
    appendQaEvent({ type: 'http_error', url: res.url(), status: res.status(), statusText: res.statusText() });
  }
});
```

Do not log sensitive payloads.

---

# 9. Manual Browser QA Recorder

Add a dev-only recorder so when the founder manually clicks in the browser, events are sent to `.qa/logs/qa-events.jsonl`.

This must only run when:

```text
NODE_ENV !== 'production'
and
NEXT_PUBLIC_QA_RECORDER_ENABLED=true
```

Recorder should capture:

```text
page load
route change
button click
link click
form submit
console.error
unhandledrejection
window.onerror
fetch failure
HTTP 400+
visible error boundary if possible
```

Recorder must not capture:

```text
password
token
OTP
signed URL
full request body
raw OMR
answer key
provider payload
parent phone/email
```

For manual clicks, store safe event:

```json
{
  "time": "ISO",
  "type": "click",
  "route": "/staff/school-crm",
  "tag": "button",
  "text": "Convert to onboarding",
  "testId": "convert-lead-button"
}
```

Do not store sensitive form values.

---

# 10. Dev-Only QA Events API

If using Next.js, create:

```text
app/api/qa/events/route.ts
```

Rules:

- dev/test only.
- disabled in production.
- accepts safe QA events.
- appends to `.qa/logs/qa-events.jsonl`.
- redacts sensitive keys.
- rejects large payloads.
- never writes production data.

If environment is production, return 404.

---

# 11. First Required Journey Tests

Implement these first.

## 00 Health

```text
Open /
Verify no console errors
Open /api/health
Verify 200
Capture summary
```

## 01 Company Dashboard

```text
Login/resolve test staff actor
Open staff dashboard
Verify dashboard screen loads
Verify no console/page/network errors
Verify navigation visible
Verify at least one module card/table/list exists
```

## 02 CRM to Onboarding

This is the first real founder journey.

```text
Login/resolve Sales Executive or Admin
Open School CRM
Create or select test lead
Click Convert to Onboarding
Verify API succeeds
Verify lead stage becomes converted
Verify school created or linked
Verify onboarding case created
Verify onboarding task created
Verify onboarding queue shows the case
Verify dashboard count updates
Verify audit event exists
Verify unauthorized actor cannot perform conversion
Verify sensitive fields masked
```

If real DB is not wired, test must say:

```text
BLOCKED_REAL_DB_REQUIRED
```

Do not fake pass.

---

# 12. QA Summary File

After each Playwright run, generate:

```text
.qa/reports/latest-run-summary.json
.qa/reports/latest-run-summary.md
```

Summary must include:

```json
{
  "status": "pass|fail|blocked",
  "started_at": "...",
  "ended_at": "...",
  "base_url": "...",
  "tests_total": 0,
  "tests_passed": 0,
  "tests_failed": 0,
  "tests_blocked": 0,
  "console_errors": 0,
  "network_errors": 0,
  "screenshots": [],
  "traces": [],
  "top_failures": [
    {
      "test": "...",
      "screen": "...",
      "action": "...",
      "api": "...",
      "error": "...",
      "suspected_gap": "effect_chain|screen_contract|api|db|auth|storage|journey|infra"
    }
  ],
  "recommended_next_fix": "..."
}
```

---

# 13. Claude Debug Loop

After running QA, Claude must read:

```text
.qa/reports/latest-run-summary.json
.qa/logs/dev-server.log
.qa/logs/browser-console.log
.qa/logs/network-errors.log
.qa/logs/qa-events.jsonl
playwright-report
test-results
```

Then produce:

```text
OBSERVED FAILURE:
SCREEN:
ACTION:
API:
ERROR:
ROOT CAUSE:
MISSING LAYER:
FIX PLAN:
FILES TO CHANGE:
TEST TO ADD/REPAIR:
```

Then fix the smallest correct slice.

---

# 14. Stop Conditions

Stop and report instead of pretending pass if:

```text
real DB not wired
real auth not wired
route protected but no test actor can login
storage/signed URL required but missing
API contract missing
screen contract missing
journey test missing
test data missing
production secret required
```

Use status:

```text
BLOCKED_INFRA
BLOCKED_SPEC
BLOCKED_AUTH
BLOCKED_DB
BLOCKED_STORAGE
BLOCKED_TEST_DATA
```

---

# 15. Security Rules

This QA loop is for local/staging only.

Never run it against production unless explicitly approved.

Never use real student data.

Never use real payment data.

Never log:

```text
password
token
session cookie
magic link
OTP
signed URL
raw OMR
answer key
provider payload
full parent contact
private file path
```

---

# 16. Acceptance Criteria

This implementation is complete only when:

```text
Playwright installed
playwright.config.ts added
.qa folder convention added
browser console capture works
network error capture works
dev-server log capture works
manual QA recorder works in dev only
qa-events.jsonl is written
latest-run-summary.json is generated
health journey exists
dashboard journey exists
CRM to onboarding journey exists or reports honest blocker
Claude debug loop instructions exist
package scripts added
.gitignore updated
all tests/scripts run or blocker reported
```

---

# 17. Final Output Required From Claude

After implementation, report:

```text
TECH SELECTED:
PACKS/SKILLS READ:
FILES ADDED:
FILES MODIFIED:
SCRIPTS ADDED:
COMMANDS RUN:
TEST OUTPUT:
QA ARTIFACTS CREATED:
WHAT WORKS:
WHAT IS BLOCKED:
NEXT FIX:
```

Do not say complete without evidence.

---

# 18. CR-1 — IMPLEMENTED (2026-06-24)

FR-QA-FEEDBACK-2026-0001 (CR-1). Integrated into the **existing** harness rather than forking a new one.

**Decisions / deviations from the generic instruction above (our conventions):**
- **Harness:** reused `tests/e2e/` on **port 3300** (`E2E_BASE_URL`) — the existing "JRN e2e" — not a new `tests/journeys/` on 3000. `vitest` stays scoped to `tests/unit/**` (no collision).
- **Capture is inlined per journey** (not a shared helper): Playwright 1.61 throws `context.conditions?.includes is not a function` on relative TS imports under Next's `moduleResolution: "bundler"` tsconfig; all 15 existing specs avoid relative imports for the same reason. Reintroduce a shared fixture once that's resolved (a CR-2 candidate).
- **Chromium only** for CR-1; WebKit/mobile deferred.
- **No QA recorder / dev-only `/api/qa/events` / axe / MSW** yet — deferred to CR-2 along with the `02_crm_to_onboarding` browser journey (the API-level CRM→onboarding chain is already covered by `tests/e2e/crm_convert.spec.ts` + `chain2..5`).

**Delivered:** `playwright.config.ts` (reporters → `.qa/reports`, traces/screenshots/video on failure, auto `webServer` = `dev:qa`), `scripts/qa/dev-server.js` (Windows-safe tee, port 3300), `scripts/qa/summarize-playwright.js`, `.qa/` convention + README + `.gitignore`, package scripts (`dev:qa`, `test:journeys[:headed]`, `qa:report`, `qa:summary`), and journeys `tests/e2e/00_health.spec.ts` + `01_dashboard.spec.ts`.

**Evidence:** `npm run test:journeys` → 2 passed (~6s) against the live dev server + remote DB; `npm run qa:summary` → `pass — 2/2`; `tsc --noEmit` clean; unit suite unaffected. Registered in `spec/TEST_REGISTRY.md`.

---

# 19. CR-2 — IMPLEMENTED (2026-06-24)

FR-QA-FEEDBACK-2026-0001 (CR-2). Added the flagship **browser** journey `tests/e2e/02_crm_to_onboarding.spec.ts`:
create a lead (API setup) → drive **Convert** through the CRM screen (row action + confirm dialog) → assert the
lead shows **converted** on-screen → verify the downstream effect (lead converted + school + onboarding case
`submitted` + task) via API → confirm the onboarding queue screen renders. Capture inlined (per CR-1 §18).

**Scope note:** the API-level CRM→onboarding chain remains covered by `crm_convert.spec.ts` + `chain2..5`; CR-2 adds the
screen→action→effect proof. The onboarding screen has no search toolbar, so queue membership is API-verified (same data
the screen renders); deep UI scraping across pagination is intentionally avoided (not flaky-by-design).

**Deferred (CR-3 candidates):** shared capture fixture (pending a Playwright fix for relative-import resolution under
Next's bundler tsconfig), the manual QA recorder + dev-only `/api/qa/events`, axe accessibility checks, WebKit project.

**Evidence:** `npm run test:journeys` (00+01+02) → **3 passed (~25s)** against the live dev server + remote DB;
`npm run qa:summary` → `pass — 3/3`; `tsc --noEmit` clean. Registered in `spec/TEST_REGISTRY.md`.
