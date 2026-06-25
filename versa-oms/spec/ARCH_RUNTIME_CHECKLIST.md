# Claude Code Architectural & Runtime Keyword Checklist

## Purpose

Feed this file to Claude Code / Codex before it writes or changes code.

Claude must use this as a mandatory engineering checklist while implementing features, fixing bugs, wiring infra, writing APIs, building UI screens, creating workers, writing tests, or claiming completion.

Core rule:

```text
Do not write code only to make the page compile.
Write code that survives real users, bad input, retries, failures, concurrency, security attacks, infra issues, and end-to-end journey verification.
```
---

# 0. Mandatory Pre-Code Questions

Before coding, Claude must answer:

```text
1. Which feature am I changing?
2. Which actor uses it?
3. Which screen owns it?
4. Which API/service handles it?
5. Which database records change?
6. Which status transition happens?
7. Which downstream effect happens?
8. Which audit event is written?
9. Which security/privacy rules apply?
10. Which journey test proves it?
11. Which checklist sections below apply?
```

If Claude cannot answer these, it must stop and report the missing layer.
---

# 1. State & Execution Control Keywords

Claude must actively think about these while coding:

```text
Concurrency
Idempotency
Atomicity
Isolation
Durability
Linearizability
Serializability
Race-condition
Deadlock
Livelock
Thread-safety
Reentrancy
Eventual-consistency
Strong-consistency
Read-after-write-consistency
Backpressure
Rate-limiting
Throttling
Load-shedding
Circuit-breaking
Exponential-backoff
Jitter
Fail-fast
Fail-safe
Graceful-degradation
Dead-letter-queue
Poison-pill-message
Bulkheading
Event-sourcing
CQRS
Saga-pattern
Two-phase-commit
Outbox-pattern
Inbox-pattern
Compensating-transaction
Optimistic-locking
Pessimistic-locking
Versioning
State-machine
Status-transition
Lifecycle-guard
Retry-safety
Duplicate-suppression
Exactly-once-semantics
At-least-once-semantics
At-most-once-semantics
```

Checklist:

```text
[ ] Could this action be clicked twice?
[ ] Could two users approve/change the same record?
[ ] Could a retry create duplicate records?
[ ] Is the state transition valid?
[ ] Is there a transaction?
[ ] Is there locking/versioning where needed?
[ ] Is there an idempotency key?
[ ] Is there a retry-safe worker path?
[ ] Is there a DLQ for poison messages?
```
---

# 2. Data & Input Integrity Keywords

```text
Type-safety
Schema-validation
Runtime-validation
Input-sanitization
Output-encoding
Boundary-checking
Null-safety
Undefined-safety
Immutability
Determinism
Side-effect-isolation
Data-masking
Anonymization
Tokenization
Serialization
Deserialization
Schema-evolution
Backward-compatibility
Forward-compatibility
Over-fetching
Under-fetching
N-plus-one-query-problem
Referential-integrity
Foreign-key-integrity
Unique-constraints
Check-constraints
Enum-validation
Required-fields
Forbidden-fields
Payload-size-limit
File-size-limit
Content-type-validation
MIME-validation
CSV-injection-protection
Date-timezone-normalization
Currency-minor-units
Decimal-precision
Rounding-rules
```

Checklist:

```text
[ ] TypeScript strict types are used.
[ ] Runtime schema validation exists.
[ ] Required fields are validated.
[ ] Unknown dangerous fields are rejected.
[ ] Forbidden fields are rejected.
[ ] Enum/status values are validated.
[ ] Numeric ranges are checked.
[ ] String lengths are checked.
[ ] Date/timezone is normalized.
[ ] Currency uses minor units.
[ ] File type and size are checked.
[ ] CSV injection is blocked.
[ ] Inputs are sanitized.
[ ] Outputs are encoded/masked.
```

Versa forbidden fields:

```text
Aadhaar
passport
bank account
raw OMR
answer key
provider payload
private file URL
signed URL in request body
role from browser
scope from browser
school_id from browser where session-scoped
payment status from browser
payment amount from browser
result score from browser
rank from browser
approval state from browser
```
---

# 3. Security & Privacy Keywords

```text
Least-privilege
Defense-in-depth
Secure-by-default
Deny-by-default
Server-side-authorization
RBAC
ABAC
RLS
Scope-checking
Tenant-isolation
School-scope-isolation
Session-validation
Token-expiry
Token-rotation
Secret-management
Replay-attack-prevention
CSRF
XSS
SQL-injection
Command-injection
Path-traversal
SSRF
Open-redirect
Prototype-pollution
Mass-assignment
Unsafe-deserialization
Privilege-escalation
Broken-access-control
Constant-time-comparison
Password-hashing
Invite-token-hashing
Signed-URL-expiry
Private-storage
Audit-logging
PII-masking
Sensitive-field-redaction
Log-redaction
Data-retention
Public-verification-minimality
Provider-payload-protection
Answer-key-restriction
Raw-OMR-restriction
```

Checklist:

```text
[ ] Auth is checked server-side.
[ ] Role is resolved server-side.
[ ] Scope is resolved server-side.
[ ] Browser role/scope/school_id are ignored.
[ ] School user sees own school only.
[ ] Staff access follows module/action permission.
[ ] RLS exists where using Supabase/Postgres.
[ ] Sensitive fields are masked.
[ ] Logs are redacted.
[ ] Answer keys are restricted.
[ ] Raw OMR is restricted.
[ ] Provider payload is hidden.
[ ] Public verification returns minimal data only.
[ ] Secrets are not committed.
[ ] Tokens expire.
[ ] Signed URLs expire.
[ ] Cross-school access test exists.
```
---

# 4. Auth / RBAC / RLS Checklist

```text
[ ] Real auth wired for staging/production.
[ ] Dev fallback disabled outside local.
[ ] Staff and school users separated.
[ ] Staff is invite-only.
[ ] Staff self-registration disabled.
[ ] Disabled users blocked.
[ ] Session expiry enforced.
[ ] Session revocation supported.
[ ] Role resolved server-side.
[ ] Scope resolved server-side.
[ ] Browser-submitted role ignored.
[ ] Browser-submitted scope ignored.
[ ] Browser-submitted school_id ignored for school users.
[ ] Own-school access enforced.
[ ] Cross-school access test exists.
[ ] Last Super Admin protected.
[ ] Self-role-change blocked.
[ ] Public routes explicitly allowlisted.
```
---

# 5. Idempotency Checklist

For every write API or worker job:

```text
[ ] X-Idempotency-Key required.
[ ] Payload hash stored.
[ ] Same key + same payload replays safely.
[ ] Same key + different payload returns conflict.
[ ] Idempotency record persisted.
[ ] TTL/expiry defined.
[ ] Duplicate payment confirmation blocked.
[ ] Duplicate notification blocked.
[ ] Duplicate certificate generation blocked.
[ ] Duplicate result publication blocked.
[ ] Worker job idempotency key defined.
[ ] Tests prove replay and conflict behavior.
```
---

# 6. Transaction / Concurrency Checklist

```text
[ ] Multi-step DB changes are transactional.
[ ] Transaction rolls back on failure.
[ ] Isolation level considered.
[ ] Race condition considered.
[ ] Concurrent approval conflict handled.
[ ] Concurrent payment confirmation handled.
[ ] Concurrent roster lock handled.
[ ] Concurrent material release handled.
[ ] Concurrent result publication handled.
[ ] Optimistic or pessimistic locking used where needed.
[ ] Version field checked before update.
[ ] Stale writes cannot overwrite newer state.
[ ] Unique constraints enforce invariants.
[ ] Tests simulate duplicate/concurrent requests where important.
```
---

# 7. State Machine / Lifecycle Checklist

For every status transition:

```text
[ ] Source status allowed.
[ ] Target status allowed.
[ ] Invalid transition blocked.
[ ] Reason required where needed.
[ ] Previous status stored.
[ ] New status stored.
[ ] Actor stored.
[ ] Audit event written.
[ ] Downstream effect executed.
[ ] UI reflects new state.
[ ] Journey test proves transition.
```

Versa high-risk lifecycle transitions:

```text
lead.converted
school.activated
roster.locked
payment.paid
slot.rescheduled
material.released
material.revoked
answer_key.approved
score_batch.approved
results.published
result.corrected
certificate.revoked
certificate.reissued
sensitive_export.approved
feature_flag.changed
role_scope.changed
```
---

# 8. Audit Logging Checklist

```text
[ ] Every write action audited.
[ ] Every high-risk action audited.
[ ] Every approval audited.
[ ] Every rejection audited.
[ ] Every sensitive download audited.
[ ] Every export audited.
[ ] Every role/scope change audited.
[ ] Previous status captured.
[ ] New status captured.
[ ] Actor id captured.
[ ] Actor role snapshot captured.
[ ] Actor scope snapshot captured.
[ ] Entity id captured.
[ ] Reason captured where required.
[ ] Request id captured.
[ ] Job id captured where worker-driven.
[ ] Event hash implemented.
[ ] Append-only enforced at DB level.
[ ] Audit cannot be updated or deleted.
[ ] Audit tests exist.
```
---

# 9. High-Risk Action Checklist

High-risk examples:

```text
Role/scope changes
Manual payment confirmation
Refund/reversal
Material release
Material replacement
Material revocation
Answer key approval
OMR approval
Result publication
Published result correction
Certificate revoke/reissue
Sensitive export
Bulk notification
Public verification policy change
Admin/security setting change
```

Checklist:

```text
[ ] Action identified as high-risk.
[ ] Reason required.
[ ] Maker-checker required where configured.
[ ] Self-approval blocked.
[ ] Approval task created.
[ ] Approval audit written.
[ ] Rejection path exists.
[ ] Rollback/revoke/supersede path exists.
[ ] Feature flag checked where public/external impact exists.
[ ] Notification sent where operationally needed.
[ ] Security test exists.
```
---

# 10. File Storage / Signed URL Checklist

```text
[ ] Private storage only.
[ ] Raw storage path never returned.
[ ] Raw storage path never logged.
[ ] Signed URL generated server-side only.
[ ] Signed URL short-lived.
[ ] Signed URL scoped to actor/entity.
[ ] Download permission checked before URL.
[ ] Download audit written.
[ ] URL revocation supported where needed.
[ ] File metadata stored.
[ ] File content type validated.
[ ] File size validated.
[ ] Malware/virus scan considered where uploads exist.
[ ] Unauthorized download blocked test exists.
```

Sensitive Versa files:

```text
question papers
answer sheets
OMR scans
answer keys
result exports
certificates
support attachments
payment proofs
school documents
```
---

# 11. Worker Queue Checklist

```text
[ ] Job registered in job registry.
[ ] Queue selected.
[ ] Payload schema validated.
[ ] Source record reloaded from DB.
[ ] Feature flag checked.
[ ] Idempotency enforced.
[ ] Retry policy defined.
[ ] Exponential backoff used.
[ ] Jitter used.
[ ] Max attempts defined.
[ ] DLQ path defined.
[ ] Poison-pill isolated.
[ ] Job status persisted.
[ ] Job audit written.
[ ] Metrics emitted.
[ ] Sensitive payload not logged.
[ ] Manual retry path exists.
[ ] Tests cover success, failure, retry and DLQ.
```
---

# 12. Resilience / Error Handling Keywords

```text
Retry-policy
Exponential-backoff
Jitter
Circuit-breaker
Timeout
Deadline
Graceful-degradation
Fallback
Cached-fallback
Dead-letter-queue
Poison-pill-isolation
Bulkhead
Backpressure
Health-check
Readiness-probe
Liveness-probe
Dependency-health
Failover
Recovery
Compensation
Rollback
Partial-failure
Transient-failure
Permanent-failure
Error-classification
Safe-error-message
Error-boundary
User-retry-flow
Manual-review-queue
Human-in-the-loop
Escalation
SLA-breach
```

Checklist:

```text
[ ] External calls have timeout.
[ ] External calls have retry policy.
[ ] Non-retryable errors are not retried.
[ ] Retryable errors are classified.
[ ] Circuit breaker considered for flaky dependency.
[ ] Rate limits enforced.
[ ] Backpressure considered.
[ ] Graceful degradation path exists.
[ ] Safe error messages returned.
[ ] Error boundary exists for UI.
[ ] Failed state visible to user.
[ ] Stack traces not exposed.
[ ] Failure creates task/alert where needed.
```
---

# 13. Performance / Resource Safety Checklist

```text
[ ] Pagination enforced.
[ ] Hard page-size max enforced.
[ ] Cursor/keyset pagination used where needed.
[ ] N+1 queries avoided.
[ ] DB indexes exist for filters/sorts.
[ ] Query timeout considered.
[ ] Connection pooling used.
[ ] Large exports handled async.
[ ] Large files streamed.
[ ] Memory-heavy operations avoided.
[ ] Cache invalidation defined.
[ ] Response payload size controlled.
[ ] P95/P99 latency considered for critical paths.
[ ] Queue depth monitored.
[ ] Worker concurrency bounded.
```
---

# 14. Observability Checklist

```text
[ ] Structured logs used.
[ ] Logs redacted.
[ ] Request id included.
[ ] Correlation id included.
[ ] Actor id included safely.
[ ] Module id included.
[ ] Release id included.
[ ] Metrics emitted.
[ ] Error counters emitted.
[ ] Worker metrics emitted.
[ ] Audit health monitored.
[ ] Health endpoints implemented.
[ ] Readiness endpoint implemented.
[ ] Liveness endpoint implemented.
[ ] Alerts wired for critical failures.
[ ] Dashboard/report exists.
```

Required health endpoints:

```text
/api/health
/api/health/db
/api/health/storage
/api/health/workers
/api/health/audit
/api/health/providers
/api/health/release
```
---

# 15. UI / UX Checklist

```text
[ ] Screen contract read.
[ ] Page route exists.
[ ] Page header exists.
[ ] Status badge exists.
[ ] Table/card/list exists.
[ ] Detail panel exists.
[ ] Action panel exists.
[ ] Audit timeline exists where relevant.
[ ] Loading state exists.
[ ] Empty state exists.
[ ] Error state exists.
[ ] Access denied state exists.
[ ] Form validation visible.
[ ] Success confirmation visible.
[ ] Role-based actions hidden/disabled.
[ ] Server still blocks unauthorized action.
[ ] Mobile behavior works.
[ ] Keyboard/accessibility basics considered.
```
---

# 16. Journey Completion Checklist

A journey is complete only if:

```text
[ ] Actor can login or resolve.
[ ] Actor opens source screen.
[ ] Actor performs action.
[ ] API/service executes.
[ ] DB state changes.
[ ] Audit event written.
[ ] Downstream effect happens.
[ ] UI result appears.
[ ] Unauthorized actor blocked.
[ ] Sensitive fields masked.
[ ] Test passes.
```

If any item is missing, do not claim complete.
---

# 17. Testing Checklist

## Normal feature

```text
[ ] Unit test.
[ ] API integration test.
[ ] Journey test.
[ ] Unauthorized access test.
[ ] Validation error test.
[ ] Audit test.
```

## High-risk feature

```text
[ ] Dual approval test.
[ ] Self-approval blocked test.
[ ] Reason required test.
[ ] Audit test.
[ ] Rollback/revoke/supersede test.
```

## File feature

```text
[ ] Signed URL expiry test.
[ ] Unauthorized download blocked test.
[ ] Download audit test.
[ ] Raw path not returned test.
```

## Worker feature

```text
[ ] Success test.
[ ] Retry test.
[ ] DLQ test.
[ ] Idempotency test.
[ ] Safe logging test.
```

## Privacy feature

```text
[ ] Masking test.
[ ] Cross-school isolation test.
[ ] Public minimal response test.
[ ] Sensitive role restriction test.
```
---

# 18. Deployment Readiness Checklist

Before claiming staging-ready:

```text
[ ] Git repo initialized.
[ ] CI configured.
[ ] CI passes.
[ ] Real DB connected.
[ ] Migrations applied.
[ ] Real auth connected.
[ ] Dev fallback disabled.
[ ] Private storage connected.
[ ] Signed URLs real.
[ ] Seed data loaded.
[ ] Journey tests pass.
[ ] Security tests pass.
[ ] Privacy tests pass.
[ ] Health endpoints pass.
[ ] Environment variables documented.
```

Before claiming production-ready:

```text
[ ] Staging passed.
[ ] Production secrets configured.
[ ] Production feature flags conservative.
[ ] Monitoring live.
[ ] Alerts live.
[ ] Backups configured.
[ ] Restore tested.
[ ] Rollback tested.
[ ] Rate limits active.
[ ] Audit immutability active.
[ ] No critical/high gaps.
```
---

# 19. Claude Code Pre-Commit Review Format

Before every completion report, Claude must produce:

```text
FEATURE:
FILES CHANGED:
SCREENS CHANGED:
APIS CHANGED:
DB CHANGES:
EFFECT CHAINS IMPLEMENTED:
AUDIT EVENTS:
SECURITY/PRIVACY CHECKS:
TESTS ADDED:
COMMANDS RUN:
RESULT:
REMAINING GAPS:
READINESS LABEL:
```

Allowed readiness labels:

```text
spec-complete
scaffold-complete
local-functional
staging-candidate
staging-ready
production-candidate
production-ready
```
---

# 20. Stop Conditions

Claude must stop and report if:

```text
[ ] Effect chain missing.
[ ] Screen contract missing.
[ ] Journey test missing.
[ ] High-risk approval rule unclear.
[ ] Role/scope rule unclear.
[ ] Destructive migration required.
[ ] Real infra credential required.
[ ] Public/private exposure unclear.
[ ] Sensitive field rule unclear.
[ ] Payment/result/certificate rule unclear.
[ ] Production secret needed.
```

Stop report format:

```text
STOPPED:
REASON:
MISSING INPUT:
AFFECTED FEATURE:
AFFECTED SCREEN:
AFFECTED API:
RISK:
SAFE NEXT STEP:
```
---

# 21. Minimal Prompt To Feed Claude

```text
Read this checklist before coding.

For every file you write, apply the relevant sections:
- validation
- auth/RBAC/scope
- idempotency
- concurrency
- lifecycle/state
- audit
- high-risk action
- file/signed URL
- worker queue
- resilience
- performance
- observability
- UI
- journey test
- deployment readiness

Do not mark anything complete unless the Journey Completion Checklist passes.

Before reporting completion, produce the Pre-Commit Review format from section 19.
```
---

# 22. Founder-Specific Versa Rule

For Versa Olympiads, never trust these from browser input:

```text
role
scope
school_id
payment_status
payment_amount
approval_state
result_score
rank
certificate_status
material_status
file_url
signed_url
answer_key
raw_omr
provider_payload
export_status
```

Always calculate or resolve these server-side.
---

# 23. Final Quality Rule

High-quality code is not only code that compiles.

High-quality code is code that:

```text
handles bad input
survives retries
prevents duplicate effects
protects data
enforces permissions
persists correctly
audits important actions
recovers from failures
is observable
is tested end-to-end
does not hide gaps
```
