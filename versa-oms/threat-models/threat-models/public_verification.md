# Public Verification Threat Model

Domain id: `public_verification`

## Assets
- verification endpoint
- verification code
- certificate status
- minimal public fields

## Trust Boundaries
- public internet to verification API
- verification API to certificate records

## Key Threats

### THR-PUB-001 — Public verification endpoint abused by enumeration or bot traffic

- Category: `denial_of_service`
- Risk: **high**
- Impact: Service degradation and certificate existence probing.
- Mitigations:
  - `rate_limit`
  - `unguessable_codes`
  - `not_found_same_shape`
  - `no_broad_search`
  - `abuse_monitoring`
- Required tests:
  - `public_verify_rate_limit`
  - `public_verify_no_broad_search`
  - `not_found_response_no_existence_leak`

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
