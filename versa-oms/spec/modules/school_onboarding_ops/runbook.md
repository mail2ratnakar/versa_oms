# School Onboarding Ops Module Runbook

## Purpose

Build the School Onboarding Ops module after School CRM because converted leads must become verified, approved and activated school records before student/payment/exam operations begin.

## Required order

1. Confirm `school_crm` module exists.
2. Confirm `staff_users` and `roles_permissions` exist.
3. Confirm base `schools` and `school_users` collections exist or are planned from the business module.
4. Create onboarding collections from `schema.json`.
5. Configure staff-only permissions from `permissions.json`.
6. Deny public and school-role staff API access.
7. Implement duplicate check before approval.
8. Implement coordinator email verification.
9. Implement optional/high-risk document review.
10. Implement school approval and school record creation/update.
11. Implement school portal activation and school_user mapping.
12. Implement block/suspend/release status controls.
13. Implement SLA tracking and escalation.
14. Implement APIs from `messages.json`.
15. Implement screens from `screens.json`.
16. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if public role can read onboarding records, school user can approve/edit/block own onboarding case through staff APIs, approval can happen without duplicate clearance or coordinator verification, activation can happen without approved case or school_user mapping, documents are public, blocking/suspension does not affect downstream gates, or hard delete is enabled.

## Change continuity

All future changes must use `feature_request_template.json`, `bug_fix_template.json`, `change_control.json`, and `versioning_policy.json`.
