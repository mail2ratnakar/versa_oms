# Notifications and Communication Threat Model

Domain id: `notifications`

## Assets
- templates
- recipient lists
- message batches
- provider responses
- delivery logs
- consent/opt-out

## Trust Boundaries
- staff notification UI
- notification worker
- provider API
- webhook callbacks

## Key Threats

### THR-NOTIF-001 — Bulk notification sent to wrong recipient list

- Category: `information_disclosure`
- Risk: **high**
- Impact: PII leak and school trust loss.
- Mitigations:
  - `server_resolved_recipients`
  - `bulk_send_approval`
  - `template_review`
  - `recipient_preview_masked`
  - `send_audit`
- Required tests:
  - `browser_recipient_list_ignored`
  - `bulk_send_requires_approval`
  - `notification_audit_created`

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
