# ADR-003 — RBAC, RLS and Scope Model

## Status

Accepted

## Context

Versa has multiple staff roles and school users. Sensitive data spans students, payments, results, certificates, exam materials and audit records.

## Decision

Use deny-by-default server-side authorization with role, module, action and scope checks. School users are restricted to own-school scope. Staff access is global only for admins/security; other staff use assigned scope.

## Options Considered

1. Central RBAC/RLS matrix with field masking.
2. Simple admin/user role only.
3. Frontend-only route hiding.
4. Database-only RLS without service-level policy.

## Consequences

### Positive

- Prevents cross-school access.
- Supports staff assignment scope.
- Supports high-risk approval separation.
- Allows consistent enforcement across APIs and UI.

### Negative

- Policy implementation is more complex.
- Needs tests for every sensitive route.
- Navigation hiding must not be confused with authorization.

## Security Impact

Critical. Browser role/scope/school_id is never trusted. Server must recheck every route and API.

## Rollback Impact

If a policy bug is detected, disable affected feature flags and restrict access to super admins/security reviewers until fixed.

## Related Files

- `RLS_POLICY_MATRIX.json`
- `FIELD_MASKING_MATRIX.json`
- `HIGH_RISK_ACTIONS.json`
- `SECURITY_TEST_CASES.json`

## LLM Implementation Rule

Before changing implementation related to this ADR, the LLM must read this ADR, the linked control files and the latest completed-vs-pending summary. The LLM must not silently reverse this decision without creating a new ADR that supersedes it.
