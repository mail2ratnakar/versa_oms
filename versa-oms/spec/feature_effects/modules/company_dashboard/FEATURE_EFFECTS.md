# Company Dashboard — Feature Effects

Purpose: Operations command center

## FX-001 — view_dashboard

- Actor: Authorized Staff
- Source screen: Company Dashboard - View operations dashboard
- API/worker: `GET /api/staff/company-dashboard`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: safe summary widgets update
- Audit event: `company_dashboard.view_dashboard`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: dashboard loads counts and alerts
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-001`

## FX-002 — drilldown_widget

- Actor: Authorized Staff
- Source screen: Company Dashboard - Open widget drilldown
- API/worker: `GET source module route`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: source module permission rechecked
- Audit event: `company_dashboard.drilldown_widget`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: module list/detail opens
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-002`

## FX-003 — dismiss_alert

- Actor: Authorized Staff
- Source screen: Company Dashboard - Dismiss dashboard alert
- API/worker: `POST /alerts/{id}/dismiss`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: user alert dismissal created
- Audit event: `company_dashboard.dismiss_alert`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: alert hidden for actor only
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-003`

## FX-004 — acknowledge_incident_alert

- Actor: Authorized Staff
- Source screen: Company Dashboard - Acknowledge critical alert
- API/worker: `POST /alerts/{id}/acknowledge`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: task/incident acknowledgement recorded
- Audit event: `company_dashboard.acknowledge_incident_alert`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: alert shows acknowledged
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-004`
