# ADR-002 — Authentication Model

## Status

Accepted

## Context

The platform handles student data, payments, exam materials, results and certificates. Staff self-registration or weak public access would create high risk.

## Decision

Use invite-only staff accounts, school coordinator accounts scoped to their own school, no public self-registration for staff, public access only for explicit verification routes, and future step-up authentication for high-risk actions.

## Options Considered

1. Invite-only staff with school-auth separation.
2. Open staff self-registration.
3. School-only accounts with staff managed externally.
4. OAuth-only with no internal invite control.

## Consequences

### Positive

- Reduces unauthorized staff access.
- Supports admin-controlled staff lifecycle.
- Keeps school users isolated from staff users.
- Works with future Google SSO/OTP/step-up auth.

### Negative

- Admin effort required to invite and disable staff.
- Need robust invite-token expiry and session revocation.
- School coordinator login must be carefully scoped.

## Security Impact

Critical. Disabled users must be blocked, sessions revocable, invite tokens hashed/expiring, and staff role/scope resolved server-side.

## Rollback Impact

Auth changes are high-risk. Rollback should disable new auth pathway and preserve existing sessions only where safe.

## Related Files

- `RLS_POLICY_MATRIX.json`
- `staff_users module`
- `security_audit_console module`
- `THREAT_MODEL_AUTH.md`

## LLM Implementation Rule

Before changing implementation related to this ADR, the LLM must read this ADR, the linked control files and the latest completed-vs-pending summary. The LLM must not silently reverse this decision without creating a new ADR that supersedes it.
