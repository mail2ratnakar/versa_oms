# Exam Slot Ops — Feature Effects

Purpose: Exam slot creation, assignment and confirmation

## FX-029 — create_slot

- Actor: Authorized Staff
- Source screen: Exam Slot Ops - Create exam slot
- API/worker: `POST /exam-slot-ops/slots`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: slot created with capacity/timezone
- Audit event: `exam_slot_ops.create_slot`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: slot visible in schedule
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-029`

## FX-030 — assign_school

- Actor: Authorized Staff
- Source screen: Exam Slot Ops - Assign school to slot
- API/worker: `POST /slots/{id}/assign-school`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: assignment created capacity reduced
- Audit event: `exam_slot_ops.assign_school`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: school sees assigned slot
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-030`

## FX-031 — confirm_slot

- Actor: School Coordinator
- Source screen: Exam Slot Ops - School confirms slot
- API/worker: `POST /school/exam-slots/{id}/confirm`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: assignment confirmed
- Audit event: `exam_slot_ops.confirm_slot`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: staff and school see confirmation
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-031`

## FX-032 — reschedule_slot

- Actor: Authorized Staff
- Source screen: Exam Slot Ops - Reschedule slot
- API/worker: `POST /slots/{id}/reschedule`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: slot version/approval created and schools notified
- Audit event: `exam_slot_ops.reschedule_slot`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: new slot visible after approval
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-032`
