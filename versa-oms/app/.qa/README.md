# .qa — browser QA feedback loop artifacts (runtime)

FR-QA-FEEDBACK-2026-0001 (CR-1). See `spec/BROWSER_FEEDBACK_LOOP.md`.

Everything under here **except this README is gitignored** — it's regenerated each run.

```
.qa/
  logs/      dev-server.log · browser-console.log · network-errors.log · qa-events.jsonl
  reports/   playwright-results.json (Playwright JSON) · latest-run-summary.{json,md}
  screenshots/ traces/ videos/   (Playwright, on failure)
```

## Run

```
npm run test:journeys     # auto-starts dev:qa (next dev -p 3300), runs tests/e2e, writes .qa/reports + on-failure traces
npm run qa:summary        # condense playwright-results.json -> latest-run-summary.{json,md}
npm run qa:report         # open the Playwright HTML report
```

Page-level journeys opt into capture via `tests/e2e/helpers/qaCapture.ts` (`attachQaCapture(page, testInfo)`),
which records console/page/network/HTTP-4xx errors (redacting secrets) to `logs/`.

## Claude debug loop

After a run, read `reports/latest-run-summary.json` + `logs/*`, then diagnose the failing layer
(feature → screen → API → state → DB → effect → audit → journey) and fix the smallest correct slice.

> Local/staging only. Never run against production; never use real student/payment data; never log secrets (see spec/BROWSER_FEEDBACK_LOOP.md §15).
