# Authentication and Session Management Threat Model

Domain id: `auth`

## Assets
- staff sessions
- school sessions
- invite tokens
- magic links
- session cookies
- internal API secrets

## Trust Boundaries
- browser to app
- app to auth/session store
- internal API to app

## Key Threats

### THR-AUTH-001 — Stolen staff session used to access internal console

- Category: `spoofing`
- Risk: **critical**
- Impact: Unauthorized access to school, student, payment, result or material controls.
- Mitigations:
  - `short_session_expiry`
  - `secure_cookies`
  - `session_revocation`
  - `failed_login_monitoring`
  - `step_up_auth_later`
  - `audit_staff_login_events`
- Required tests:
  - `disabled_staff_cannot_login`
  - `session_revocation_blocks_access`
  - `staff_routes_require_auth`

### THR-AUTH-002 — Staff changes own role or scope

- Category: `elevation_of_privilege`
- Risk: **critical**
- Impact: Privilege escalation to admin or high-risk approval capability.
- Mitigations:
  - `server_side_rbac`
  - `last_super_admin_protection`
  - `maker_checker_for_role_changes`
  - `self_role_change_block`
  - `audit_permission_events`
- Required tests:
  - `staff_cannot_change_own_role`
  - `last_super_admin_protected`
  - `role_change_requires_approval`

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
