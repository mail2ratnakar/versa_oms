# Admin Settings — Feature Effects

Purpose: Feature flags, policies and admin configuration

## FX-069 — update_feature_flag

- Actor: Authorized Staff
- Source screen: Admin Settings - Update feature flag
- API/worker: `POST /feature-flags/{key}`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: flag change request or update created
- Audit event: `admin_settings.update_feature_flag`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: flag state visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-069`

## FX-070 — update_policy

- Actor: Authorized Staff
- Source screen: Admin Settings - Update policy threshold
- API/worker: `POST /policies/{id}`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: new policy version created
- Audit event: `admin_settings.update_policy`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: version history visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-070`

## FX-071 — configure_provider

- Actor: Authorized Staff
- Source screen: Admin Settings - Configure provider
- API/worker: `POST /providers/{id}`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: provider config updated without exposing secret
- Audit event: `admin_settings.configure_provider`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: health check visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-071`

## FX-072 — run_settings_review

- Actor: Authorized Staff
- Source screen: Admin Settings - Run settings review
- API/worker: `POST /review/run`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: review findings and tasks created
- Audit event: `admin_settings.run_settings_review`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: findings visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-072`
