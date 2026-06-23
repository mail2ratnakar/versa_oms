# Certificates and Verification Threat Model

Domain id: `certificates`

## Assets
- certificate templates
- certificate files
- verification codes
- QR codes
- reissue/revocation history

## Trust Boundaries
- staff certificate generation
- school download
- public verification route
- private storage

## Key Threats

### THR-CERT-001 — Fake certificate passes public verification

- Category: `spoofing`
- Risk: **critical**
- Impact: Loss of trust in certification.
- Mitigations:
  - `unguessable_verification_codes`
  - `public_minimal_lookup`
  - `revocation_status`
  - `certificate_number_uniqueness`
  - `rate_limit`
- Required tests:
  - `fake_verification_code_returns_not_found`
  - `revoked_certificate_shows_revoked`
  - `verification_rate_limit`

### THR-CERT-002 — Public verification reveals excessive student data

- Category: `information_disclosure`
- Risk: **high**
- Impact: Privacy breach.
- Mitigations:
  - `minimal_public_fields`
  - `public_allow_list`
  - `no_parent_contact`
  - `no_payment_status`
  - `no_raw_score_by_default`
- Required tests:
  - `public_verification_minimal_fields`
  - `public_verification_no_parent_contact`
  - `public_verification_no_payment_status`

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
