# ADR-011 — Result and Certificate Versioning

## Status

Accepted

## Context

Results and certificates are externally trusted outputs. Overwriting or deleting records creates disputes and trust issues.

## Decision

Published results are never overwritten. Corrections create new versions. Certificates are never hard-deleted; revocation/reissue creates explicit lifecycle history. Public verification reads status, not file existence.

## Options Considered

1. Versioned results and certificate lifecycle.
2. Overwrite published records in place.
3. Delete/recreate certificates.
4. Manual spreadsheet correction outside system.

## Consequences

### Positive

- Strong dispute handling.
- Supports correction transparency.
- Certificate revocation/reissue is auditable.
- Public verification can show revoked/superseded status.

### Negative

- More data records.
- UI must explain versions/corrections.
- Rank recalculation and certificate impact review required.

## Security Impact

Critical. Result publication/correction and certificate revocation/reissue require approval and audit.

## Rollback Impact

Rollback is a new version, withhold, revoke or reissue; not deletion.

## Related Files

- `results_ops module`
- `certificate_ops module`
- `HIGH_RISK_ACTIONS.json`

## LLM Implementation Rule

Before changing implementation related to this ADR, the LLM must read this ADR, the linked control files and the latest completed-vs-pending summary. The LLM must not silently reverse this decision without creating a new ADR that supersedes it.
