# Security & Audit Console Module Runbook

## Purpose

Build the Security & Audit Console as the final company portal module. It closes the internal control loop by receiving audit events from all modules, monitoring high-risk actions, managing incidents, reviewing access, detecting permission drift, monitoring login/session events and controlling security exports.

## Required order

1. Confirm all business modules exist.
2. Confirm `staff_users` exists.
3. Confirm `roles_permissions` exists.
4. Confirm `admin_settings` exists.
5. Confirm `reports_exports` exists.
6. Confirm `task_work_queue` exists.
7. Create `security_audit_events`.
8. Create `security_incidents`.
9. Create `security_alerts`.
10. Create `staff_login_events`.
11. Create `access_reviews`.
12. Create `permission_drift_findings`.
13. Create `forensics_cases`.
14. Create `security_events`.
15. Configure audit event ingestion.
16. Configure raw audit access restrictions.
17. Configure incident and alert workflows.
18. Configure login monitoring.
19. Configure permission drift and access review.
20. Configure sensitive export review.
21. Configure forensics case workflow.
22. Implement APIs from `messages.json`.
23. Implement screens from `screens.json`.
24. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Audit events can be edited or hard deleted.
- Audit events do not have event hash.
- Raw audit can be searched without reason.
- Non-security roles can see raw audit or forensics data.
- Browser-submitted incident severity/status is trusted.
- Critical incident does not create task.
- Permission drift cannot be detected.
- Sensitive export bypasses security review.
- Redaction deletes audit event instead of appending a redaction marker.
- Hard delete is enabled.
- More than two repair attempts fail.

## Change continuity

All future Security & Audit Console changes must use:

- `feature_request_template.json`
- `bug_fix_template.json`
- `change_control.json`
- `versioning_policy.json`
