# Security & Audit Console — Feature Effects

Purpose: Audit, incidents, access review and security monitoring

## FX-073 — view_audit

- Actor: Authorized Staff
- Source screen: Security & Audit Console - View audit timeline
- API/worker: `GET /audit-events`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: restricted audit view loaded
- Audit event: `security_audit_console.view_audit`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: timeline visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-073`

## FX-074 — create_incident

- Actor: Authorized Staff
- Source screen: Security & Audit Console - Create security incident
- API/worker: `POST /incidents`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: incident and tasks created
- Audit event: `security_audit_console.create_incident`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: incident visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-074`

## FX-075 — run_drift_scan

- Actor: System Worker
- Source screen: Security & Audit Console - Run permission drift scan
- API/worker: `worker:security.permission_drift_scan`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: findings/incidents/tasks created
- Audit event: `security_audit_console.run_drift_scan`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: security dashboard updates
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-075`

## FX-076 — verify_audit_hashes

- Actor: System Worker
- Source screen: Security & Audit Console - Verify audit hashes
- API/worker: `worker:security.audit_hash_verify`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: verification result stored; incident on mismatch
- Audit event: `security_audit_console.verify_audit_hashes`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: audit health panel updates
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-076`
