# ADR-007 — Audit Event Model

## Status

Accepted

## Context

The platform must support exam integrity, dispute handling, regulatory-style review and internal accountability.

## Decision

Use append-only audit events for state changes, high-risk actions, approvals, downloads, exports, role/scope changes, login events and security incidents. Security audit records require event hashes and correction events instead of mutation.

## Options Considered

1. Append-only audit event model.
2. Mutable activity logs.
3. Database timestamps only.
4. Third-party logging only.

## Consequences

### Positive

- Supports forensic review.
- Supports dispute resolution.
- Improves accountability.
- Works across modules and high-risk actions.

### Negative

- More storage usage.
- Requires masking/restricted access for audit details.
- Audit writer must be reliable.

## Security Impact

Critical. Raw audit access must be restricted; audit records must not leak sensitive payloads to normal users.

## Rollback Impact

Audit events are not rolled back. Corrections are appended as new events.

## Related Files

- `security_audit_console module`
- `AUDIT_METADATA_CONVENTION.md`
- `THREAT_REGISTER.json`

## LLM Implementation Rule

Before changing implementation related to this ADR, the LLM must read this ADR, the linked control files and the latest completed-vs-pending summary. The LLM must not silently reverse this decision without creating a new ADR that supersedes it.
