# Task Work Queue — Feature Effects

Purpose: Tasks, approvals, escalations and SLA management

## FX-061 — create_task

- Actor: Authorized Staff
- Source screen: Task Work Queue - Create task from effect
- API/worker: `internal task service`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: task with owner/SLA/source created
- Audit event: `task_work_queue.create_task`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: task in queue
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-061`

## FX-062 — assign_task

- Actor: Authorized Staff
- Source screen: Task Work Queue - Assign task
- API/worker: `POST /tasks/{id}/assign`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: assignee changed
- Audit event: `task_work_queue.assign_task`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: assignee queue updates
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-062`

## FX-063 — record_decision

- Actor: Authorized Staff
- Source screen: Task Work Queue - Approve/reject task decision
- API/worker: `POST /tasks/{id}/decision`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: decision stored and source workflow advances
- Audit event: `task_work_queue.record_decision`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: source status updates
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-063`

## FX-064 — escalate_overdue

- Actor: System Worker
- Source screen: Task Work Queue - Escalate overdue task
- API/worker: `worker:task.scan_overdue`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: escalation and notification created
- Audit event: `task_work_queue.escalate_overdue`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: task highlighted overdue
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-064`
