# Test Registry (PRINCIPLES P4.7)

The reference index of every test, and the source for the **smoke-test stage**.
Update this file in the same CR that adds/changes tests.

- **Unit (vitest):** `cd versa-oms/app && npx vitest run` (scoped to `tests/unit/**`).
- **Journey/e2e (Playwright):** `cd versa-oms/app && npm run test:journeys` (auto-starts `dev:qa` on :3300; runs `tests/e2e/**`; writes `.qa/reports` + on-failure traces). Then `npm run qa:summary`. See `spec/BROWSER_FEEDBACK_LOOP.md`.

- **Smoke** = part of the fast pre-deploy gate (auth/scope/masking, envelopes, kernel create/transition, dual-approval, and each shipped feature's headline path).
- Counts are `it()` blocks per file. Totals: **23 files / 147 tests** (unit) + journey suite (as of 2026-06-24).

Smoke subset (run these for a quick gate):
`vitest run tests/unit/{foundation,scope,crm_scope,security,dual_approval,transitions,contract,crm_interactions,crm_import,crm_dedupe,crm_duplicates}.test.ts`

| File | # | Covers (describe groups) | Smoke |
|---|---|---|---|
| foundation.test.ts | 14 | http envelope · permission engine · field masking | ✅ |
| staff_identity.test.ts | 9 | FR-STAFF-USERS-0001 actor resolution: roles/scopes from real schema · fail-closed · system UUID | ✅ |
| scope.test.ts | 5 | staff assignment-scope | ✅ |
| crm_scope.test.ts | 10 | FR-0006 recordInScope · service A01 IDOR enforcement | ✅ |
| security.test.ts | 4 | forbidden PII fields rejected · self role-change blocked | ✅ |
| dual_approval.test.ts | 3 | dual-approval (maker≠checker) | ✅ |
| transitions.test.ts | 4 | spec-derived status transitions | ✅ |
| contract.test.ts | 3 | API contract: standard envelopes | ✅ |
| modules.test.ts | 6 | generated modules register policies · kernel validation/create | ✅ |
| privacy.test.ts | 2 | log redaction · public verification leaks nothing private | ✅ |
| crm_interactions.test.ts | 11 | FR-0004 Comms: canonical write · OWASP · concurrency | ✅ |
| crm_interactions_followup.test.ts | 11 | FR-0005 follow-up automation · edit-with-reason · OWASP · concurrency | ✅ |
| crm_import.test.ts | 16 | FR-0007/0008 staged import: validate/commit/cancel · dual-approval · OWASP · concurrency | ✅ |
| crm_dedupe.test.ts | 8 | FR-0010 findDuplicates parity (email/phone/website/name-key) + O(n) perf at 20k | ✅ |
| crm_duplicates.test.ts | 10 | FR-0009 duplicate review: resolve · merge (re-parent+archive) · convert-block · import surfacing · OWASP A01/A03/A09 | ✅ |
| computation.test.ts | 7 | OMR scoring · ranking · certificate verification · result immutability/versioning | — |
| generation.test.ts | 5 | notification delivery · export (CSV+watermark) · finance computation | — |
| workflow.test.ts | 4 | CRM duplicate detection · auto-task from workflow events · courier reconciliation | ✅ |
| jobs.test.ts | 4 | worker job runner | — |
| payments.test.ts | 3 | payment webhook signature | ✅ |
| school.test.ts | 3 | school portal services (school-scoped) | ✅ |
| candidate_id.test.ts | 3 | candidate-ID generation | — |
| list_child.test.ts | 2 | FR-0002 listChildRecords: detail-panel sub-collection query-by-FK + mask + fail-soft | ✅ |

## Journey / e2e tests (Playwright — `tests/e2e/`, port 3300)

The "JRN e2e" of `BUILD_PROCESS.md`. Run via `npm run test:journeys`. Browser smoke journeys (FR-QA-FEEDBACK-2026-0001 CR-1) capture console/page/network errors into `.qa/logs` (capture is inlined per spec — Playwright 1.61 crashes on relative TS helper imports under Next's bundler tsconfig).

| File | Covers | Smoke |
|---|---|---|
| 00_health.spec.ts | `/api/health` 200 + home renders, no console/page errors | ✅ |
| 01_dashboard.spec.ts | `/staff/dashboard` renders for the dev/system actor, no console/page/http errors | ✅ |
| 02_crm_to_onboarding.spec.ts | CRM screen → Convert (confirm dialog) → lead shows converted + onboarding case/task/school created (UI + API) | ✅ |
| 03_onboarding_toolbar.spec.ts | FR-UI-HARDENING: kernel listConfig facets+filter server-side; onboarding page renders toolbar (search+status pills) + clean columns (no normalized_*) | ✅ |
| 04_onboarding_actions.spec.ts | FR-UI-HARDENING #2: destructive action (Reject) shows confirm warning + requires a reason before confirm (P1.6/P1.8) | ✅ |
| 05_onboarding_documents.spec.ts | FR-0002 detail panel: a case's Documents open in-screen via the sub-route (read-only) | ✅ |
| crm_convert · chain2..5 · crm_toolbar/list_ux · school_* · staff_secondary · isolation · onboarding_guard | existing CHAIN-001..005 + CRM/school/staff API journeys | — |
