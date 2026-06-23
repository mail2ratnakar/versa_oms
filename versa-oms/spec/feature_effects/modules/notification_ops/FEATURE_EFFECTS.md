# Notification Ops — Feature Effects

Purpose: Templates, recipient resolution and delivery

## FX-053 — create_template

- Actor: Authorized Staff
- Source screen: Notification Ops - Create template
- API/worker: `POST /notification-ops/templates`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: template draft created
- Audit event: `notification_ops.create_template`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: template visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-053`

## FX-054 — approve_bulk_send

- Actor: Authorized Staff
- Source screen: Notification Ops - Approve bulk notification
- API/worker: `POST /batches/{id}/approve`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: batch approved and dispatch job queued
- Audit event: `notification_ops.approve_bulk_send`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: status queued/sending
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-054`

## FX-055 — dispatch_batch

- Actor: System Worker
- Source screen: Notification Ops - Dispatch notification batch
- API/worker: `worker:notification.dispatch_batch`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: delivery attempts stored
- Audit event: `notification_ops.dispatch_batch`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: delivery summary visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-055`

## FX-056 — process_failure_optout

- Actor: Authorized Staff
- Source screen: Notification Ops - Process failure/opt-out
- API/worker: `POST /deliveries/{id}/status`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: delivery/opt-out state updated
- Audit event: `notification_ops.process_failure_optout`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: future sends respect consent
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-056`
