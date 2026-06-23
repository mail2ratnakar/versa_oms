# Certificates Module Runbook

## Purpose

Build the Certificates module after Results because certificates require published result rows and student/school identity snapshots.

## Required order

1. Confirm Results module exists and `results.status == published` is available.
2. Create `certificate_templates` collection.
3. Create `certificates` collection.
4. Create `certificate_events` append-only collection.
5. Configure private file handling for certificate PDFs and QR files.
6. Configure permissions:
   - school_coordinator: own published certificates only
   - certificate_admin: full certificate workflow
   - public: verification route only with minimal fields
7. Implement server-side PDF generation and QR/verification code generation.
8. Implement APIs:
   - `POST /api/admin/certificate-templates`
   - `POST /api/admin/certificates/generate`
   - `POST /api/admin/certificates/{certificate_id}/publish`
   - `GET /api/certificates/{certificate_id}/download`
   - `GET /api/certificates/verify/{verification_code}`
   - `POST /api/admin/certificates/{certificate_id}/revoke`
9. Implement screens:
   - `/staff/certificate-templates`
   - `/staff/certificates`
   - `/school/certificates`
   - `/verify/certificate/[verification_code]`
10. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Certificate can generate before result publication.
- Certificate PDF files are public.
- School can download another school's certificate.
- Public verification exposes sensitive fields.
- Verification code is guessable or not unique.
- Revoked certificates verify as valid.
- Issued certificate snapshots can be silently changed.
- More than two repair attempts fail.

## Change continuity

All future certificate changes must use:

- `feature_request_template.json` for new features.
- `bug_fix_template.json` for bugs.
- `change_control.json` for review and migration gates.
- `versioning_policy.json` for semantic versioning.
