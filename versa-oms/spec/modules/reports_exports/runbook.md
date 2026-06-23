# Reports & Exports Module Runbook

## Purpose

Build the Reports & Exports module after Task Work Queue because report approvals, failed exports and sensitive export reviews may create tasks.

## Required order

1. Confirm `staff_users` exists.
2. Confirm `roles_permissions` exists.
3. Confirm all source modules expose safe report views.
4. Confirm `task_work_queue` exists.
5. Create `report_definitions`.
6. Create `export_requests`.
7. Create `report_snapshots`.
8. Create `export_files`.
9. Create `export_download_events`.
10. Create `report_events`.
11. Configure report catalog.
12. Configure report classifications.
13. Configure role/scope filters.
14. Configure sensitive export approval.
15. Configure masking/watermark rules.
16. Configure CSV/XLSX generation.
17. Configure signed URL downloads.
18. Configure retention/expiry.
19. Implement APIs from `messages.json`.
20. Implement screens from `screens.json`.
21. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Export trusts browser-submitted role/scope/filter/school_id.
- Sensitive export can generate without approval.
- Requester can approve own sensitive export.
- Source module permissions are not rechecked.
- Student PII or payment-sensitive data is unmasked by default.
- Answer keys, raw OMR or provider payloads can export by default.
- CSV injection protection is missing.
- Export files are public or long-lived without retention.
- Download is not audited.
- Hard delete is enabled.
- More than two repair attempts fail.

## Change continuity

All future Reports & Exports changes must use:

- `feature_request_template.json`
- `bug_fix_template.json`
- `change_control.json`
- `versioning_policy.json`
