# Reports, Exports and Sensitive Downloads Threat Model

Domain id: `reports_exports`

## Assets
- report definitions
- export requests
- export files
- download events
- snapshot hashes
- watermarks

## Trust Boundaries
- staff export request
- approval flow
- private storage
- signed URL download

## Key Threats

### THR-EXP-001 — Sensitive export leaks student PII or answer keys

- Category: `information_disclosure`
- Risk: **critical**
- Impact: Large-scale privacy/security breach.
- Mitigations:
  - `export_reason_required`
  - `masking_default`
  - `sensitive_export_approval`
  - `csv_injection_protection`
  - `signed_url_download`
  - `export_expiry`
- Required tests:
  - `sensitive_export_requires_approval`
  - `export_masks_pii_default`
  - `export_excludes_answer_keys_default`
  - `export_download_audited`

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
