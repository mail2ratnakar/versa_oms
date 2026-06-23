# Security Audit Console Threat Model

Domain id: `security_audit`

## Assets
- audit events
- event hashes
- security incidents
- login events
- forensics cases
- access reviews

## Trust Boundaries
- all modules to audit writer
- security staff to raw audit
- internal event API

## Key Threats

### THR-AUD-001 — Audit event modified or deleted

- Category: `tampering`
- Risk: **critical**
- Impact: Loss of forensic integrity.
- Mitigations:
  - `append_only_audit`
  - `event_hash`
  - `no_hard_delete`
  - `correction_event_only`
  - `restricted_raw_audit_access`
- Required tests:
  - `audit_append_only`
  - `audit_delete_blocked`
  - `audit_event_hash_required`
  - `audit_correction_event_required`

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
