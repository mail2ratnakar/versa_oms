# Task Work Queue Module Runbook

## Purpose

Build the Task Work Queue module after Support Tickets because it becomes the shared internal queue for approvals, SLA breaches, exceptions, follow-ups and operational work across all modules.

## Required order

1. Confirm `staff_users` exists.
2. Confirm `roles_permissions` exists.
3. Confirm `notification_ops` exists.
4. Confirm business modules can emit trusted task events.
5. Create `task_queues`.
6. Create `work_tasks`.
7. Create `task_assignments`.
8. Create `task_dependencies`.
9. Create `task_comments`.
10. Create `task_sla_events`.
11. Create `task_events`.
12. Configure queues and owner roles.
13. Configure assignment and scope rules.
14. Configure SLA rules.
15. Configure event-to-task rules.
16. Configure approval task maker-checker.
17. Configure dashboard feed.
18. Implement APIs from `messages.json`.
19. Implement screens from `screens.json`.
20. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Task status, priority or assignment is trusted from browser.
- Staff can assign tasks outside scope.
- Disabled staff can receive active tasks.
- High-risk approval task can be approved by requester.
- Blocked task can complete with unresolved dependencies.
- SLA breach does not create alert/escalation.
- Dashboard exposes sensitive source payload.
- Workload view introduces keystroke/screen monitoring.
- Hard delete is enabled.
- More than two repair attempts fail.

## Change continuity

All future Task Work Queue changes must use:

- `feature_request_template.json`
- `bug_fix_template.json`
- `change_control.json`
- `versioning_policy.json`
