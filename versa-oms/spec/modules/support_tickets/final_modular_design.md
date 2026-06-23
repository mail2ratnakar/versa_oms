# Support Tickets Module — Final Modular Design

The Support Tickets module is the fifteenth company/internal portal module under:

```text
/spec/modules/support_tickets/
```

It controls school/staff/system ticket creation, assignment, SLA, escalation, replies, internal notes, attachments, linked context, resolution and audit.

## Module position

```text
company_dashboard
  ↓
staff_users
  ↓
roles_permissions
  ↓
school_crm
  ↓
school_onboarding_ops
  ↓
student_roster_ops
  ↓
finance_ops
  ↓
exam_slot_ops
  ↓
exam_material_ops
  ↓
courier_ops
  ↓
evaluation_ops
  ↓
results_ops
  ↓
certificate_ops
  ↓
notification_ops
  ↓
support_tickets
  ↓
task_work_queue
  ↓
reports_exports
  ↓
admin_settings
  ↓
security_audit_console
```

## Non-negotiable rules

1. School users can view only own-school tickets.
2. Ticket category is required.
3. Ticket status, priority and assignment are server-controlled.
4. Internal notes are never visible to schools.
5. Attachments are private and ticket-scoped.
6. Linked entity context uses source-module permissions.
7. Support sees safe summary by default.
8. Answer keys, raw OMR and provider payloads are hidden from support by default.
9. Reassignment requires reason after initial assignment.
10. SLA due date is required after opening.
11. SLA breach creates a work-queue task.
12. Escalation requires reason and target owner/module.
13. Closure requires resolution code and summary.
14. Support records are never hard-deleted.

## Bug fix continuity

Every Support Tickets bug fix must add a regression test, especially for school scope, internal-note visibility, attachment privacy, linked-entity permission, safe-summary redaction, SLA breach tasks, closure requirements and no-hard-delete behavior.
