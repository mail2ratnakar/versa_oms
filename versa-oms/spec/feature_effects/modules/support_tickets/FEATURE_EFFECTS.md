# Support Tickets — Feature Effects

Purpose: Support cases, internal notes and linked context

## FX-057 — create_ticket

- Actor: School Coordinator
- Source screen: Support Tickets - Create school ticket
- API/worker: `POST /school/support-tickets`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: ticket created, SLA timer and task started
- Audit event: `support_tickets.create_ticket`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: ticket visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-057`

## FX-058 — add_internal_note

- Actor: Authorized Staff
- Source screen: Support Tickets - Add internal note
- API/worker: `POST /support-tickets/{id}/internal-notes`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: internal note created
- Audit event: `support_tickets.add_internal_note`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: staff-only note visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-058`

## FX-059 — link_safe_context

- Actor: Authorized Staff
- Source screen: Support Tickets - Link safe source context
- API/worker: `POST /support-tickets/{id}/link`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: safe summary linked after permission check
- Audit event: `support_tickets.link_safe_context`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: context card visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-059`

## FX-060 — resolve_ticket

- Actor: Authorized Staff
- Source screen: Support Tickets - Resolve ticket
- API/worker: `POST /support-tickets/{id}/resolve`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: ticket resolved and school notified
- Audit event: `support_tickets.resolve_ticket`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: ticket closed
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-060`
