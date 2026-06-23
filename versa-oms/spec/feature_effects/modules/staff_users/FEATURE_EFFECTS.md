# Staff Users — Feature Effects

Purpose: Internal staff lifecycle

## FX-005 — invite_staff

- Actor: Authorized Staff
- Source screen: Staff Users - Invite staff user
- API/worker: `POST /staff-users/invitations`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: invitation created and notification queued
- Audit event: `staff_users.invite_staff`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: pending invite visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-005`

## FX-006 — accept_invite

- Actor: Authorized Staff
- Source screen: Staff Users - Accept staff invite
- API/worker: `POST /invite/accept`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: staff activated and invite consumed
- Audit event: `staff_users.accept_invite`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: staff can access allowed routes
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-006`

## FX-007 — disable_staff

- Actor: Authorized Staff
- Source screen: Staff Users - Disable staff user
- API/worker: `POST /staff-users/{id}/disable`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: staff disabled and sessions revoked
- Audit event: `staff_users.disable_staff`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: access blocked
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-007`

## FX-008 — revoke_sessions

- Actor: Authorized Staff
- Source screen: Staff Users - Revoke staff sessions
- API/worker: `POST /staff-users/{id}/revoke-sessions`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: sessions invalidated
- Audit event: `staff_users.revoke_sessions`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: user must login again
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-008`
