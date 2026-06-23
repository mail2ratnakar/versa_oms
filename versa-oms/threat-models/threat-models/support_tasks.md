# Support Tickets and Task Work Queue Threat Model

Domain id: `support_tasks`

## Assets
- tickets
- internal notes
- attachments
- linked records
- tasks
- SLA events
- escalations

## Trust Boundaries
- school support UI
- staff support UI
- source module safe-summary service
- task automation

## Key Threats

### THR-SUP-001 — Support agent sees raw OMR, answer key or payment payload through linked ticket context

- Category: `information_disclosure`
- Risk: **high**
- Impact: Sensitive operational data leakage.
- Mitigations:
  - `safe_summary_service`
  - `source_module_permission_recheck`
  - `field_masking`
  - `restricted_attachment_access`
  - `audit_reveal`
- Required tests:
  - `support_sees_safe_summary_only`
  - `support_raw_omr_blocked`
  - `support_answer_key_blocked`
  - `support_provider_payload_blocked`

## Required Controls

- Server-side authorization.
- Field masking where sensitive.
- Audit events for state changes.
- Reason capture for high-risk actions.
- No hard delete.

## Implementation Stop Conditions

- Browser-trusted scope/status/approval detected.
- Sensitive file URL exposed.
- Missing audit event.
- Missing security test.
- Missing rollback handling for high-risk action.
