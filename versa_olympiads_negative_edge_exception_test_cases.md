# Versa Olympiads — Negative Scenarios, Edge Cases and Exception Test Cases

Generated: 2026-06-25 18:07

## Purpose

This file is the negative/edge/exception test pack for the Versa Olympiads workflow-first vibe coding framework. It is designed to stop LLMs from coding only happy paths, isolated screens, or isolated APIs.

Every workflow chain must pass its positive journey tests plus these negative, edge, exception, security, privacy, audit, database and drift tests before it can be marked complete.

## Workflow Coverage

| Workflow | Name |
|---|---|
| `WF-001` | CRM Lead to School Activation |
| `WF-002` | School Activation to Roster Lock |
| `WF-003` | Invoice to Finance Gate |
| `WF-004` | Exam Slot Confirmation to Material Readiness |
| `WF-005` | Material Generation to Secure School Download |
| `WF-006` | Courier Dispatch to Receipt |
| `WF-007` | Evaluation Import to Score Batch |
| `WF-008` | Score Batch to Results Publication |
| `WF-009` | Certificate Generation to Public Verification |
| `WF-010` | Support Ticket to Resolution |
| `WF-011` | Sensitive Export Approval to Download |
| `WF-012` | Role Scope Change with Maker Checker |
| `WF-013` | Notification Template to Delivery |
| `WF-014` | Admin Setting Change Governance |
| `WF-015` | Security Incident and Audit Drift Review |
| `WF-016` | Full Olympiad Operations Happy Path |

## Mandatory Test Execution Rule

```text
Do not move to the next workflow until:
1. happy path passes
2. negative scenarios pass
3. edge cases pass
4. exception/recovery cases pass
5. audit/security/privacy checks pass
6. drift and traceability checks pass
7. completed/pending summary is updated
```

## Test Classification

| Class | Meaning |
|---|---|
| Negative | Invalid actor, invalid input, invalid state, forbidden action, wrong scope |
| Edge | Boundary date/time, duplicate, concurrent, large/small/empty, weird characters, stale cache |
| Exception | Network failure, worker failure, provider failure, partial failure, retry, rollback |
| Security | Auth, RBAC, RLS, tenant isolation, secrets, route exposure |
| Privacy | PII minimization, masking, logs, exports, public views |
| Database | Transaction, uniqueness, locking, rollback, migration safety |
| Drift | Spec-code mismatch, workflow-test mismatch, permission drift, artifact drift |

## Global Cross-Cutting Negative / Edge / Exception Tests

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `GLOBAL-AUTH-001` | Unauthenticated user accesses private staff route | Request staff/admin page or API without session. | Access blocked; redirect/login or 401; no data returned. |
| `GLOBAL-AUTH-002` | Authenticated user accesses route outside role | School coordinator tries company-only route. | 403; no partial payload; audit access-denied event if route is sensitive. |
| `GLOBAL-AUTH-003` | User changes tenant/school ID in URL | Modify URL/API parameter to another school_id. | 403/404 scoped denial; no cross-tenant data leakage. |
| `GLOBAL-AUTH-004` | Expired session submits mutation | Keep form open, expire session, submit. | Mutation rejected; user asked to re-authenticate; no duplicate or partial write. |
| `GLOBAL-AUTH-005` | Deleted/suspended staff user uses old session | Suspend staff account, then call API using existing browser token. | Token/session invalidated or rejected server-side. |
| `GLOBAL-AUTH-006` | Privilege downgrade while page open | Open approval page as admin, downgrade role, then approve. | Server checks latest permissions and blocks action. |
| `GLOBAL-AUTH-007` | Role change not reflected in cached UI | Change staff role, refresh and non-refresh paths. | UI and API both enforce new role; no stale privileged action allowed. |
| `GLOBAL-AUTH-008` | School user enumerates IDs | Iterate lead, invoice, roster, certificate IDs. | Only own-scope records visible; sequential/enumerable IDs do not leak data. |
| `GLOBAL-RBAC-001` | Missing server-side permission check | Hide button in UI but call API directly. | API rejects; UI hiding alone is not accepted. |
| `GLOBAL-RBAC-002` | Maker approves own request | Same user creates and approves high-risk request. | Blocked by maker-checker rule. |
| `GLOBAL-RBAC-003` | Last super admin removed | Attempt to remove/downgrade final super admin. | Blocked; explicit error; audit event recorded. |
| `GLOBAL-PII-001` | PII appears in logs | Trigger error with student/school data. | Logs mask PII; no names, phone, email, student IDs in unsafe logs. |
| `GLOBAL-PII-002` | PII appears in export for unauthorized role | Lower role requests export containing student PII. | Export denied or masked per field masking matrix. |
| `GLOBAL-PII-003` | PII appears in browser console | Open pages with dev console. | No sensitive payloads printed to console. |
| `GLOBAL-PII-004` | PII returned in list endpoint unnecessarily | List endpoint returns details not needed for table. | Only minimal fields returned; details require scoped detail endpoint. |
| `GLOBAL-PII-005` | Sensitive file direct URL exposure | Inspect network response for raw storage URL. | Only short-lived signed URL returned; no raw bucket path exposed. |
| `GLOBAL-AUDIT-001` | Write mutation without audit event | Perform create/update/delete/high-risk action. | Audit record exists with actor, scope, before/after where required. |
| `GLOBAL-AUDIT-002` | Failed high-risk action without audit | Attempt forbidden role/payment/result action. | Denied attempt audited where security relevant. |
| `GLOBAL-AUDIT-003` | Audit record is editable by normal staff | Attempt to edit/delete audit event. | Blocked; audit is immutable or append-only. |
| `GLOBAL-AUDIT-004` | Audit timestamp spoofing | Client sends created_at/updated_at manually. | Server ignores client audit timestamps. |
| `GLOBAL-IDEMP-001` | Double-click submit | Double-click create/approve/pay/publish button. | Only one mutation succeeds; idempotent response shown. |
| `GLOBAL-IDEMP-002` | Browser retry after network failure | Submit mutation, cut network, retry same request. | No duplicate entity/payment/job; idempotency key respected. |
| `GLOBAL-IDEMP-003` | Duplicate webhook/event delivery | Replay same payment/import/job callback. | Second delivery ignored or marked duplicate. |
| `GLOBAL-CONC-001` | Two admins edit same record | Open same record in two browsers, save conflicting changes. | Optimistic locking/version check prevents silent overwrite. |
| `GLOBAL-CONC-002` | Concurrent approval and rejection | Two approvers approve/reject same task simultaneously. | Only one final state; losing request receives conflict. |
| `GLOBAL-CONC-003` | Concurrent state transition | Move same lifecycle record through two incompatible transitions. | Invalid transition blocked; state machine remains valid. |
| `GLOBAL-VALID-001` | Client-side validation bypass | Call API with invalid payload directly. | Server validates schema and business rules. |
| `GLOBAL-VALID-002` | Oversized payload | Upload huge CSV/file/body beyond limit. | Rejected safely; no memory spike; clear error. |
| `GLOBAL-VALID-003` | Malformed JSON | Send broken JSON to API. | 400 standard error; no stack trace leakage. |
| `GLOBAL-VALID-004` | HTML/script injection | Submit `<script>` or HTML in names/comments. | Stored safely/escaped; no XSS execution. |
| `GLOBAL-VALID-005` | SQL-like payload in filters | Inject SQL-like strings in search/filter fields. | No injection; parameterized queries; safe error. |
| `GLOBAL-FILE-001` | Wrong file type upload | Upload executable or unsupported file. | Rejected by MIME/content validation. |
| `GLOBAL-FILE-002` | Large file upload timeout | Upload max/over-limit file. | Graceful failure; no partial orphan records. |
| `GLOBAL-FILE-003` | Virus/malware placeholder scenario | Upload suspicious attachment where scanning is configured. | File quarantined or blocked; no download allowed. |
| `GLOBAL-FILE-004` | Filename traversal | Upload filename with `../` or reserved path. | Sanitized filename; no path traversal. |
| `GLOBAL-WORKER-001` | Worker job fails once | Force transient worker error. | Retry policy runs; no duplicate effects. |
| `GLOBAL-WORKER-002` | Worker job repeatedly fails | Force repeated failure. | Moved to DLQ; task/alert created; no silent loss. |
| `GLOBAL-WORKER-003` | Worker runs after source record deleted/cancelled | Cancel record while worker queued. | Worker re-checks current state and exits safely. |
| `GLOBAL-WORKER-004` | Out-of-order jobs | Run downstream job before upstream state ready. | Job blocks/retries; no invalid state created. |
| `GLOBAL-OBS-001` | API error without correlation ID | Trigger API failure. | Response/log includes correlation/request ID. |
| `GLOBAL-OBS-002` | Critical event without metric | Trigger payment/result/material publish. | Metric/log/audit emitted per observability plan. |
| `GLOBAL-OBS-003` | Health check ignores broken dependency | Break DB/storage/worker dependency. | Health check marks degraded/fail appropriately. |
| `GLOBAL-DRIFT-001` | Spec says feature exists but no route/API | Remove/skip route implementation. | Drift detector flags missing code artifact. |
| `GLOBAL-DRIFT-002` | Code route exists but no spec | Add unregistered route. | Spec-to-code validator flags spec-less code. |
| `GLOBAL-DRIFT-003` | Screen exists without journey test | Implement screen but omit test. | Journey coverage drift flagged. |
| `GLOBAL-DRIFT-004` | Permission in UI differs from API | Button visible/hidden inconsistently. | Permission drift flagged; API remains source of truth. |
| `GLOBAL-DRIFT-005` | Completed summary claims done but tests fail | Mark workflow complete manually. | Completion validator rejects claim. |

## WF-001 — CRM Lead to School Activation

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `WF-001-NEG-001` | CRM lead duplicate by school name/email/domain | Create same school lead twice through UI/API/import. | Duplicate warning or merge path; no duplicate active school unless explicitly allowed. |
| `WF-001-NEG-002` | Lead converted without required qualification | Convert new/unqualified lead directly to onboarding. | Blocked; required stage and mandatory fields enforced. |
| `WF-001-NEG-003` | Lead converted twice | Double-submit convert action or use two browsers. | Only one school/onboarding case created; second attempt idempotent/conflict. |
| `WF-001-NEG-004` | Invalid lead stage jump | Move lead from new directly to closed/enrolled without allowed transition. | Blocked by state machine. |
| `WF-001-NEG-005` | Inactive/suspended sales user moves lead | Suspend actor then attempt lead update. | 403 and no stage change. |
| `WF-001-NEG-006` | School onboarding created without owner | Convert lead when onboarding owner cannot be assigned. | Conversion blocked or task queued to unassigned queue; no silent orphan. |
| `WF-001-NEG-007` | School activation before onboarding checklist complete | Approve/activate school with pending checklist items. | Blocked; checklist gaps shown. |
| `WF-001-NEG-008` | School activation without portal account | Activate school while portal user provisioning fails. | School remains pending activation or access_pending; retry task created. |
| `WF-001-NEG-009` | Activation notification fails | Force notification provider failure. | School activation persists; notification retry/DLQ and alert created. |
| `WF-001-NEG-010` | Dashboard count stale after conversion | Convert lead and check dashboard metrics. | Dashboard eventually consistent or recalculated; no wrong completed claim. |
| `WF-001-NEG-011` | Audit missing for conversion/activation | Trace audit timeline after conversion. | All high-risk transitions audited. |
| `WF-001-NEG-012` | School scope mismatch | Assign onboarding case to wrong school scope. | Blocked by server validation. |
| `WF-001-NEG-013` | Bad phone/email/domain input | Submit malformed contact fields. | Server rejects with field-level errors. |
| `WF-001-NEG-014` | Lead lost after network timeout | Submit lead and break network after server receives request. | User can recover; no duplicate on retry. |
| `WF-001-NEG-015` | Unauthorized school user views CRM lead | School portal user opens CRM route/API. | Denied; no CRM data returned. |


## WF-002 — School Activation to Roster Lock

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `WF-002-NEG-001` | Roster upload before school activation | Inactive school uploads roster. | Blocked; activation gate required. |
| `WF-002-NEG-002` | Roster upload before finance gate if configured | Unpaid school attempts lock/generate IDs when finance gate required. | Blocked at lock/material readiness stage. |
| `WF-002-NEG-003` | Malformed CSV headers | Upload roster with missing/wrong columns. | Validation errors; no candidates created. |
| `WF-002-NEG-004` | Duplicate students in same roster | Same name/DOB/class/identifier repeated. | Duplicates flagged; lock blocked until resolved or approved. |
| `WF-002-NEG-005` | Duplicate student across schools/exams | Upload existing candidate into another scope. | Detected per business rule; safe resolution path. |
| `WF-002-NEG-006` | Invalid grade/class/subject mapping | Roster row has unsupported class/subject. | Row-level error; batch not locked. |
| `WF-002-NEG-007` | Oversized roster | Upload huge roster beyond school quota. | Rejected or split; no partial hidden imports. |
| `WF-002-NEG-008` | Roster validation worker failure | Force validation job error. | Retry/DLQ; batch stays validating/failed with actionable error. |
| `WF-002-NEG-009` | Roster locked twice | Two admins lock same roster concurrently. | One lock; second receives conflict/idempotent result. |
| `WF-002-NEG-010` | Roster edited after lock | Attempt row edit after locked. | Blocked unless unlock workflow exists and is audited. |
| `WF-002-NEG-011` | Candidate IDs regenerated | Retry generation after lock. | Existing IDs preserved; no changed candidate IDs. |
| `WF-002-NEG-012` | School user accesses another school roster | Change school_id in API. | Denied; no cross-school data. |
| `WF-002-NEG-013` | PII in validation error export | Download errors with student PII as unauthorized role. | Denied or masked. |
| `WF-002-NEG-014` | Roster delete after downstream material generated | Attempt delete locked roster after materials/results. | Blocked or requires governed change request. |
| `WF-002-NEG-015` | Blank/Unicode/emoji names | Upload unusual names and characters. | Accepted if valid; displayed/exported safely. |


## WF-003 — Invoice to Finance Gate

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `WF-003-NEG-001` | Invoice generated with client-calculated amount | Tamper amount in request. | Server ignores client amount; recalculates fee. |
| `WF-003-NEG-002` | Invoice before school activation | Generate invoice for invalid/inactive school. | Blocked or marked draft only per policy. |
| `WF-003-NEG-003` | Duplicate invoice generation | Double-click generate invoice. | Single active invoice or versioned duplicate rule enforced. |
| `WF-003-NEG-004` | Payment confirmation by unauthorized role | Non-finance user confirms manual payment. | 403; no payment status change. |
| `WF-003-NEG-005` | Manual payment without proof/reference | Submit empty reference for offline payment. | Rejected or routed to pending verification. |
| `WF-003-NEG-006` | Overpayment | Record payment greater than invoice. | Flagged; no automatic finance gate if policy requires review. |
| `WF-003-NEG-007` | Underpayment | Record payment less than invoice. | Invoice remains partially_paid; gate closed. |
| `WF-003-NEG-008` | Refund after materials/results released | Attempt refund after downstream workflow progressed. | Blocked or high-risk approval required. |
| `WF-003-NEG-009` | Payment webhook replay | Replay same successful webhook. | No duplicate payment; idempotency applied. |
| `WF-003-NEG-010` | Payment webhook mismatch | Webhook invoice_id/amount/currency mismatch. | Rejected and audited. |
| `WF-003-NEG-011` | Invoice currency/tax mismatch | Wrong currency or tax region. | Server rule rejects or recalculates. |
| `WF-003-NEG-012` | Finance gate opens without paid invoice | Manipulate invoice state directly/API. | Gate validator rejects. |
| `WF-003-NEG-013` | Payment notification failure | Provider outage after payment success. | Payment persists; notification retry task created. |
| `WF-003-NEG-014` | Finance dashboard stale | Pay invoice and inspect readiness. | Status updated or eventually consistent with clear refresh. |
| `WF-003-NEG-015` | PII in payment logs | Trigger payment error with school details. | Logs masked. |


## WF-004 — Exam Slot Confirmation to Material Readiness

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `WF-004-NEG-001` | Slot created with invalid date/timezone | Create slot in past or wrong timezone. | Rejected; timezone normalized. |
| `WF-004-NEG-002` | Slot capacity exceeded | Assign more students/schools than capacity. | Blocked; capacity consistent under concurrency. |
| `WF-004-NEG-003` | Double assignment to same school | Assign same school twice. | Single assignment; duplicate rejected. |
| `WF-004-NEG-004` | Slot confirmation before roster lock | Confirm slot with unlocked roster if gate requires lock. | Blocked or readiness remains pending. |
| `WF-004-NEG-005` | Slot confirmation before payment | Confirm slot while unpaid if finance gate required. | Confirmation may pass but material readiness blocked; rule explicit. |
| `WF-004-NEG-006` | Concurrent slot assignment | Two admins assign last capacity simultaneously. | Only one succeeds; capacity not negative. |
| `WF-004-NEG-007` | Reschedule after material generated | Reschedule slot after material package created. | Blocked or governed revoke/regenerate workflow required. |
| `WF-004-NEG-008` | School confirms expired offer | Confirm after confirmation deadline. | Blocked; reassignment path offered. |
| `WF-004-NEG-009` | Invalid state jump | Move assignment assigned->completed directly. | Blocked. |
| `WF-004-NEG-010` | Notification failure on slot assignment | Provider fails. | Assignment persists; retry queued. |
| `WF-004-NEG-011` | Wrong school sees slot | School user views another school slot. | Denied. |
| `WF-004-NEG-012` | Dashboard readiness wrong | Roster/payment/slot changed. | Readiness recalculated from source facts. |
| `WF-004-NEG-013` | Slot deletion with assigned schools | Delete slot already assigned. | Blocked or requires reassignment. |
| `WF-004-NEG-014` | Timezone edge day rollover | School in different timezone views slot. | Displayed consistently with configured timezone. |
| `WF-004-NEG-015` | Audit missing on reschedule | Reschedule and inspect audit. | Before/after slot details audited. |


## WF-005 — Material Generation to Secure School Download

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `WF-005-NEG-001` | Material generation before all gates | Run generate with unpaid/unlocked/unconfirmed school. | Blocked; missing gates listed. |
| `WF-005-NEG-002` | Material generation duplicate | Double-click generate package. | Single package/job; idempotent response. |
| `WF-005-NEG-003` | Package generated with stale roster | Roster changed/unlocked after generation request. | Worker re-checks lock/version; aborts or regenerates governed version. |
| `WF-005-NEG-004` | Release approval by maker | Generator approves own release when maker-checker required. | Blocked. |
| `WF-005-NEG-005` | Download before release time | School tries early download/API. | Denied; no signed URL. |
| `WF-005-NEG-006` | Download after release expiry | Use old release link after expiry. | Denied; signed URL expired. |
| `WF-005-NEG-007` | Signed URL reused by another user | Copy signed URL to unauthorized context. | URL scope/time/content enforced as far as storage allows; download audit anomalous use. |
| `WF-005-NEG-008` | Raw storage path exposed | Inspect API response/network. | No raw bucket path. |
| `WF-005-NEG-009` | Material revoked but old link works | Revoke/replace material after release. | Old URL invalid or file access blocked; versioned audit. |
| `WF-005-NEG-010` | Worker failure during PDF/package generation | Force generation error. | Retry/DLQ; package not marked generated. |
| `WF-005-NEG-011` | Incorrect school material mapping | School attempts download of another school package. | Denied by server scope before signed URL creation. |
| `WF-005-NEG-012` | Download not audited | Download package. | Audit event contains actor/school/package/version/IP if allowed. |
| `WF-005-NEG-013` | Material generated without checksum | Inspect package metadata. | Checksum/version present. |
| `WF-005-NEG-014` | Concurrent release and revoke | One admin releases while another revokes. | State machine conflict; one final state. |
| `WF-005-NEG-015` | Large package download timeout | Simulate interrupted download. | Download can retry with new signed URL; no state corruption. |


## WF-006 — Courier Dispatch to Receipt

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `WF-006-NEG-001` | Dispatch before package ready | Create dispatch for missing/unreleased package. | Blocked. |
| `WF-006-NEG-002` | Invalid AWB/tracking number | Submit malformed or duplicate tracking. | Rejected or duplicate flagged. |
| `WF-006-NEG-003` | Dispatch to wrong school/address | Change dispatch school/address scope. | Blocked or requires approval; audit before/after. |
| `WF-006-NEG-004` | Receipt confirmation by unauthorized user | Non-school or wrong school confirms receipt. | Denied. |
| `WF-006-NEG-005` | Receipt confirmed twice | Double confirm receipt. | Idempotent; single receipt event. |
| `WF-006-NEG-006` | Delivered but not received edge | Courier marks delivered, school does not confirm. | Status remains delivered/pending receipt; escalation task after SLA. |
| `WF-006-NEG-007` | Lost/damaged incident without required fields | Raise incident with no reason/evidence. | Rejected with field-level errors. |
| `WF-006-NEG-008` | Incident after receipt closed | Raise incident after final receipt window. | Blocked or routed to exception approval. |
| `WF-006-NEG-009` | Tracking update out of order | Move delivered back to in_transit. | Blocked unless correction workflow exists. |
| `WF-006-NEG-010` | Notification failure on dispatch | Provider failure. | Dispatch persists; retry queued. |
| `WF-006-NEG-011` | Courier provider timeout | Tracking update API times out. | No duplicate update; retry/backoff. |
| `WF-006-NEG-012` | Cross-school dispatch visibility | School changes dispatch_id. | Denied. |
| `WF-006-NEG-013` | Mismatch between package and dispatch | Dispatch package version not current. | Blocked or requires explicit exception. |
| `WF-006-NEG-014` | Audit missing for receipt/incident | Confirm receipt/raise incident. | Audit events present. |
| `WF-006-NEG-015` | Dashboard logistics status stale | Update dispatch status. | Dashboard reflects latest status or marked eventual. |


## WF-007 — Evaluation Import to Score Batch

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `WF-007-NEG-001` | Answer key approval without complete questions | Approve incomplete/missing answer key. | Blocked. |
| `WF-007-NEG-002` | Answer key changed after scores generated | Edit approved key after score batch. | Blocked or requires versioned correction/re-score workflow. |
| `WF-007-NEG-003` | OMR import before answer key approval | Import/score without approved key. | Blocked. |
| `WF-007-NEG-004` | Malformed OMR/CSV file | Upload wrong columns/format. | Batch errors; no score batch. |
| `WF-007-NEG-005` | Unknown candidate ID | Import row for non-existent candidate. | Row error; batch not fully valid. |
| `WF-007-NEG-006` | Duplicate response row | Same candidate appears twice. | Duplicate flagged; scoring blocked until resolved. |
| `WF-007-NEG-007` | Responses for wrong exam/subject | Import mismatched exam slot/subject. | Rejected or row-level errors. |
| `WF-007-NEG-008` | Score generation duplicate | Double-run generate scores. | Single score batch or versioned run; idempotent. |
| `WF-007-NEG-009` | Worker failure during validation/scoring | Force job failure. | Retry/DLQ; status not falsely complete. |
| `WF-007-NEG-010` | Concurrent key approval and import | Import while key approval changing. | Consistent key version locked for batch. |
| `WF-007-NEG-011` | Negative/invalid marks rule | Invalid marking scheme creates negative beyond limit. | Rejected by scoring rules. |
| `WF-007-NEG-012` | Partial import accepted silently | Some rows invalid. | Batch status shows exceptions; no silent partial publish. |
| `WF-007-NEG-013` | Evaluation operator sees unauthorized school data | Scope mismatch. | Denied or masked. |
| `WF-007-NEG-014` | Audit missing for key approval/scoring | Approve key/generate scores. | Audit events present. |
| `WF-007-NEG-015` | Score batch generated from unvalidated import | Direct API call generate. | Blocked. |


## WF-008 — Score Batch to Results Publication

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `WF-008-NEG-001` | Results generated before score batch | Call generate results with no score batch. | Blocked. |
| `WF-008-NEG-002` | Results generated from failed/partial score batch | Use invalid score batch. | Blocked. |
| `WF-008-NEG-003` | Rank tie handling missing | Candidates with same score. | Tie rule deterministic and documented. |
| `WF-008-NEG-004` | Publish without approval | Directly publish draft results. | Blocked. |
| `WF-008-NEG-005` | Publish twice | Double-click publish. | Idempotent; one published batch/version. |
| `WF-008-NEG-006` | Withhold after publication | Withhold individual result after publish. | Allowed only through governed correction/withhold workflow; audit. |
| `WF-008-NEG-007` | Correction without reason | Correct result without reason/evidence. | Rejected. |
| `WF-008-NEG-008` | School sees unpublished results | School route before publish. | Denied/no data. |
| `WF-008-NEG-009` | School sees another school results | Change school/candidate id. | Denied. |
| `WF-008-NEG-010` | Certificate eligibility before publish | Generate certificate eligibility from draft results. | Blocked. |
| `WF-008-NEG-011` | Result notification failure | Provider down. | Publish persists; retry queued. |
| `WF-008-NEG-012` | Ranking changes after publication | Recalculate with changed data. | Published snapshot remains stable; new correction version if needed. |
| `WF-008-NEG-013` | PII in public result view | Open public/school result list. | Only allowed fields visible. |
| `WF-008-NEG-014` | Audit missing for publish/correction | Publish/correct result. | Audit events present. |
| `WF-008-NEG-015` | Concurrent publish and correction | One admin publishes while another corrects. | Conflict/version check. |


## WF-009 — Certificate Generation to Public Verification

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `WF-009-NEG-001` | Certificate generation before published results | Generate certificates from draft/unpublished results. | Blocked. |
| `WF-009-NEG-002` | Certificate for ineligible candidate | Force certificate generation for non-eligible result. | Blocked or exception approval required. |
| `WF-009-NEG-003` | Duplicate certificate generation | Run generation twice. | Same certificate/version or idempotent result; no duplicates. |
| `WF-009-NEG-004` | Certificate template missing | Generate when template unavailable. | Job fails cleanly; no published broken cert. |
| `WF-009-NEG-005` | Certificate QR/verification mismatch | Verify certificate against wrong candidate/result. | Verification fails; no data leakage. |
| `WF-009-NEG-006` | Public verification exposes excess PII | Open public verify page. | Only minimal allowed data shown. |
| `WF-009-NEG-007` | Revoked certificate still verifies active | Revoke certificate and verify old QR. | Shows revoked/invalid per policy. |
| `WF-009-NEG-008` | Reissue without version trail | Reissue certificate. | Version history and audit preserved. |
| `WF-009-NEG-009` | Download by wrong school | School downloads another school certificate. | Denied. |
| `WF-009-NEG-010` | Signed certificate URL expires | Use old signed URL. | Denied; new authorized URL required. |
| `WF-009-NEG-011` | Worker failure during PDF generation | Force generation error. | Retry/DLQ; status not published. |
| `WF-009-NEG-012` | Publish before all certs generated | Publish batch with failed items. | Blocked or partial policy explicit. |
| `WF-009-NEG-013` | Audit missing for generate/publish/revoke | Perform actions. | Audit events present. |
| `WF-009-NEG-014` | Name/class Unicode rendering | Certificate with non-Latin name. | PDF renders correctly or validation flags unsupported font. |
| `WF-009-NEG-015` | Certificate number collision | Generate under concurrency. | Unique constraint/idempotency prevents collision. |


## WF-010 — Support Ticket to Resolution

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `WF-010-NEG-001` | Ticket by inactive school | Inactive/suspended school creates support ticket. | Blocked or limited according to support policy. |
| `WF-010-NEG-002` | Ticket without category/severity | Submit blank mandatory fields. | Rejected with field errors. |
| `WF-010-NEG-003` | Attachment wrong type/too large | Upload unsafe/oversized attachment. | Rejected; no orphan file. |
| `WF-010-NEG-004` | School sees internal note | Add internal note then view as school. | Internal note hidden. |
| `WF-010-NEG-005` | Support links unsafe context | Link another school invoice/result to ticket. | Blocked by scope validation. |
| `WF-010-NEG-006` | Unauthorized staff resolves ticket | Low-role staff attempts resolution. | 403. |
| `WF-010-NEG-007` | Resolve without response | Mark resolved with no resolution note if mandatory. | Rejected. |
| `WF-010-NEG-008` | SLA scan creates duplicate tasks | Run SLA worker repeatedly. | Single active SLA task per ticket/stage. |
| `WF-010-NEG-009` | Ticket reopened after closed | School replies after resolution. | State moves to reopened if allowed; audit. |
| `WF-010-NEG-010` | Notification failure on resolution | Provider down. | Resolution persists; retry queued. |
| `WF-010-NEG-011` | Ticket delete with audit loss | Delete ticket. | Soft delete or blocked; audit retained. |
| `WF-010-NEG-012` | PII in support exports/logs | Export tickets. | Masked per role. |
| `WF-010-NEG-013` | Concurrent resolution and reply | Support resolves while school replies. | State conflict handled; no lost message. |
| `WF-010-NEG-014` | Cross-tenant ticket enumeration | Change ticket_id. | Denied. |
| `WF-010-NEG-015` | HTML/script in ticket body | Submit script payload. | Escaped; no XSS. |


## WF-011 — Sensitive Export Approval to Download

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `WF-011-NEG-001` | Sensitive export by unauthorized role | Non-approver requests/downloads private export. | Denied. |
| `WF-011-NEG-002` | Export without business reason | Submit request without reason. | Rejected. |
| `WF-011-NEG-003` | Maker self-approves export | Same user requests and approves. | Blocked. |
| `WF-011-NEG-004` | Export contains unmasked PII | Open generated export as lower role. | Masked/denied according to field masking rules. |
| `WF-011-NEG-005` | Export generated before approval | Directly call generation API. | Blocked. |
| `WF-011-NEG-006` | Download before generation complete | Click download early. | No file URL; status pending. |
| `WF-011-NEG-007` | Signed URL expired | Use old export URL. | Denied. |
| `WF-011-NEG-008` | Export file remains after retention | Check after expiry policy. | Expired/deleted/unavailable; audit retained. |
| `WF-011-NEG-009` | Export request duplicated | Double-click request/generate. | Single request/job/file or idempotent response. |
| `WF-011-NEG-010` | Worker failure during export | Force export job error. | Retry/DLQ; request not marked generated. |
| `WF-011-NEG-011` | Query too broad | Request all data without scope/date limit. | Rejected or requires elevated approval. |
| `WF-011-NEG-012` | Cross-scope export | Request data for another school/tenant. | Denied. |
| `WF-011-NEG-013` | Export downloaded without audit | Download file. | Download audit event exists. |
| `WF-011-NEG-014` | CSV injection | Export values beginning with =,+,-,@. | Escaped/sanitized to prevent spreadsheet formula injection. |
| `WF-011-NEG-015` | Public route exposes export file | Try direct route/object URL. | Denied; private storage only. |


## WF-012 — Role Scope Change with Maker Checker

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `WF-012-NEG-001` | User approves own role change | Request then approve with same account. | Blocked. |
| `WF-012-NEG-002` | Last super admin downgrade | Downgrade/delete final super admin. | Blocked. |
| `WF-012-NEG-003` | Role grants permission outside allowed scope | Grant finance role to school user or wrong scope. | Rejected. |
| `WF-012-NEG-004` | Permission escalation by API tampering | Submit extra permissions not shown in UI. | Server allowlist rejects. |
| `WF-012-NEG-005` | Role change without approval | Directly update user role. | Blocked; maker-checker required. |
| `WF-012-NEG-006` | Concurrent approve/reject | Two reviewers decide differently. | Only one final decision; conflict returned. |
| `WF-012-NEG-007` | Stale approval after request changed | Modify request then approve stale version. | Version conflict. |
| `WF-012-NEG-008` | Suspended approver approves | Suspend reviewer then approve. | Rejected. |
| `WF-012-NEG-009` | Sessions not refreshed after permission change | Changed user continues privileged action. | Session revoked or latest permissions checked. |
| `WF-012-NEG-010` | Role deletion with assigned users | Delete active role. | Blocked or migration path required. |
| `WF-012-NEG-011` | Permission drift after change | Compare role registry vs active permissions. | Drift scan passes or flags mismatch. |
| `WF-012-NEG-012` | Audit missing before/after permission set | Approve change. | Before/after audited. |
| `WF-012-NEG-013` | Invalid scope pattern | Submit malformed scope. | Rejected. |
| `WF-012-NEG-014` | Review task assigned to requester | System assigns approval to maker. | Blocked by assignment rule. |
| `WF-012-NEG-015` | UI shows privileged buttons after downgrade | Downgrade user, keep page open. | API blocks; UI refresh on next fetch. |


## WF-013 — Notification Template to Delivery

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `WF-013-NEG-001` | Template with unsafe placeholders | Use unknown/malformed variables. | Rejected before approval/send. |
| `WF-013-NEG-002` | Template with script/HTML injection | Submit HTML/script in template. | Escaped/sanitized or rejected. |
| `WF-013-NEG-003` | Bulk send without approval | Call dispatch API directly. | Blocked. |
| `WF-013-NEG-004` | Recipient list includes opted-out users | Send to opted-out contacts. | Opt-out respected; not sent. |
| `WF-013-NEG-005` | Recipient list crosses school scope | School-specific message includes other schools. | Rejected by scope resolver. |
| `WF-013-NEG-006` | Duplicate bulk send | Double-click approve/send. | Single batch; idempotent dispatch. |
| `WF-013-NEG-007` | Provider outage | Force SMS/email provider failure. | Retries/DLQ; delivery state reflects failure. |
| `WF-013-NEG-008` | Partial delivery failure | Some recipients fail. | Batch completed_with_errors; failures visible. |
| `WF-013-NEG-009` | Wrong channel fallback | Email fails then SMS sends without consent. | Blocked unless allowed by policy. |
| `WF-013-NEG-010` | PII in notification preview/log | Preview/log message with student data. | Masked where required. |
| `WF-013-NEG-011` | Template edited after approval | Change approved template before send. | Approval invalidated or new version required. |
| `WF-013-NEG-012` | Rate limit exceeded | Send too many messages. | Throttled/queued; no provider abuse. |
| `WF-013-NEG-013` | Webhook delivery replay | Replay delivered/failed callback. | Idempotent delivery status. |
| `WF-013-NEG-014` | Unauthorized template deletion | Low role deletes approved template. | Denied. |
| `WF-013-NEG-015` | Audit missing for bulk approval | Approve send. | Audit event present. |


## WF-014 — Admin Setting Change Governance

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `WF-014-NEG-001` | High-risk setting changed without approval | Change payment/provider/security flag directly. | Blocked or approval required. |
| `WF-014-NEG-002` | Feature flag invalid value | Submit unsupported flag value/type. | Rejected by schema. |
| `WF-014-NEG-003` | Policy version overwritten | Update policy concurrently. | Version conflict; no silent overwrite. |
| `WF-014-NEG-004` | Provider secret exposed in UI/logs | Configure provider with secret. | Secret masked; never returned after save. |
| `WF-014-NEG-005` | Rollback missing | Change setting then attempt rollback. | Previous version available or rollback blocker explicit. |
| `WF-014-NEG-006` | Feature flag affects wrong environment | Change staging flag and inspect production. | Environment isolation maintained. |
| `WF-014-NEG-007` | Setting change by unauthorized user | Low role updates admin setting. | 403. |
| `WF-014-NEG-008` | Unsafe setting enables public private routes | Toggle that exposes private data. | Guardrail blocks or requires security approval. |
| `WF-014-NEG-009` | Audit missing for policy/flag change | Change setting. | Before/after/version audited. |
| `WF-014-NEG-010` | Invalid timezone/currency config | Set unsupported timezone/currency. | Rejected. |
| `WF-014-NEG-011` | Notification provider misconfigured | Save incomplete provider config. | Validation fails; cannot activate. |
| `WF-014-NEG-012` | Setting change creates downstream drift | Change policy then validate workflows. | Drift detected and sync plan generated. |
| `WF-014-NEG-013` | Self-approval of high-risk config | Maker approves own change. | Blocked. |
| `WF-014-NEG-014` | Stale config cache | Change setting and perform action. | Server uses latest or controlled cache invalidation. |
| `WF-014-NEG-015` | Secret rotation breaks existing jobs | Rotate provider secret with pending jobs. | Jobs use versioned/valid secret or retry safely. |


## WF-015 — Security Incident and Audit Drift Review

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `WF-015-NEG-001` | Security finding created without evidence | Create incident/finding blank. | Rejected. |
| `WF-015-NEG-002` | Low role views audit console | Access audit/security route/API. | Denied. |
| `WF-015-NEG-003` | Audit hash verification fails | Tamper audit record/checksum. | Finding/incident created; no silent pass. |
| `WF-015-NEG-004` | Permission drift scan false negative | Change permission outside registry. | Drift scan detects mismatch. |
| `WF-015-NEG-005` | Incident assigned to suspended user | Assign remediation to suspended staff. | Blocked or reassigned. |
| `WF-015-NEG-006` | Critical incident notification fails | Provider outage. | Incident persists; retry/escalation task created. |
| `WF-015-NEG-007` | Finding closed without remediation note | Close finding without evidence. | Rejected. |
| `WF-015-NEG-008` | Audit export exposes PII | Export audit logs. | Masked/minimized according to role. |
| `WF-015-NEG-009` | Out-of-order incident states | Move resolved back to open without reopen reason. | Blocked or audited reopen. |
| `WF-015-NEG-010` | Duplicate scan jobs | Run drift scan repeatedly. | Single active scan or idempotent result. |
| `WF-015-NEG-011` | Security reviewer self-closes own finding | Maker/checker violation if configured. | Blocked. |
| `WF-015-NEG-012` | Dashboard reports healthy despite open critical finding | Create critical incident then dashboard. | Security health degraded. |
| `WF-015-NEG-013` | Old incidents deleted | Attempt hard delete. | Blocked or retention policy enforced. |
| `WF-015-NEG-014` | Correlation ID missing | Trace incident from alert to event. | Correlation present. |
| `WF-015-NEG-015` | Unauthorized task completion | Non-assigned/non-reviewer closes remediation task. | Denied. |


## WF-016 — Full Olympiad Operations Happy Path

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `WF-016-NEG-001` | Full path starts with incomplete prerequisites | Begin E2E without seed school/user/config. | Setup validator blocks or creates seed explicitly. |
| `WF-016-NEG-002` | One workflow marked complete without gate evidence | Manually update completed status. | Completion validator rejects. |
| `WF-016-NEG-003` | Downstream starts after upstream failure | Fail roster/payment/material then start results. | Blocked by dependency graph. |
| `WF-016-NEG-004` | Cross-workflow state drift | Change school/payment/roster after material release. | Drift detector flags affected downstream workflows. |
| `WF-016-NEG-005` | Rollback after partial full path | Failure during result/certificate stage. | Rollback/recovery plan explicit; no hidden corrupt states. |
| `WF-016-NEG-006` | Worker backlog during full path | Queue many jobs. | Backpressure and statuses visible; no false completion. |
| `WF-016-NEG-007` | Notification storm | Run full path for many schools. | Rate limits/batching respected. |
| `WF-016-NEG-008` | Dashboard aggregate mismatch | Compare dashboard counts with source records. | Dashboard matches or reconciliation report generated. |
| `WF-016-NEG-009` | Audit trail gap end-to-end | Trace from lead to certificate. | Every major transition has audit event. |
| `WF-016-NEG-010` | Permission change mid-E2E | Downgrade actor midway. | Next privileged action blocked. |
| `WF-016-NEG-011` | School deleted/suspended mid-E2E | Suspend school after payment/roster. | Downstream actions blocked or exception path required. |
| `WF-016-NEG-012` | Clock/timezone boundary | Run release/publish around midnight. | Release windows and dates correct. |
| `WF-016-NEG-013` | Public verification before certificates | Access public verify before cert publish. | No data or not found. |
| `WF-016-NEG-014` | Re-run E2E seed | Run same E2E twice. | Idempotent seed/run; no duplicate records unless versioned. |
| `WF-016-NEG-015` | Production readiness claim without full E2E | Try to mark production ready. | Production gate blocks until full E2E passes. |


## Database Hardening Tests

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `DB-001` | Missing unique constraints | Attempt duplicate school, invoice, candidate, certificate, payment reference. | Database rejects or app handles unique conflict safely. |
| `DB-002` | Transaction partial commit | Force failure halfway through multi-write action. | All writes rollback or compensating action recorded. |
| `DB-003` | Foreign key orphan | Delete parent while child records exist. | Blocked or cascades only where explicitly designed. |
| `DB-004` | Invalid enum state | Insert unsupported lifecycle state. | Rejected by app/database validation. |
| `DB-005` | Optimistic lock missing | Update stale version of record. | Conflict returned; no silent overwrite. |
| `DB-006` | Migration drops data | Run destructive migration without backup/approval. | Migration gate blocks. |
| `DB-007` | Rollback migration unsafe | Apply and rollback migration with sample data. | Rollback works or blocker documented. |
| `DB-008` | RLS bypass | Direct query/API attempts cross-scope access. | Blocked by DB/app policy. |
| `DB-009` | Null required business field | Create record without required non-null business fields. | Rejected. |
| `DB-010` | Soft deleted record used downstream | Use deleted/suspended entity in workflow. | Blocked by active-state checks. |
| `DB-011` | Timezone stored as local string | Create schedule/release time. | Stored normalized with timezone policy. |
| `DB-012` | Audit table mutation | Attempt update/delete audit row. | Blocked or append-only enforcement. |


## Security and Privacy Hardening Tests

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `SEC-001` | Public route exposure | Crawl public routes and APIs. | No private data visible without auth. |
| `SEC-002` | Secret leakage | Search generated code, logs, browser payloads. | No secrets committed or returned. |
| `SEC-003` | CSRF-like mutation | Attempt cross-site mutation where applicable. | Blocked by auth/session/method controls. |
| `SEC-004` | Open redirect | Tamper returnUrl/redirect parameter. | Redirect only to allowed origins/paths. |
| `SEC-005` | CORS over-permissive | Call API from untrusted origin. | Rejected unless explicitly allowed. |
| `SEC-006` | Rate limit bypass | Rapidly call login/export/notification APIs. | Rate limited/throttled. |
| `SEC-007` | Password/token reset abuse if implemented | Replay/guess/reset token. | Single-use, expires, scoped. |
| `SEC-008` | Storage bucket public listing | Try list/download storage objects. | Private by default; signed access only. |
| `SEC-009` | IDOR | Change record IDs in API calls. | Denied unless scoped. |
| `SEC-010` | XSS in rendered fields | Save script in free text and render. | Escaped/sanitized. |
| `SEC-011` | CSV formula injection | Export malicious text cells. | Escaped/sanitized. |
| `SEC-012` | Sensitive data in analytics | Inspect analytics/log events. | PII minimized/masked. |


## Worker / Queue / Async Exception Tests

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `WORKER-001` | Retry creates duplicate effect | Force worker retry after side effect. | Idempotency prevents duplicate notification/file/result. |
| `WORKER-002` | DLQ not visible | Force repeated job failure. | DLQ item visible in ops dashboard/runbook. |
| `WORKER-003` | Job runs with stale permissions | Permission revoked after job queued. | Worker revalidates current permission/state. |
| `WORKER-004` | Job runs after cancellation | Cancel/revoke object before queued job executes. | Worker exits safely. |
| `WORKER-005` | Poison message blocks queue | Insert permanently failing job. | Job isolated to DLQ; queue continues. |
| `WORKER-006` | Provider timeout | Email/payment/storage provider times out. | Retry/backoff; no false success. |
| `WORKER-007` | Out-of-order job | Run downstream job before upstream complete. | Job waits/retries/fails safely. |
| `WORKER-008` | Clock skew | Release/expiry worker uses wrong time. | Server authoritative time used. |


## UI / Browser QA Edge Cases

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `UI-001` | Loading state missing | Slow API response. | Loading skeleton/spinner appears; no broken blank screen. |
| `UI-002` | Empty state missing | No records for module. | Clear empty state and next action shown. |
| `UI-003` | Access denied state missing | Forbidden role opens page. | Clean access denied; no data flash. |
| `UI-004` | Network error | API unavailable. | Retry/error message; no crash. |
| `UI-005` | Mobile layout | Open critical screens on phone width. | No unusable table/form overflow. |
| `UI-006` | Long text overflow | School name/address very long. | UI wraps/truncates safely. |
| `UI-007` | Double-click buttons | Double submit major action. | Button disables/idempotency handles. |
| `UI-008` | Back button after mutation | Use browser back after completion. | No stale invalid action submitted. |
| `UI-009` | Refresh during wizard | Refresh mid-form/wizard. | Draft recovered or explicit warning. |
| `UI-010` | Console errors | Run workflow browser QA. | No blocking console/runtime errors. |
| `UI-011` | Form validation mismatch | Invalid fields in UI vs API. | Consistent validation messages. |
| `UI-012` | Accessibility keyboard path | Complete workflow by keyboard. | Focusable controls, labels and visible errors. |


## Drift / Governance Tests

| ID | Scenario | Test Action | Expected Result |
|---|---|---|---|
| `DRIFT-001` | Workflow exists without spec mapping | Remove workflow traceability entry. | Drift detector fails build. |
| `DRIFT-002` | Spec module exists without workflow | Add module to registry without workflow. | Orphan module workflow generated or failure reported. |
| `DRIFT-003` | API route exists without OpenAPI/spec | Add unregistered API route. | Spec-less code guardrail fails. |
| `DRIFT-004` | Screen route exists without screen contract | Add screen without contract. | Screen contract drift detected. |
| `DRIFT-005` | Journey test missing for workflow | Remove Playwright/e2e journey test. | Workflow coverage drift detected. |
| `DRIFT-006` | Permission differs between role matrix and API | Modify only UI/API permission. | Permission drift detected. |
| `DRIFT-007` | Completed summary false claim | Mark workflow complete without evidence. | Completion validator rejects. |
| `DRIFT-008` | Change request not propagated | Change source-of-truth but not downstream files. | Upstream/downstream sync detects missing updates. |
| `DRIFT-009` | Brain/skills not read by agent | Agent output ignores mandatory rules. | Prompt compliance/drift review fails. |
| `DRIFT-010` | Artifact registry missing file | Generate file not registered. | Artifact registry validator flags. |


## Required Per-Workflow Evidence

For each workflow completion, attach or generate:

```text
1. browser QA screenshot/video/trace
2. API test output
3. database state proof
4. audit timeline proof
5. permission negative test proof
6. privacy masking/export proof where relevant
7. worker job proof where relevant
8. drift report
9. completed/pending update
```

## Final Gate

```text
A workflow is not complete because code exists.
A workflow is complete only when its chain works, its negative cases fail safely, its exceptions recover safely, and its drift report is clean.
```