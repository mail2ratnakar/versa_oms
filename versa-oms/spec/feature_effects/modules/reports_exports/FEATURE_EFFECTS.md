# Reports & Exports — Feature Effects

Purpose: Reports, sensitive exports and download controls

## FX-065 — run_safe_report

- Actor: Authorized Staff
- Source screen: Reports & Exports - Run safe report
- API/worker: `POST /reports/{id}/run`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: safe report snapshot generated
- Audit event: `reports_exports.run_safe_report`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: report visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-065`

## FX-066 — request_sensitive_export

- Actor: Authorized Staff
- Source screen: Reports & Exports - Request sensitive export
- API/worker: `POST /exports`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: export request and approval task created
- Audit event: `reports_exports.request_sensitive_export`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: export pending approval
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-066`

## FX-067 — generate_export

- Actor: System Worker
- Source screen: Reports & Exports - Generate approved export
- API/worker: `worker:export.generate`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: private export file created
- Audit event: `reports_exports.generate_export`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: export ready
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-067`

## FX-068 — download_export

- Actor: Authorized Staff
- Source screen: Reports & Exports - Download export
- API/worker: `POST /exports/{id}/download-url`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: signed URL and download audit created
- Audit event: `reports_exports.download_export`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: download starts
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-068`
