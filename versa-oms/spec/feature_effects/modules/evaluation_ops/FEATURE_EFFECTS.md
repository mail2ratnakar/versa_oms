# Evaluation Ops — Feature Effects

Purpose: Answer key, OMR import, validation and scoring

## FX-041 — create_answer_key

- Actor: Authorized Staff
- Source screen: Evaluation Ops - Create answer key
- API/worker: `POST /evaluation-ops/answer-keys`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: answer key draft created
- Audit event: `evaluation_ops.create_answer_key`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: draft visible to authorized roles
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-041`

## FX-042 — approve_answer_key

- Actor: Authorized Staff
- Source screen: Evaluation Ops - Approve answer key
- API/worker: `POST /answer-keys/{id}/approve`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: answer key approved/version locked
- Audit event: `evaluation_ops.approve_answer_key`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: available for scoring
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-042`

## FX-043 — import_omr

- Actor: Authorized Staff
- Source screen: Evaluation Ops - Import OMR/CSV
- API/worker: `POST /evaluation-ops/imports`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: import batch and validation job queued
- Audit event: `evaluation_ops.import_omr`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: import validating
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-043`

## FX-044 — generate_scores

- Actor: Authorized Staff
- Source screen: Evaluation Ops - Generate score batch
- API/worker: `POST /imports/{id}/score`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: score batch generated and exceptions flagged
- Audit event: `evaluation_ops.generate_scores`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: score summary visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-044`
