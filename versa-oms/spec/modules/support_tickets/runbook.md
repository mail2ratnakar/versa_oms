# Support Tickets Module Runbook

## Purpose

Build the Support Tickets module after Notification Ops because ticket events need notifications and the support queue needs links into all prior business modules.

## Required order

1. Confirm `staff_users` exists.
2. Confirm `roles_permissions` exists.
3. Confirm `school_onboarding_ops` exists.
4. Confirm `notification_ops` exists.
5. Create `support_ticket_categories`.
6. Create `support_tickets`.
7. Create `support_ticket_messages`.
8. Create `support_ticket_attachments`.
9. Create `support_ticket_links`.
10. Create `support_ticket_escalations`.
11. Create `support_ticket_events`.
12. Configure categories and default queues.
13. Configure SLA by category and priority.
14. Configure school-scoped ticket access.
15. Configure staff assignment and escalation.
16. Configure safe linked-entity summaries.
17. Configure staff-only internal notes.
18. Configure private attachments.
19. Implement APIs from `messages.json`.
20. Implement screens from `screens.json`.
21. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- School can view another school's ticket.
- Internal note is visible to school.
- Ticket status/priority/assignment is trusted from browser.
- Linked entity access bypasses source module permissions.
- Support view exposes answer keys, raw OMR, provider payload or full sensitive records.
- Attachments are public.
- SLA breach does not create a task.
- Ticket closes without resolution code and summary.
- Hard delete is enabled.
- More than two repair attempts fail.

## Change continuity

All future Support Tickets changes must use:

- `feature_request_template.json`
- `bug_fix_template.json`
- `change_control.json`
- `versioning_policy.json`
