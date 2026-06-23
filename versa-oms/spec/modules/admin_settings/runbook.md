# Admin Settings Module Runbook

## Purpose

Build Admin Settings after Reports & Exports because it becomes the controlled configuration registry for all prior modules.

## Required order

1. Confirm `staff_users` exists.
2. Confirm `roles_permissions` exists.
3. Confirm all consuming modules use server-side active-setting resolution.
4. Create `setting_groups`.
5. Create `setting_definitions`.
6. Create `setting_versions`.
7. Create `setting_change_requests`.
8. Create `setting_activation_events`.
9. Create `admin_setting_events`.
10. Configure criticality/classification rules.
11. Configure approval and maker-checker.
12. Configure activation and rollback.
13. Configure provider secret references only.
14. Configure public verification, ranking, pricing, material, courier and notification settings.
15. Implement APIs from `messages.json`.
16. Implement screens from `screens.json`.
17. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Raw provider secrets are stored in module tables.
- Critical settings can activate without approval.
- Requester can approve own critical setting.
- Production setting changes bypass security review.
- Previous active version is not retained.
- Rollback is not possible.
- Business modules resolve settings from browser/client context.
- Hard-delete exceptions are not Super Admin plus security reviewed.
- Audit events can be deleted.
- More than two repair attempts fail.

## Change continuity

All future Admin Settings changes must use:

- `feature_request_template.json`
- `bug_fix_template.json`
- `change_control.json`
- `versioning_policy.json`
