# Versa OMS — Negative / Edge / Exception Test Status

Source pack: `versa_olympiads_negative_edge_exception_test_cases.md` (340 cases).
Method: each ID is classified against the **actual implemented controls** (this repo), with evidence.
Legend: ✅ pass (control built; cited test/code) · 🟡 partial (handled but not fully hardened/tested) ·
❌ gap (not handled — queued fix) · 🔵 manual (browser/human/infra QA, not server-automatable here).

Last updated: 2026-06-25. Automated negative tests live in `tests/unit/negative_*` + the security/chain e2e.

## Headline
- **Strong, already-built backbone:** maker-checker (dual-approval), append-only + hash-chained audit,
  audit-integrity verify, permission-drift scan, suspicious-login scan, server-calculated invoice amounts,
  cross-tenant scope (kernel `recordInScope`/`ownsRecord`), table-backed idempotency, kernel field masking,
  private storage + expiry-gated signed URLs, CSV formula-injection neutralization, drift guards
  (`check_generated`/`check_workflows`/`check_unique_constraints`).
- **Confirmed real gaps (queued, prioritized below):**
  1. ✅ **Body/payload size limit** — FIXED (middleware 413).
  2. ✅ **Last-super-admin protection** — FIXED (customPreconditions).
  3. ❌ **API rate limiting** — `SEC-006` (no throttle on login/export/notify).
  4. ✅ **Optimistic locking** — FIXED (kernel If-Match).
- **Manual/QA (not server-automatable in this harness):** most `UI-*`, `GLOBAL-PII-003` (console), `GLOBAL-FILE-003` (AV), browser concurrency.

## Global cross-cutting
| ID | Status | Evidence / note |
|---|---|---|
| GLOBAL-AUTH-001 | ✅ | `requireStaffScope`/`requireSchoolScope` gate every private route; dev-auth bypass is prod-disabled (`devAuthAllowed()` returns false in production). |
| GLOBAL-AUTH-002 | ✅ | scope + role checks in the guards; 403 with standard envelope, no partial payload. |
| GLOBAL-AUTH-003 | ✅ | kernel scope (`recordInScope`/school_id) — e2e `support_ticket`, `material_download` prove cross-school 404. |
| GLOBAL-AUTH-004 | 🟡 | Supabase session expiry → 401 on mutation; not an explicit e2e. |
| GLOBAL-AUTH-005 | 🟡 | actor re-resolved per request; no active session-revocation list on suspend. |
| GLOBAL-AUTH-006 | ✅ | permissions checked server-side on every request (no cached privilege). |
| GLOBAL-AUTH-007 | ✅ | API is source of truth; role enforced per request, not from UI cache. |
| GLOBAL-AUTH-008 | ✅ | school enumeration blocked — `recordInScope`/`assertLeadInScope` (CRM IDOR fix FR-0006). |
| GLOBAL-RBAC-001 | ✅ | every mutation goes through a server guard; UI-hiding never the control. |
| GLOBAL-RBAC-002 | ✅ | dual-approval (2 distinct approvers) — e2e `export_chain`, `admin_settings_change`. |
| GLOBAL-RBAC-003 | ✅ | **fixed** — last-super-admin suspend/disable blocked (customPreconditions); unit `last_super_admin` + e2e `negative_last_super_admin`. |
| GLOBAL-PII-001 | 🟡 | audit/records masked via kernel `maskRecord`; general app logging is minimal but not formally PII-scrubbed. |
| GLOBAL-PII-002 | ✅ | field masking + export classification/sensitivity; lower role masked. |
| GLOBAL-PII-003 | 🔵 | browser-console inspection — manual QA. |
| GLOBAL-PII-004 | 🟡 | list endpoints use `listConfig`; some return more than strictly needed. |
| GLOBAL-PII-005 | ✅ | only signed URLs returned — e2e `material_download`, `export_chain`; raw bucket path never exposed. |
| GLOBAL-AUDIT-001 | ✅ | `createAuditEvent` on mutations (kernel + routes). |
| GLOBAL-AUDIT-002 | 🟡 | many denied attempts audited; not universally. |
| GLOBAL-AUDIT-003 | ✅ | append-only — UPDATE/DELETE blocked at DB; e2e `audit_integrity`. |
| GLOBAL-AUDIT-004 | ✅ | server stamps timestamps + hash; client values ignored. |
| GLOBAL-IDEMP-001 | ✅ | `idempotency_keys` table; `x-idempotency-key` replay/conflict (`checkIdempotency`). |
| GLOBAL-IDEMP-002 | ✅ | same key + same payload → replay; different payload → 409 conflict. |
| GLOBAL-IDEMP-003 | ✅ | duplicate event/webhook deduped (idempotent upserts + keys). |
| GLOBAL-CONC-001 | ✅ | **fixed** — kernel If-Match (expected_updated_at) -> 409 on a stale edit; e2e `optimistic_lock`. |
| GLOBAL-CONC-002 | ✅ | dual-approval + kernel state machine → one final state. |
| GLOBAL-CONC-003 | ✅ | kernel transition guards reject invalid/incompatible transitions. |
| GLOBAL-VALID-001 | ✅ | zod server schemas on every create/transition (client cannot bypass). |
| GLOBAL-VALID-002 | ✅ | **fixed** — middleware 413 body-size guard; e2e `negative_body_limit`. |
| GLOBAL-VALID-003 | ✅ | routes `try/catch` JSON parse → 422 envelope, no stack-trace leak. |
| GLOBAL-VALID-004 | ✅ | React escapes on render; values stored verbatim, not executed. |
| GLOBAL-VALID-005 | ✅ | Supabase client = parameterized; no string-built SQL with user input. |
| GLOBAL-FILE-001 | ✅ | N/A — no binary/multipart upload surface; CSV arrives as a validated JSON text field (OMR parser) + body-size capped. |
| GLOBAL-FILE-002 | ✅ | **fixed** — middleware upload cap (15MB); same guard as VALID-002. |
| GLOBAL-FILE-003 | 🔵 | AV scanning is an infra placeholder. |
| GLOBAL-FILE-004 | ✅ | `storeFile.buildObjectPath` uses a server uuid, never the user filename for the path. |
| GLOBAL-WORKER-001 | ✅ | handlers use idempotent upserts; retry causes no duplicate effect. |
| GLOBAL-WORKER-002 | ✅ | runner `maxAttempts` → `dead_letter`; no silent loss. |
| GLOBAL-WORKER-003 | 🟡 | handlers re-read current state; not every job has a cancellation re-check. |
| GLOBAL-WORKER-004 | 🟡 | downstream effects are state-gated; ordering mostly enforced by transitions. |
| GLOBAL-OBS-001 | ✅ | `requestId`/`trace_id` in the response envelope + audit. |
| GLOBAL-OBS-002 | 🟡 | audit events emitted; no separate metrics pipeline. |
| GLOBAL-OBS-003 | 🟡 | `server/lib/health.ts` exists; dependency-degradation signalling partial. |
| GLOBAL-DRIFT-001 | ✅ | `check_workflows.py` fails on a referenced module/spec that doesn't exist. |
| GLOBAL-DRIFT-002 | 🟡 | spec-less route detection is not automated. |
| GLOBAL-DRIFT-003 | ✅ | `check_workflows.py` derives built/partial from e2e presence. |
| GLOBAL-DRIFT-004 | ✅ | API is source of truth; permission-drift scan flags mismatches. |
| GLOBAL-DRIFT-005 | ✅ | completion derived from tests, not a manual flag. |

## Per-workflow (WF-001 … WF-016)
Compact status; rows that reduce to a global control cite it. ✅=built/tested, 🟡=partial, ❌=gap, 🔵=manual.

- **WF-001 (CRM→Activation):** 001 🟡(dup detection partial) · 002 ✅(stage gates) · 003 ✅(idemp) · 004 ✅(state machine) · 005 ✅(scope/suspend) · 006 🟡 · 007 🟡(checklist) · 008 🟡 · 009 🟡(notify retry/DLQ) · 010 🟡(dashboard eventual) · 011 ✅(audit) · 012 ✅(scope) · 013 ✅(field validation) · 014 ✅(idemp recover) · 015 ✅(CRM IDOR fixed).
- **WF-002 (Roster Lock):** 001 ✅(activation gate) · 002 🟡(finance gate config) · 003 ✅(CSV header validation) · 004 🟡(dup students) · 005 🟡 · 006 ✅(row enum) · 007 ✅(roster size — body-size 413 guard) · 008 ✅(worker DLQ) · 009 ✅(idemp lock) · 010 ✅(post-lock edit blocked) · 011 ✅(IDs preserved — codeColumn idempotent) · 012 ✅(cross-school) · 013 🟡 · 014 ✅(governed change) · 015 ✅(unicode names — roster validation).
- **WF-003 (Invoice/Finance):** 001 ✅(**server-calculated amount** FR-AMOUNT) · 002 ✅ · 003 ✅(idemp) · 004 ✅(role) · 005 🟡 · 006 🟡(overpay flag) · 007 ✅(partially_paid lifecycle) · 008 🟡 · 009 ✅(webhook idemp) · 010 🟡 · 011 🟡 · 012 ✅(finance gate validator) · 013 🟡 · 014 🟡 · 015 🟡(log masking).
- **WF-004 (Slot→Material readiness):** 001 🟡(tz) · 002 ✅(**capacity gate** FR-SLOT-CAPACITY) · 003 ✅(dup assignment) · 004 🟡 · 005 🟡 · 006 ✅(concurrent capacity, kernel create-guard) · 007 🟡 · 008 🟡(expiry) · 009 ✅(state machine) · 010 🟡 · 011 ✅(scope) · 012 🟡 · 013 🟡 · 014 🔵(tz) · 015 ✅(audit).
- **WF-005 (Material→Download):** 001 ✅(release gate) · 002 ✅(idemp) · 003 🟡(stale roster) · 004 ✅(maker-checker) · 005 ✅(**before release blocked** e2e material_download) · 006 ✅(**expiry blocked** e2e) · 007 🟡 · 008 ✅(no raw path) · 009 🟡(revoke old link) · 010 ✅(worker DLQ) · 011 ✅(own-school only) · 012 ✅(download audited) · 013 🟡(checksum) · 014 ✅(state conflict) · 015 🟡.
- **WF-006 (Courier):** 001 ✅ · 002 🟡(AWB dup) · 003 🟡 · 004 ✅(scope) · 005 ✅(idemp receipt) · 006 🟡(SLA escalation) · 007 ✅(field validation) · 008 🟡 · 009 ✅(out-of-order transition blocked) · 010 🟡 · 011 🟡 · 012 ✅(cross-school) · 013 🟡 · 014 ✅(audit) · 015 🟡 — e2e `courier_dispatch`.
- **WF-007 (Eval→Score):** 001 ✅(key approval gate) · 002 🟡(re-score) · 003 ✅(approved-key gate) · 004 ✅(CSV validation) · 005 ✅(**unknown candidate rejected** — roster validation) · 006 🟡(dup row) · 007 🟡 · 008 ✅(idemp) · 009 ✅(worker DLQ) · 010 🟡 · 011 ✅(scoring rules) · 012 🟡 · 013 ✅(scope) · 014 ✅(audit) · 015 ✅(validated-import gate).
- **WF-008 (Results):** 001 ✅(score-batch gate) · 002 ✅ · 003 🟡(tie rule) · 004 ✅(publish approval) · 005 ✅(idemp) · 006 🟡(withhold) · 007 ✅(reason required) · 008 ✅(pre-publish denied) · 009 ✅(cross-school) · 010 ✅(eligibility gate) · 011 🟡 · 012 ✅(published snapshot immutable) · 013 ✅(public PII minimal) · 014 ✅(audit) · 015 ✅(version check).
- **WF-009 (Certificate→Verify):** 001 ✅(published-results gate) · 002 🟡(eligibility) · 003 ✅(idemp) · 004 🟡(template) · 005 ✅(**QR/seal mismatch fails** — cert seal) · 006 ✅(public minimal PII) · 007 ✅(revoked re-seals) · 008 ✅(version trail) · 009 ✅(cross-school) · 010 ✅(signed URL expiry) · 011 ✅(worker DLQ) · 012 🟡 · 013 ✅(audit) · 014 🔵(unicode PDF) · 015 ✅(unique cert no.) — e2e `cert_seal`.
- **WF-010 (Support):** 001 🟡 · 002 ✅(field validation) · 003 🟡(attachment) · 004 ✅(**internal note hidden** e2e support_ticket) · 005 ✅(scope) · 006 ✅(role) · 007 ✅(reason) · 008 🟡(SLA dup) · 009 ✅(reopen) · 010 🟡 · 011 ✅(soft delete) · 012 🟡 · 013 🟡 · 014 ✅(cross-tenant 404) · 015 ✅(XSS escaped on render).
- **WF-011 (Sensitive Export):** 001 ✅(role) · 002 ✅(reason required) · 003 ✅(**maker self-approve blocked** e2e) · 004 🟡(mask) · 005 ✅(generate gated on approved) · 006 ✅(no file pre-gen) · 007 ✅(**expiry** e2e) · 008 ✅(expired→409) · 009 ✅(idemp) · 010 🟡(worker) · 011 🟡(broad query) · 012 ✅(scope) · 013 ✅(download audited) · 014 ✅(**CSV injection** unit `negative_export_csv`) · 015 ✅(private storage).
- **WF-012 (Role Scope/Maker-Checker):** 001 ✅(dual-approval) · 002 ✅(**last super admin blocked** FR-LAST-SUPERADMIN) · 003 🟡 · 004 ✅(server allowlist) · 005 ✅(maker-checker) · 006 ✅(one decision) · 007 🟡(stale approval) · 008 🟡(suspended approver) · 009 🟡(session refresh) · 010 🟡(role delete) · 011 ✅(**drift scan** FR-PERMISSION-DRIFT) · 012 ✅(audit) · 013 🟡 · 014 🟡(assignment≠requester) · 015 🔵(UI).
- **WF-013 (Notification):** 001 🟡 · 002 🟡 · 003 ✅(approval gate) · 004 ✅(opt-out enforced FR-NOTIFY-OPTOUT) · 005 ✅(scope resolver) · 006 ✅(idemp) · 007 ✅(retry/DLQ) · 008 🟡(partial) · 009 🟡 · 010 🟡 · 011 🟡(edit after approve) · 012 🟡(rate) · 013 ✅(webhook idemp) · 014 ✅(role) · 015 ✅(audit) — fan-out from approved template only (FR-NOTIFY-FANOUT).
- **WF-014 (Admin Settings):** 001 ✅(approval) · 002 🟡(flag schema) · 003 ✅(version conflict/supersede) · 004 🟡(secret mask) · 005 ✅(rollback via superseded version) · 006 🔵(env) · 007 ✅(role) · 008 🟡 · 009 ✅(audit) · 010 🟡 · 011 🟡 · 012 ✅(drift) · 013 ✅(maker self-approve blocked) · 014 🟡(cache) · 015 🟡 — e2e `admin_settings_change`.
- **WF-015 (Security/Audit):** 001 🟡(evidence) · 002 ✅(role) · 003 ✅(**hash verify** e2e audit_integrity) · 004 ✅(**drift detect** e2e) · 005 🟡(suspended assignee) · 006 🟡(notify) · 007 ✅(reason) · 008 🟡(audit export mask) · 009 ✅(state machine) · 010 ✅(idempotent scan) · 011 🟡 · 012 🟡(dashboard health) · 013 ✅(no hard delete) · 014 ✅(correlation/trace) · 015 🟡 — e2e `audit_integrity`, `permission_drift`, `suspicious_login`, `security_sweep`.
- **WF-016 (Full path):** 001 🟡 · 002 ✅(completion validator = check_workflows) · 003 ✅(dependency gates) · 004 ✅(drift) · 005 🟡(rollback) · 006 🟡(backlog) · 007 🟡(storm/rate) · 008 🟡(aggregate) · 009 ✅(audit chain) · 010 ✅(per-request perms) · 011 🟡 · 012 🔵(tz) · 013 ✅(pre-publish no data) · 014 ✅(idempotent seed) · 015 ✅(production gate = full e2e).

## Database hardening
| ID | Status | Note |
|---|---|---|
| DB-001 | ✅ | unique constraints + `check_unique_constraints.py`; idempotent codeColumn. |
| DB-002 | 🟡 | multi-write uses best-effort + compensating audit; not full SQL transactions per op. |
| DB-003 | ✅ | FK constraints; deletes are soft (`archived_at`). |
| DB-004 | ✅ | CHECK enums reject invalid states (hit repeatedly during build). |
| DB-005 | ✅ | kernel If-Match optimistic lock (expected_updated_at -> 409) + versioning/supersede. |
| DB-006 | ✅ | migrations are reviewed + spec-first; destructive changes need founder sign-off (no-relax rule). |
| DB-007 | 🟡 | rollback safety per-migration, not automated. |
| DB-008 | ✅ | RLS + kernel scope; service-role only server-side after a guard. |
| DB-009 | ✅ | NOT NULL + zod required. |
| DB-010 | ✅ | active-state checks (`archived_at` / status gates). |
| DB-011 | ✅ | timestamps stored as ISO/tz-normalized server-side. |
| DB-012 | ✅ | audit append-only (UPDATE/DELETE blocked) — e2e `audit_integrity`. |

## Security & privacy
| ID | Status | Note |
|---|---|---|
| SEC-001 | ✅ | private routes gated; public routes (verify) minimal. |
| SEC-002 | ✅ | secrets in `.env.local` only; not returned/committed. |
| SEC-003 | 🟡 | same-site + session; no explicit CSRF token (API is bearer/session). |
| SEC-004 | 🟡 | redirect allowlist not formalized. |
| SEC-005 | 🟡 | CORS default (same-origin); not explicitly restricted. |
| SEC-006 | ❌ | **gap** — no rate limiting. Queued. |
| SEC-007 | 🔵 | token reset flows infra-dependent. |
| SEC-008 | ✅ | private buckets; signed access only. |
| SEC-009 | ✅ | IDOR blocked by kernel scope (CRM IDOR fix). |
| SEC-010 | ✅ | XSS escaped on render. |
| SEC-011 | ✅ | **CSV injection neutralized** — unit `negative_export_csv`. |
| SEC-012 | 🟡 | analytics/log PII minimization partial. |

## Worker / queue
| ID | Status | Note |
|---|---|---|
| WORKER-001 | ✅ | idempotent handler upserts. |
| WORKER-002 | ✅ | `dead_letter` after maxAttempts. |
| WORKER-003 | 🟡 | system-actor re-reads state; not every job re-checks revocation. |
| WORKER-004 | 🔵 | DLQ visibility surfaced via `job_runs` / staff jobs route. |
| WORKER-005 | ✅ | poison job isolated to dead_letter; queue continues. |
| WORKER-006 | 🟡 | provider timeout handling per-handler. |
| WORKER-007 | 🟡 | ordering via state gates. |
| WORKER-008 | ✅ | server-authoritative time (release/expiry computed server-side). |

## UI / browser QA — 🔵 manual (UI-001 … UI-012)
Require browser/visual QA (loading/empty/denied states, mobile, overflow, back-button, a11y, console).
Out of scope for the server test harness; tracked for a dedicated Playwright UI-state pass.

## Drift / governance
| ID | Status | Note |
|---|---|---|
| DRIFT-001 | ✅ | `check_workflows.py`. |
| DRIFT-002 | 🟡 | orphan-module detection partial. |
| DRIFT-003 | 🟡 | spec-less route detection not automated. |
| DRIFT-004 | 🟡 | screen-contract drift partial. |
| DRIFT-005 | ✅ | journey coverage via `check_workflows`. |
| DRIFT-006 | ✅ | permission drift scan. |
| DRIFT-007 | ✅ | completion derived from tests. |
| DRIFT-008 | ✅ | upstream→downstream sync rule + `check_generated`. |
| DRIFT-009 | ✅ | brain/skills master-loop rule enforced per session. |
| DRIFT-010 | 🟡 | artifact-registry validator partial. |

## Prioritized gap backlog (fix one-by-one, master loop)
1. (infra, last) **API rate limiting** (`SEC-006`) — throttle on login/export/notify; 429 + audit.
2. **Universal optimistic locking** (`GLOBAL-CONC-001`, `DB-005`) — `version`/`If-Match` check on plain record edits.
3. **(done) Notification opt-out** — FR-NOTIFY-OPTOUT-0037.
