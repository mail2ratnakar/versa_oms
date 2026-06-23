# Roles & Permissions — Feature Effects

Purpose: RBAC, scope and approval authority

## FX-009 — request_role_change

- Actor: Authorized Staff
- Source screen: Roles & Permissions - Request role/scope change
- API/worker: `POST /roles-permissions/change-requests`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: approval request created
- Audit event: `roles_permissions.request_role_change`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: appears in approval queue
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-009`

## FX-010 — approve_role_change

- Actor: Authorized Staff
- Source screen: Roles & Permissions - Approve role/scope change
- API/worker: `POST /change-requests/{id}/approve`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: role/scope updated
- Audit event: `roles_permissions.approve_role_change`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: permissions change after refresh
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-010`

## FX-011 — reject_role_change

- Actor: Authorized Staff
- Source screen: Roles & Permissions - Reject role/scope change
- API/worker: `POST /change-requests/{id}/reject`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: request rejected no role mutation
- Audit event: `roles_permissions.reject_role_change`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: rejected state visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-011`

## FX-012 — run_access_review

- Actor: Authorized Staff
- Source screen: Roles & Permissions - Run access review
- API/worker: `POST /access-review/run`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: review snapshot and findings created
- Audit event: `roles_permissions.run_access_review`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: findings/tasks visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-012`
