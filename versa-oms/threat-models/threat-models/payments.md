# Payments and Finance Operations Threat Model

Domain id: `payments`

## Assets
- invoices
- payment links
- transactions
- manual confirmations
- refunds
- reversals
- provider payloads

## Trust Boundaries
- browser to finance API
- payment provider webhook to internal API
- finance staff to approval workflow

## Key Threats

### THR-PAY-001 — Browser-submitted amount/payment status accepted

- Category: `tampering`
- Risk: **critical**
- Impact: Unpaid schools may pass finance gate or incorrect invoice amount recorded.
- Mitigations:
  - `server_calculated_amounts`
  - `provider_signature_validation`
  - `manual_payment_dual_approval`
  - `idempotency`
  - `audit_finance_events`
- Required tests:
  - `browser_payment_status_ignored`
  - `manual_confirmation_requires_approval`
  - `payment_amount_server_calculated`

### THR-PAY-002 — Manual payment confirmation cannot be traced

- Category: `repudiation`
- Risk: **critical**
- Impact: Finance disputes and exam gate bypass cannot be investigated.
- Mitigations:
  - `reason_required`
  - `proof_required`
  - `audit_event_required`
  - `maker_checker`
  - `append_only_finance_events`
- Required tests:
  - `manual_payment_requires_reason`
  - `manual_payment_audit_created`
  - `manual_payment_proof_required`

## Required Controls

- Server-side authorization.
- Field masking where sensitive.
- Audit events for state changes.
- Reason capture for high-risk actions.
- No hard delete.
- Maker-checker or dual approval where configured.
- Feature flag or kill-switch where exposure risk exists.

## Implementation Stop Conditions

- Browser-trusted scope/status/approval detected.
- Sensitive file URL exposed.
- Missing audit event.
- Missing security test.
- Missing rollback handling for high-risk action.
