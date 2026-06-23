# ADR-010 — Public Verification Strategy

## Status

Accepted

## Context

Certificate verification must prove authenticity without becoming a public student lookup service.

## Decision

Public verification is exact-code only, rate-limited, minimal-field, no broad search, no raw score/payment/contact exposure and disabled by default in production until approved.

## Options Considered

1. Exact-code minimal public verification.
2. Searchable public certificate directory.
3. QR directly opens downloadable certificate.
4. No public verification.

## Consequences

### Positive

- Supports authenticity checks.
- Limits privacy exposure.
- Supports revoked/reissued status.
- Can be enabled after approval.

### Negative

- Users need verification code.
- Public support may need explanations for not-found/revoked.
- Rate limiting and abuse monitoring required.

## Security Impact

High. Prevent enumeration and detectability leaks through response shape.

## Rollback Impact

Disable public verification flag and keep school/private certificate access intact.

## Related Files

- `certificate_ops module`
- `PUBLIC_PRIVATE_ROUTE_ALLOWLIST.json`
- `public_verification threat model`

## LLM Implementation Rule

Before changing implementation related to this ADR, the LLM must read this ADR, the linked control files and the latest completed-vs-pending summary. The LLM must not silently reverse this decision without creating a new ADR that supersedes it.
