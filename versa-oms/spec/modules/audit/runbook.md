# Audit Module Runbook

## Purpose

Build the Audit module as the final cross-cutting control layer after all business modules have declared their audit requirements.

## Required order

1. Confirm all business modules are generated:
   - schools
   - students
   - payments
   - exam_slots
   - exam_materials
   - courier
   - omr_imports
   - results
   - certificates
   - notifications
2. Create `audit_events` append-only collection.
3. Create `audit_cases` collection.
4. Create `security_incidents` collection.
5. Create `access_reviews` collection.
6. Create `reconciliation_runs` collection.
7. Create `audit_exports` collection.
8. Configure deny-by-default permissions.
9. Explicitly deny raw audit access to public and school roles.
10. Implement audit event ingestion:
    - `POST /api/internal/audit/events`
11. Implement review/incident/reconciliation/export APIs:
    - `POST /api/admin/audit/cases`
    - `POST /api/admin/audit/incidents`
    - `POST /api/admin/audit/access-reviews/run`
    - `POST /api/admin/audit/reconciliation/run`
    - `POST /api/admin/audit/exports`
    - `POST /api/internal/audit/tamper-check`
12. Implement screens:
    - `/staff/audit/events`
    - `/staff/audit/cases`
    - `/staff/audit/incidents`
    - `/staff/audit/access-reviews`
    - `/staff/audit/reconciliation`
    - `/staff/audit/exports`
13. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- audit_events are editable or deletable.
- Public or school roles can read raw audit collections.
- Hard delete is enabled on audit records.
- High-risk events can be created without reason.
- Audit exports can be generated without approval.
- Tamper hash chain is missing.
- Security incidents can close without root cause/remediation.
- More than two repair attempts fail.

## Change continuity

All future audit changes must use:

- `feature_request_template.json` for new features.
- `bug_fix_template.json` for bugs.
- `change_control.json` for review and migration gates.
- `versioning_policy.json` for semantic versioning.
