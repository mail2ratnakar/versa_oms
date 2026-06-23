# Finance Ops — Feature Effects

Purpose: Invoices, payments and finance gate

## FX-025 — generate_invoice

- Actor: Authorized Staff
- Source screen: Finance Ops - Generate invoice
- API/worker: `POST /finance-ops/invoices`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: server-calculated invoice created
- Audit event: `finance_ops.generate_invoice`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: invoice visible to school
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-025`

## FX-026 — create_payment_link

- Actor: Authorized Staff
- Source screen: Finance Ops - Create payment link
- API/worker: `POST /invoices/{id}/payment-link`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: payment link created and notification queued
- Audit event: `finance_ops.create_payment_link`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: pay button visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-026`

## FX-027 — confirm_manual_payment

- Actor: Authorized Staff
- Source screen: Finance Ops - Confirm manual payment
- API/worker: `POST /invoices/{id}/confirm-manual-payment`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: payment marked paid after approval and finance gate opens
- Audit event: `finance_ops.confirm_manual_payment`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: downstream gates unlock
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-027`

## FX-028 — refund_payment

- Actor: Authorized Staff
- Source screen: Finance Ops - Refund/reverse payment
- API/worker: `POST /payments/{id}/refund`
- Preconditions: auth, role/scope, lifecycle state, feature flag if configured, approval if high-risk
- Validation: input schema, server-side role/scope, idempotency for writes, lifecycle guard
- Server effect: refund request and payment state version created
- Audit event: `finance_ops.refund_payment`
- Downstream effect: dashboard/task/job/notification/portal state updates where applicable
- UI result: refund state visible
- Error states: 401 auth, 403 access denied, 409 idempotency conflict, 422 validation/lifecycle, 500 safe server error
- Guardrails: no browser-trusted role/scope/school_id/status/payment/approval; no raw private file URL; sensitive fields masked
- Journey: `JRN-028`
