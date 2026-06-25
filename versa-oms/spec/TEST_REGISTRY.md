# Test Registry (PRINCIPLES P4.7)

The reference index of every test, and the source for the **smoke-test stage**.
Update this file in the same CR that adds/changes tests.

- **Unit (vitest):** `cd versa-oms/app && npx vitest run` (scoped to `tests/unit/**`).
- **Journey/e2e (Playwright):** `cd versa-oms/app && npm run test:journeys` (auto-starts `dev:qa` on :3300; runs `tests/e2e/**`; writes `.qa/reports` + on-failure traces). Then `npm run qa:summary`. See `spec/BROWSER_FEEDBACK_LOOP.md`.

- **Schema guardrails:** `python _validation/check_unique_constraints.py` (FR-SCHEMA-UNIQUES-0007 + FR-NOTIFY-FANOUT-0014 — fails on bad single-column UNIQUEs on FK/version cols **or columns that shadow a composite natural key**) + `check_schema_drift.py` (conditional-NOT-NULL/timestamp classes). Run after any migration.
- **Smoke** = part of the fast pre-deploy gate (auth/scope/masking, envelopes, kernel create/transition, dual-approval, and each shipped feature's headline path).
- Counts are `it()` blocks per file. Totals: **42 files / 253 tests** (unit) + journey suite (52 e2e, as of 2026-06-25). The suite is now STABLE at **42 passed + 1 skipped** (the 1 skip is the auth-pending isolation test). FR-QA-FIXTURE-ROBUSTNESS-0012 killed the intermittent cold-start/page-cap skips via `tests/global-setup.ts` (warm fixture routes + precompile pages) + search-based (`?q=`) seed lookups. RULE: look up seed fixtures by `?q=<code>` (search), never `?page_size=200` + find (the kernel caps page_size at 100; accumulated test data pushes seeds off page 1). FR-QA-LOOKUP-SWEEP-0015 finished converting ALL remaining lookups — the suite has zero `?page_size=200`+find seed lookups left.

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
| child_write.test.ts | 5 | FR-0004/0005 addChildRecord/reviewChildRecord: add+review child, code-gen + parent-inherit + mass-assignment-safe, audited | ✅ |
| guards_app_wide.test.ts | 5 | FR-GATES-0001 app-wide lifecycle guards: finance double-pay blocked, onboarding regression, unmapped permissive | ✅ |
| dashboard_scope.test.ts | 3 | FR-DASH-SCOPE-0001 dashboard counts scoped to assignment (no non-admin global-total leak) | ✅ |
| masking_extended.test.ts | 3 | FR-MASK-0001 extended field masking (coordinator PII/file/secret/contacts) + super_admin unmask escape | ✅ |
| create_compute.test.ts | 3 | FR-AMOUNT-0001 server-calculated invoice amounts (browser totals ignored) | ✅ |
| roster_ingest.test.ts | 21 | FR-STUDENT-ROSTER-OPS-0002 CSV/XLSX ingestion engine: parse (quotes/BOM/escapes), required-col + grade-set + consent validation, dedupe (roll/name+grade), forbidden-column reject, size/type gate; commit-decision (validated only when clean); lifecycle gates wired (validate/lock preconditions, school_roster from-state) | ✅ |
| secure_download.test.ts | 6 | FR-SECURE-FILE-DOWNLOAD-0003 storeFile object-path safety (no traversal, scoped, truncation), private bucket, secure-download factory wired | ✅ |
| cert_generation.test.ts | 5 | FR-CERT-GENERATION-0004 server-gen certificate_number/verification_code (client ignored, unguessable), publish/revoke domain effects registered, public verify response whitelist (no PII/score/id leak), revoked/not_found states | ✅ |
| cert_pdf.test.ts | 3 | FR-CERT-PDF-0005 renderCertificatePdf produces a real %PDF buffer (with embedded QR) incl. no-optional-fields; generate domain effect registered | ✅ |
| results_ranking.test.ts | 6 | FR-RESULTS-RANKING-0006 competition ranking (ties share rank 1,2,2,4 + tie-break), published-result immutability (assertNotPublished) + versioning (nextResultVersion), generate effect registered | ✅ |
| omr_scoring.test.ts | 5 | FR-OMR-SCORING-0008 scoreResponses: all-correct/partial(correct,wrong,blank)/all-wrong, negative marking, case-insensitive+trim | ✅ |
| result_handoff.test.ts | 4 | FR-RESULT-HANDOFF-0009 pure mapping: answerKeyMaxScore (questions*marks, flat map, null) + scoreToResultRow (percentage 50/75/100/0, fields, divide-by-zero guard) | ✅ |
| omr_import.test.ts | 6 | FR-OMR-IMPORT-0010 parseOmrResponses: candidate_id+Q* → payloads, header uppercasing/trim, missing-candidate/no-Q-col rejects, blank+dup flagged (not dropped), non-Q cols ignored | ✅ |
| cert_seal.test.ts | 5 | FR-CERT-SEAL-0011 certificateSeal/verifyCertificateSeal: deterministic, changes on ANY field tamper, changes with secret (unforgeable), true/false + integrity_verified in publicVerificationResponse | ✅ |
| slot_capacity.test.ts | 7 | FR-SLOT-CAPACITY-0013 checkSlotCapacity: within/at/over seat cap, single>slot, school-limit (new vs re-booking), non-positive count | ✅ |
| notification_fanout.test.ts | 8 | FR-NOTIFY-FANOUT-0014 resolveRecipients (4) + FR-NOTIFY-CHANNEL-0016 channelAddressFor (4): email→email, sms/whatsapp→mobile, in_app/push→logical fallback, missing-field→fallback (assertions reference inputs, P0.9) | ✅ |
| material_release_gate.test.ts | 7 | FR-MATERIAL-RELEASE-0018 packageReleaseGate: released+past→allow, downloaded→allow, future/unreleased→block, revoked pkg/superseded file→block, null release_at→block | ✅ |
| roster_validation.test.ts | 4 | FR-ANSWER-SHEET-ROSTER-VALIDATION-0020 partitionByRoster: known→valid + unknown rejected, empty roster→all rejected, all-known→none rejected, empty input | ✅ |

## Journey / e2e tests (Playwright — `tests/e2e/`, port 3300)

The "JRN e2e" of `BUILD_PROCESS.md`. Run via `npm run test:journeys`. Browser smoke journeys (FR-QA-FEEDBACK-2026-0001 CR-1) capture console/page/network errors into `.qa/logs` (capture is inlined per spec — Playwright 1.61 crashes on relative TS helper imports under Next's bundler tsconfig).

| File | Covers | Smoke |
|---|---|---|
| 00_health.spec.ts | `/api/health` 200 + home renders, no console/page errors | ✅ |
| 01_dashboard.spec.ts | `/staff/dashboard` renders for the dev/system actor, no console/page/http errors | ✅ |
| 02_crm_to_onboarding.spec.ts | CRM screen → Convert (confirm dialog) → lead shows converted + onboarding case/task/school created (UI + API) | ✅ |
| 03_onboarding_toolbar.spec.ts | FR-UI-HARDENING: kernel listConfig facets+filter server-side; onboarding page renders toolbar (search+status pills) + clean columns (no normalized_*) | ✅ |
| 04_onboarding_actions.spec.ts | FR-UI-HARDENING #2: destructive action (Reject) shows confirm warning + requires a reason before confirm (P1.6/P1.8) | ✅ |
| 05_onboarding_documents.spec.ts | FR-0002/0003 detail panels: a case shows multiple generated panels (Documents/Events/Status Controls); Documents opens in-screen via the sub-route (read-only) | ✅ |
| 06_onboarding_doc_write.spec.ts | FR-0004 write panel: register a document on a case + review (accept) in-screen | ✅ |
| 07_finance_adjustment.spec.ts | FR-0005 write panel (2nd module): request an adjustment on an invoice — server code + inherited school_id + draft default; needs seed_chain3.sql | ✅ |
| roster_ingest.spec.ts | FR-STUDENT-ROSTER-OPS-0002: clean CSV → validated + students committed + submit; invalid rows → validation_failed, no students, submit blocked; forbidden column → 422; un-ingested batch submit blocked; concurrent ingest → only one commits (CAS claim); needs seed_chain3.sql | ✅ |
| roster_file.spec.ts | FR-SECURE-FILE-DOWNLOAD-0003: roster source file stored privately on ingest → GET /file returns a real short-lived signed URL (+expiry); cross-school IDOR → 404; no-file batch → 409 (never a fake URL); needs seed_chain3.sql + live Supabase Storage | ✅ |
| cert_generation.spec.ts | FR-CERT-GENERATION-0004: create certificate → server-gen CERT-/VRS- identity (client number ignored) + persists; publish → public /verify returns valid + whitelisted candidate_name (no id leak); revoke → /verify reflects revoked; needs seed_chain3.sql | ✅ |
| cert_pdf.spec.ts | FR-CERT-PDF-0005: generate renders + privately stores the cert PDF; staff + owning school download via real signed URL (certificate-files bucket); cross-school 404; pre-generate 409; needs seed_chain3.sql + live Storage | ✅ |
| results_ranking.spec.ts | FR-RESULTS-RANKING-0006: results_ops:generate ranks candidate_results (national_rank 1,2,2,4) + eligibility snapshot (eligible vs not_eligible by threshold); published result batch PATCH → 422 immutable; needs seed_chain3.sql (E2E-RESBATCH-CH6 + 4 scored candidates, E2E-RESBATCH-PUB). Asserts the ranking INVARIANT (idempotent across runs) not the single generate call | ✅ |
| omr_scoring.spec.ts | FR-OMR-SCORING-0008: POST score-batches/[id]/score reads responses + approved answer key → persists evaluation_candidate_scores (raw_score 4 / 2[2c,1w,1b] / 0[4w]); needs seed_chain3.sql (E2E-SCORE-CH6 + E2E-AKEY-7002 approved + E2ESCORE-1/2/3) | ✅ |
| result_handoff.spec.ts | FR-RESULT-HANDOFF-0009: score the batch → results_ops:generate derives candidate_results from the scores (raw 4/2/0 → pct 100/50/0) + ranks (top=rank1) + eligibility (eligible vs not_eligible); needs seed_chain3.sql (E2E-RESBATCH-HANDOFF linked to E2E-SCORE-CH6). Asserts the derived+ranked INVARIANT (idempotent) | ✅ |
| omr_import.spec.ts | FR-OMR-IMPORT-0010: POST import-batches/[id]/ingest a responses CSV → evaluation_candidate_responses persisted (payloads {Q1..Q4}); isolated fixture E2E-IMP-OMR (school-scoped); unique candidate_ids per run | ✅ |
| cert_seal.spec.ts | FR-CERT-SEAL-0011: create cert → publish → /verify returns integrity_verified=true (sealed); pre-publish integrity_verified=false. Tamper-detection is unit-tested. needs seed_chain3.sql | ✅ |
| slot_capacity.spec.ts | FR-SLOT-CAPACITY-0013: book 1 seat on E2E-SLOT-CH5 (500 cap) → ok; book 600 → 422 capacity-exceeded; needs seed_chain3.sql | ✅ |
| notification_fanout.spec.ts | FR-NOTIFY-FANOUT-0014 + 0016: drain → templated event fanned (event_triggered batch w/ template + school_user recipient @ the school's real coordinator_email), no-template event suppressed; resets the 2 seed events; needs seed_chain3.sql | ✅ |
| notification_autotrigger.spec.ts | FR-NOTIFY-AUTOTRIGGER-0017: record a CRM follow-up → a crm_followup_due batch (source_entity_id = interaction) exists WITHOUT a drain call (raise auto-dispatches); needs seed_chain3.sql crm_followup_due template | ✅ |
| material_download.spec.ts | FR-MATERIAL-RELEASE-0018: school downloads a released exam-material file → 200 + signed URL; scheduled (future release_at) → 403; cross-school → 404. Uploads the storage object in setup; needs seed_chain3.sql material fixtures | ✅ |
| admin_settings_change.spec.ts | WF-014 / FR-ADMIN-SETTINGS-CHAIN-0025: propose setting change → maker-checker approve (2 distinct) → maker-checker apply (2 distinct) → new setting_version active + old superseded | ✅ |
| export_chain.spec.ts | WF-011 / FR-EXPORT-CHAIN-0024: request sensitive export → maker-checker (1st approval not applied, 2nd distinct approver approves; self-approval can't apply) → generate private watermarked file → secure signed-URL download → expired blocked | ✅ |
| support_ticket.spec.ts | WF-010 / FR-SUPPORT-CHAIN-0023: school raises a ticket (TIC-…) → staff add internal_note (staff_only) + school_visible reply + resolve → school GET shows resolution + school_visible reply but NOT the internal note; no school_id echoed; cross-school 404 | ✅ |
| courier_dispatch.spec.ts | WF-006 / FR-COURIER-CHAIN-0022: dispatch a shipment (server-generated code CS-…) → mark_in_transit → delivered → received; raise a courier exception → start_review → resolved | ✅ |
| answer_sheet_upload.spec.ts | FR-ANSWER-SHEET-UPLOAD-0019 + ROSTER-VALIDATION-0020: school POSTs an OMR CSV (1 rostered + 1 off-roster id) → only the rostered candidate ingested (imported=1), the unknown id rejected + surfaced, batch visible in the school's list | ✅ |
| _seed lookups | NOTE: e2e fetch the seed school via `?q=E2E-CH3-SCH` (server-side search), NOT `?page_size=200` — the kernel caps page_size at 100 and accumulated test schools (>100) pushed the oldest seed off page 1 (was silently skipping 15 tests). Look up seeds by code/search, never by page-find. | ✅ |
| crm_convert · chain2..5 · crm_toolbar/list_ux · school_* · staff_secondary · isolation · onboarding_guard | existing CHAIN-001..005 + CRM/school/staff API journeys | — |
