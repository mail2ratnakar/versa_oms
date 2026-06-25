# Versa OMS — Build Status (2026-06-25)

Stack: Next.js 15 + Supabase (Postgres + RLS) · App at `versa-oms/app`.
Verification: `tsc` (0 err) + **249 vitest** + **48 Playwright journeys** (live Supabase; 47 passed + 1 auth-skip, no failures) + drift guardrail + `check_unique_constraints.py` (now also catches shadow-composite uniques) — all green. Migrations 0001–0028.

**The exam chain now runs end-to-end from real input:** roster CSV ingest → candidate IDs → exam slots → **OMR response import** → **scoring** → **score→result handoff** → **ranking + eligibility** → **certificate generation + PDF + public verify**. (Each link is a shipped, e2e-proven CR; FR-STUDENT-ROSTER-OPS-0002 through FR-OMR-IMPORT-0010.)

## Recently completed (P0/P1 along the chain)
- **School answer-sheet upload (FR-ANSWER-SHEET-UPLOAD-0019):** the return half of distribution + first feature under the new UI-wiring rule (P0.10) — a school-portal page uploads administered answer sheets (upstream control) which create an import batch on-behalf + ingest the OMR rows (reuses FR-OMR-IMPORT-0010), then lists each upload's status/counts (downstream); flows into scoring. Nav-linked + clickable.
- **Time-gated exam-material distribution (FR-MATERIAL-RELEASE-0018):** a school securely downloads its question-paper/OMR PDFs via a short-lived signed URL, but ONLY within the release window (released package + `release_at` passed, never revoked/superseded), own-school only, every download audited. This is the real distribution model (schools self-select date + count; ops sends materials to print, receives answer sheets back — the receive side composes with the OMR import). Replaced the dropped capacity-override (which mis-modeled the domain).
- **Notification fan-out + real address + auto-trigger (FR-NOTIFY-FANOUT-0014 / CHANNEL-0016 / AUTOTRIGGER-0017):** raised `notification_events` fan out into recipient batches **rendered from an APPROVED template** (no-template → suppressed + surfaced, never bypassed); recipients carry their **real channel address** (school coordinator email/phone by channel); raising an event **dispatches immediately** (outbox — raiseNotificationEvent persists then fans out best-effort; the drain endpoint is the backstop). While building it (and honoring the new no-spec-relaxation rule), found + founder-approved-dropped 5 leftover single-column UNIQUEs the 0023 sweep missed (recipient one-to-many + settings/reports/materials versioning); the unique guardrail now catches the shadow-composite class.
- **Exam-slot capacity gate (FR-SLOT-CAPACITY-0013):** booking is blocked over a slot's real seat/school capacity (computed from active bookings) via a generalizable kernel create-guard.
- **P0 engine foundations:** app-wide lifecycle guards (FR-GATES-0001), server-calculated invoice amounts (FR-AMOUNT-0001), kernel field masking + admin unmask (FR-MASK-0001), dashboard assignment-scope/RLS-bypass fix (FR-DASH-SCOPE-0001), gen_core in the drift pipeline.
- **P1 invoice lifecycle / supersede / lifecycle verbs** wired across entities.
- **Certificate digital seal (FR-CERT-SEAL-0011):** a published certificate's `public_verification` row is HMAC-sealed over its whitelisted fields; `/verify` recomputes and returns `integrity_verified` (a non-PII boolean) + the page shows a seal badge. Tampering a stored field is detectable; the seal is unforgeable without the server secret. Revoke re-seals.
- **P1 OMR response import (FR-OMR-IMPORT-0010):** the chain's real entry point — upload a candidate-responses CSV to a school-scoped import batch → persist `evaluation_candidate_responses` (pure `parseOmrResponses`, reusing the roster tokenizer; idempotent). Scoring (0008) then runs on real imported data.
- **P1 score→result handoff (FR-RESULT-HANDOFF-0009):** `results_ops:generate` now derives `candidate_results` from the result batch's linked (scored) evaluation score batch (pure `scoreToResultRow`/`answerKeyMaxScore` helpers → percentage), then ranks + snapshots eligibility — connecting OMR scoring (0008) to results ranking (0006). The eval→results chain runs from one trigger.
- **P1 OMR scoring (FR-OMR-SCORING-0008):** wired the orphaned `scoreResponses` to real data — a score-batch scoring run reads the import batch's `evaluation_candidate_responses` + the **approved** answer key and persists `evaluation_candidate_scores` (correct/wrong/blank, negative marking; idempotent upsert). Composes the chain: scores → results ranking → certificate eligibility. (Enabled by the 0023 unique fix.)
- **Schema-integrity sweep (FR-SCHEMA-UNIQUES-0007):** fixed a systemic generated-DDL bug — single-column UNIQUE constraints on FK/version columns across 8 tables (eval responses/scores, notification_recipients, answer-key/setting/report/material versions) that silently broke one-to-many + versioning. **Migration 0023** + a static guardrail (`check_unique_constraints.py`). Unblocks OMR scoring, notification fan-out, and versioning.
- **P1 results ranking + immutability (FR-RESULTS-RANKING-0006):** wired the dead `rankCandidates`/`immutability` helpers via a generic domain-effect registry — `results_ops:generate` ranks `candidate_results` server-side (national/grade/subject, competition ranking) + snapshots `certificate_eligibility_status` + marks them ranked; the kernel blocks in-place PATCH of published result rows (corrections must version). **Migration 0022** fixed a generated-DDL schema bug (single-column UNIQUEs on `candidate_results` that made a batch-of-many candidates impossible).
- **P1 certificate PDF generation + secure download (FR-CERT-PDF-0005):** composes the prior three CRs — `certPdf.ts` (pdf-lib + qrcode; embeds a QR to the public verify page) renders a real PDF on the generate transition, `storeFile` keeps it in a private `certificate-files` bucket, and staff + the owning school download it through the signed-URL factory (scoped, audited, 409-when-absent). Also fixed a test-fragility bug (seed lookups now use server-side `?q=` search, not a `page_size` page-find — accumulated >100 schools had silently skipped 15 e2e).
- **P1 certificate generation + public verification (FR-CERT-GENERATION-0004):** server-generates `certificate_number` + unguessable `verification_code` (computeOnCreate — fixes create-persistence + the user-types-number bug + the §3.8 broken createSchema); a kernel **domain-effect hook** writes/updates `public_verification` on publish/revoke (whitelisted fields only); a **real public verify page** replaces the skeleton. The previously-dead `certificate.ts` helpers are now wired. Proven: create→server identity+persist, publish→`/verify` valid, revoke→revoked.
- **P1 secure file download (FR-SECURE-FILE-DOWNLOAD-0003, §3.5):** wired the `signedUrl` engine (was 0 routes) — `storeFile` (private-bucket provision + upload + `file_metadata`) + `makeSecureDownloadHandler` (ownsRecord scope + download audit + 900s signed URL + 409-when-absent). Roster ingest now stores its source file (closes 0002 deferral); proven with a real Supabase signed URL + cross-school 404 + no-file 409. `ModuleTable.downloadAction` on both roster pages. Generalizes to certificates/materials/exports.
- **P1 roster CSV/XLSX ingestion (FR-STUDENT-ROSTER-OPS-0002):** upload → validate (per-row: required cols, grade-set, consent, dedupe, forbidden gov-id reject) → review (valid/invalid/duplicate, PII-masked) → commit (valid students written) → lock, on `student_roster_batches` (the canonical track; `student_uploads` tombstoned). Both school self-upload and staff upload-on-behalf (reason-required) via one engine. Lock fail-closed on invalid=0 AND duplicate=0 (the §3.1 declared-but-unmapped gates now mapped + enforced). Concurrency-safe via an atomic CAS claim. ModuleTable `uploadAction` (config-driven, P0.6).

## Complete
- **Database** — `0001_schema.sql` (131 tables, 420 FKs, 502 constraints, 682 indexes),
  `0002_foundation` (idempotency + auth linkage), `0003_rls` (RLS forced on all 132 tables),
  `0004_approvals` (dual-approval ledger). Validated with the real Postgres parser.
- **Foundation** — auth/actor resolution, staff+school guards, permission engine (default-deny,
  superuser bypass), field masking (FIELD_MASKING_MATRIX), append-only audit, idempotency, envelope.
- **19 company modules** — list/create/get/update + audited gated status transitions, spec-derived
  permissions, masking, idempotency. Routes: collection + `[id]` + `[id]/actions/[action]`.
- **6 school modules** — school-scoped services + routes (students upload + read views).
- **Dual-approval (maker≠checker)** — high-risk transitions apply only after two distinct approvers;
  same actor cannot self-approve. Enforced + tested + runtime-verified.
- **UI** — Finverse Liquid Glass design system; data tables, status chips, create modals,
  row transition actions + KPI dashboards for staff & school.
- **Core-entity staff CRUD** — 10 dedicated staff modules over the olympiad-core tables
  (schools, students, participations, payments, exam_slots, exam_materials, courier_batches,
  omr_imports, results, certificates) under `/staff/core/*`, with spec-derived policies + transitions.
- **Worker-job orchestration** — `server/jobs/` runner (idempotency, retry, dead-letter) driven by
  the 19-job worker spec; transitions fire downstream jobs (e.g. results generate -> results.generate_batch,
  results publish -> certificate.generate + notification.dispatch_batch). `0005_jobs.sql`,
  `/api/internal/jobs/run`, `/api/staff/jobs`, Jobs UI. Runtime-verified end to end.

## Traceability audit — PASS
`reports/TRACEABILITY_AUDIT.json` · `python _validation/trace_audit.py`
- **35/35** module surfaces (19 company + 6 school + 10 core) trace
  **spec → canonical model → DDL → service → route → UI**.
- 131/131 canonical tables in DDL; 0 dangling FKs; 165 columns traced to BRD question ids.
- 8 generators present; worker-jobs framework present (19 job types).

## Deferred (explicitly, by request)
- Wire live Supabase (apply 5 migrations + seed + real auth; flip off dev fallback).
- Deploy.
