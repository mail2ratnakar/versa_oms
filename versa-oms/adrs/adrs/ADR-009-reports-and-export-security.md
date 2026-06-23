# ADR-009 — Reports and Export Security

## Status

Accepted

## Context

Exports can create large-scale data leakage. Student/parent/payment/result/audit data needs strong controls.

## Decision

Reports and exports use source-module-safe views, role/scope filters, field masking, approval for sensitive exports, private files, signed URLs, download audit and expiry.

## Options Considered

1. Controlled reports/export service.
2. Direct database export for staff.
3. Client-side CSV generation.
4. Unrestricted admin exports.

## Consequences

### Positive

- Reduces data leakage risk.
- Supports auditability.
- Allows sensitive export approvals.
- Keeps exports consistent with privacy rules.

### Negative

- More implementation work.
- Reports may need source-module views.
- Some staff may need approval for exports.

## Security Impact

Critical. Exports must never include answer keys, raw OMR, provider payloads or private file URLs by default.

## Rollback Impact

Expire generated files, disable sensitive exports flag and preserve export metadata/audit.

## Related Files

- `reports_exports module`
- `FIELD_MASKING_MATRIX.json`
- `PUBLIC_PRIVATE_ROUTE_ALLOWLIST.json`

## LLM Implementation Rule

Before changing implementation related to this ADR, the LLM must read this ADR, the linked control files and the latest completed-vs-pending summary. The LLM must not silently reverse this decision without creating a new ADR that supersedes it.
