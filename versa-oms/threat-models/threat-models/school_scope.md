# School Scope and Multi-Tenant Isolation Threat Model

Domain id: `school_scope`

## Assets
- school records
- student rosters
- school payments
- school results
- school certificates
- support tickets

## Trust Boundaries
- school browser to API
- school route to database
- staff scoped access to school records

## Key Threats

### THR-SCOPE-001 — School user accesses another school's roster using browser-submitted school_id

- Category: `information_disclosure`
- Risk: **critical**
- Impact: Cross-school student PII leak.
- Mitigations:
  - `server_resolved_school_id`
  - `own_school_scope_guard`
  - `deny_by_default`
  - `field_masking`
  - `cross_school_tests`
- Required tests:
  - `cross_school_roster_access_blocked`
  - `browser_school_id_ignored`
  - `school_scope_guard_required`

### THR-SCOPE-002 — School changes locked roster or candidate mapping

- Category: `tampering`
- Risk: **high**
- Impact: Exam integrity and material/result mismatch.
- Mitigations:
  - `roster_lock_state`
  - `post_lock_correction_workflow`
  - `reason_required`
  - `audit_roster_changes`
  - `candidate_id_never_reused`
- Required tests:
  - `post_lock_edit_blocked`
  - `candidate_id_reuse_blocked`
  - `correction_requires_reason`

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
