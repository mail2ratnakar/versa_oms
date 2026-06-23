# Integration Notes — Feature Effects / Screen Contracts / Journey Acceptance
Adopted 2026-06-23. This pack is the **behavior layer** on top of the structural specs
(`spec/modules/*`) and the source-of-truth questionnaire. It is the canonical reference
for: post-conditions (FX), screen contracts (SCR), journey acceptance (JRN), spine
continuity (CHAIN). It supersedes the ad-hoc `spec/behavior/rows_*.md` (kept only as a
decisions freeze-log).

## How it plugs into the build loop
For each feature we implement:
1. Read its `modules/<id>/FEATURE_EFFECTS.md` (FX) + `SCREEN_CONTRACTS.md` (SCR) + any relevant `CROSS_MODULE_EFFECT_CHAINS.md` (CHAIN).
2. Implement: source screen → API/service effect → DB state → **downstream effects (task/job/notification/audit/portal/dashboard)** → UI success/error states.
3. Author the matching `JOURNEY_ACCEPTANCE_TESTS.md` (JRN) as a Playwright test in `app/tests/e2e/`.
4. Mark complete ONLY when the journey test passes.

## Route reconciliation (pack = contract, our routes = implementation)
The pack's routes/APIs are illustrative; our app uses different paths. Map by ID, do NOT rename our routes.

| Pack (illustrative) | Our actual route/API |
|---|---|
| `/staff/school-crm`, `POST /school-crm/leads` | `/staff/schools/crm`, `POST /api/staff/schools/crm` |
| `POST /leads/{id}/convert` | `POST /api/staff/schools/crm/[id]/convert` |
| `/staff/<module>` (list/detail/action) | `/staff/<route>` + `/api/staff/<route>/[id]/actions/[action]` |
| `/verify/...` | `/verify/certificate/[verification_code]` + `/api/verify/certificate/[code]` |

General rule: SCR `Route` → our App Router page; FX `API/worker` → our `/api/staff/...` handler; module_id matches 1:1 (all 19).

## Screen contracts: floor not ceiling
The SCR entries are templated (generic required data/states/components + must-not-show privacy list).
Treat them as the **acceptance checklist** (every screen must cover loading/empty/ready/validation_error/
access_denied/server_error, show PageHeader/StatusBadge/Table/ActionPanel/AuditTimeline, and never leak the
must-not-show fields). Column/action specifics are added per screen at build time (e.g. the custom CRM page).

## Cross-module chains = downstream-wiring backlog
The 10 CHAINs are the spine-continuity tasks. Priority first: **CHAIN-001 (convert → onboarding_case + task + queue)**
to close the gap found during the CRM review. Each CHAIN step that isn't wired yet is a build item with a JRN test.
