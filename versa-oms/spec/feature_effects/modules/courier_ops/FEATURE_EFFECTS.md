# Courier Ops — Feature Effects

Purpose: Dispatch, tracking, receipt and incidents

## FX-037 — create_dispatch

- Actor: Authorized Staff
- Source screen: Courier Ops - Create dispatch
- API/worker: `POST /courier-ops/dispatches`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: dispatch record created
- Audit event: `courier_ops.create_dispatch`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: dispatch visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-037`

## FX-038 — update_tracking

- Actor: Authorized Staff
- Source screen: Courier Ops - Update tracking
- API/worker: `POST /dispatches/{id}/tracking`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: tracking updated
- Audit event: `courier_ops.update_tracking`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: latest tracking shown
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-038`

## FX-039 — confirm_receipt

- Actor: Authorized Staff
- Source screen: Courier Ops - Confirm receipt
- API/worker: `POST /dispatches/{id}/receipt`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: receipt and mismatch check created
- Audit event: `courier_ops.confirm_receipt`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: receipt status visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-039`

## FX-040 — raise_incident

- Actor: Authorized Staff
- Source screen: Courier Ops - Raise courier incident
- API/worker: `POST /courier-ops/incidents`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: incident and task created
- Audit event: `courier_ops.raise_incident`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: incident visible in queue
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-040`
