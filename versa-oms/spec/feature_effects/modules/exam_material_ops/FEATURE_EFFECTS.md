# Exam Material Ops — Feature Effects

Purpose: Secure material generation, release, download and revocation

## FX-033 — generate_package

- Actor: Authorized Staff
- Source screen: Exam Material Ops - Generate material package
- API/worker: `POST /exam-material-ops/packages`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: package draft and worker job created
- Audit event: `exam_material_ops.generate_package`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: package generating/generated
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-033`

## FX-034 — approve_release

- Actor: Authorized Staff
- Source screen: Exam Material Ops - Approve material release
- API/worker: `POST /packages/{id}/approve-release`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: release approval and window scheduled
- Audit event: `exam_material_ops.approve_release`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: package approved_for_release
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-034`

## FX-035 — download_material

- Actor: School Coordinator
- Source screen: Exam Material Ops - School downloads material
- API/worker: `POST /school/materials/{id}/download-url`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: short signed URL and download audit created
- Audit event: `exam_material_ops.download_material`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: download starts
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-035`

## FX-036 — revoke_replace

- Actor: Authorized Staff
- Source screen: Exam Material Ops - Revoke or replace material
- API/worker: `POST /packages/{id}/revoke`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: package revoked and replacement version maybe created
- Audit event: `exam_material_ops.revoke_replace`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: old downloads blocked
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-036`
