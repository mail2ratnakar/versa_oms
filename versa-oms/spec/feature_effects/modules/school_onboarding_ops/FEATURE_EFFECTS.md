# School Onboarding Ops — Feature Effects

Purpose: School verification, approval and activation

## FX-017 — open_case

- Actor: Authorized Staff
- Source screen: School Onboarding Ops - Open onboarding case
- API/worker: `GET /school-onboarding-ops/{id}`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: no mutation; checklist loaded
- Audit event: `school_onboarding_ops.open_case`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: case detail visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-017`

## FX-018 — request_info

- Actor: Authorized Staff
- Source screen: School Onboarding Ops - Request more information
- API/worker: `POST /{id}/request-info`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: case needs_more_info and school notification queued
- Audit event: `school_onboarding_ops.request_info`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: school sees missing fields
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-018`

## FX-019 — approve_school

- Actor: Authorized Staff
- Source screen: School Onboarding Ops - Approve school
- API/worker: `POST /{id}/approve`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: case approved and school approved
- Audit event: `school_onboarding_ops.approve_school`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: activation task visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-019`

## FX-020 — activate_school

- Actor: Authorized Staff
- Source screen: School Onboarding Ops - Activate school
- API/worker: `POST /{id}/activate`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: school active and portal enabled
- Audit event: `school_onboarding_ops.activate_school`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: school can login/upload roster
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-020`
