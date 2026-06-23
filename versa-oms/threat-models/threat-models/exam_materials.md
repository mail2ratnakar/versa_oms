# Exam Materials and Secure File Release Threat Model

Domain id: `exam_materials`

## Assets
- question papers
- answer sheets
- material packages
- signed URLs
- download logs
- release approvals

## Trust Boundaries
- staff release action
- school download
- private storage
- signed URL generation

## Key Threats

### THR-MAT-001 — Question paper URL exposed as public or long-lived link

- Category: `information_disclosure`
- Risk: **critical**
- Impact: Exam paper leak.
- Mitigations:
  - `private_storage_only`
  - `short_lived_signed_urls`
  - `download_audit`
  - `release_timer`
  - `revocation`
  - `no_raw_file_urls`
- Required tests:
  - `material_file_public_url_blocked`
  - `signed_url_expires`
  - `download_audited`
  - `revoked_material_download_blocked`

### THR-MAT-002 — Material version replaced without approval

- Category: `tampering`
- Risk: **critical**
- Impact: Wrong paper or answer sheet released.
- Mitigations:
  - `versioned_material_packages`
  - `dual_approval_for_release_replace_revoke`
  - `maker_checker`
  - `audit_release_events`
- Required tests:
  - `material_release_requires_dual_approval`
  - `material_replacement_creates_new_version`
  - `same_user_cannot_approve_own_release`

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
