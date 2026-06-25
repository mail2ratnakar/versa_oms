# Versa OMS — Build Status (2026-06-25)

Stack: Next.js 15 + Supabase (Postgres + RLS) · App at `versa-oms/app`.
Verification: `tsc` (0 err) + **187 vitest** + **35 Playwright journeys** (live Supabase) + drift guardrail — all green. Migrations 0001–0021.

## Recently completed (P0/P1 along the chain)
- **P0 engine foundations:** app-wide lifecycle guards (FR-GATES-0001), server-calculated invoice amounts (FR-AMOUNT-0001), kernel field masking + admin unmask (FR-MASK-0001), dashboard assignment-scope/RLS-bypass fix (FR-DASH-SCOPE-0001), gen_core in the drift pipeline.
- **P1 invoice lifecycle / supersede / lifecycle verbs** wired across entities.
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
