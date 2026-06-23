# Student Roster Ops — Feature Effects

Purpose: Roster import, validation, lock and candidate generation

## FX-021 — upload_roster

- Actor: Authorized Staff
- Source screen: Student Roster Ops - Upload roster
- API/worker: `POST /student-roster-ops/imports`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: batch created and validation job queued
- Audit event: `student_roster_ops.upload_roster`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: batch validating
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-021`

## FX-022 — validate_roster

- Actor: System Worker
- Source screen: Student Roster Ops - Validate roster
- API/worker: `worker:roster.validate`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: errors produced or batch validated
- Audit event: `student_roster_ops.validate_roster`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: validation summary visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-022`

## FX-023 — lock_roster

- Actor: Authorized Staff
- Source screen: Student Roster Ops - Lock roster and generate candidates
- API/worker: `POST /{id}/lock`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: batch locked and candidate IDs generated
- Audit event: `student_roster_ops.lock_roster`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: candidate IDs visible to authorized roles
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-023`

## FX-024 — request_correction

- Actor: School Coordinator
- Source screen: Student Roster Ops - Request correction
- API/worker: `POST /school/students/{id}/correction-request`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: correction request and task created
- Audit event: `student_roster_ops.request_correction`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: request pending visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-024`
