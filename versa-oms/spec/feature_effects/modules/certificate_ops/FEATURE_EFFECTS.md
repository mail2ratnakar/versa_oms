# Certificate Ops — Feature Effects

Purpose: Certificate generation, publication, verification and reissue

## FX-049 — generate_certificates

- Actor: Authorized Staff
- Source screen: Certificate Ops - Generate certificates
- API/worker: `POST /certificate-ops/generate`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: certificate jobs queued
- Audit event: `certificate_ops.generate_certificates`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: generation status visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-049`

## FX-050 — publish_certificates

- Actor: Authorized Staff
- Source screen: Certificate Ops - Publish certificates
- API/worker: `POST /batches/{id}/publish`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: school download and verification records enabled
- Audit event: `certificate_ops.publish_certificates`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: certificates visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-050`

## FX-051 — revoke_certificate

- Actor: Authorized Staff
- Source screen: Certificate Ops - Revoke certificate
- API/worker: `POST /certificates/{id}/revoke`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: certificate revoked
- Audit event: `certificate_ops.revoke_certificate`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: verification shows revoked
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-051`

## FX-052 — reissue_certificate

- Actor: Authorized Staff
- Source screen: Certificate Ops - Reissue certificate
- API/worker: `POST /certificates/{id}/reissue`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: new certificate version created
- Audit event: `certificate_ops.reissue_certificate`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: new certificate visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-052`
