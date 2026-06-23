# Notification Ops Module Runbook

## Purpose

Build the Notification Ops module after Certificate Ops because it becomes the shared communication layer for publication, certificate, courier, material, finance, support and security events.

## Required order

1. Confirm `staff_users` exists.
2. Confirm `roles_permissions` exists.
3. Confirm business modules can emit trusted events.
4. Create `notification_templates`.
5. Create `notification_triggers`.
6. Create `notification_batches`.
7. Create `notification_recipients`.
8. Create `notification_messages`.
9. Create `notification_delivery_attempts`.
10. Create `notification_preferences`.
11. Create `notification_events`.
12. Configure template variable whitelist.
13. Configure recipient server-side resolver.
14. Configure event trigger ingestion.
15. Configure bulk announcement dry-run and approval.
16. Configure provider abstraction and webhook signature validation.
17. Configure retry/rate-limit policy.
18. Configure consent/unsubscribe policy.
19. Implement APIs from `messages.json`.
20. Implement screens from `screens.json`.
21. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Browser-submitted recipient list is trusted.
- Bulk send can happen without dry-run.
- Critical notification can send without approval.
- Same user can create and final approve critical bulk batch.
- Template variables are not schema-whitelisted.
- Provider webhook does not validate signature.
- Provider payload is visible to unauthorized roles.
- Unsubscribed recipient receives non-critical marketing/service message.
- Retry attempts are unlimited.
- Hard delete is enabled.
- More than two repair attempts fail.

## Change continuity

All future Notification Ops changes must use:

- `feature_request_template.json`
- `bug_fix_template.json`
- `change_control.json`
- `versioning_policy.json`
