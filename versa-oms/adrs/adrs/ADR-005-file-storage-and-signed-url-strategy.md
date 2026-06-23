# ADR-005 — File Storage and Signed URL Strategy

## Status

Accepted

## Context

Exam materials, certificates, OMR/import files, exports and support attachments are sensitive. URL leaks could cause serious exam or privacy breaches.

## Decision

Use private storage for all sensitive files and short-lived signed URLs generated only after server-side permission checks. Never expose raw private file paths or public material/export/certificate URLs.

## Options Considered

1. Private storage with signed URLs and download audit.
2. Public object URLs.
3. Email attachments for all sensitive files.
4. Database blobs for all files.

## Consequences

### Positive

- Limits file exposure.
- Supports download audit.
- Supports revocation/expiry.
- Works for materials, exports and certificates.

### Negative

- Requires storage provider integration.
- Signed URL logic must be tested.
- Revocation semantics depend on storage provider.

## Security Impact

Critical for exam materials and exports. Signed URLs must be short-lived, not logged, and school/staff scoped.

## Rollback Impact

Disable download flags, revoke/expire files, invalidate signed URLs and preserve metadata/audit.

## Related Files

- `SIGNED_URL_RESPONSE_CONVENTION.md`
- `exam_material_ops module`
- `reports_exports module`
- `certificate_ops module`

## LLM Implementation Rule

Before changing implementation related to this ADR, the LLM must read this ADR, the linked control files and the latest completed-vs-pending summary. The LLM must not silently reverse this decision without creating a new ADR that supersedes it.
