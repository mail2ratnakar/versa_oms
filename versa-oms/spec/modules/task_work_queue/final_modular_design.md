# Task Work Queue Module — Final Modular Design

The Task Work Queue module is the sixteenth company/internal portal module under:

```text
/spec/modules/task_work_queue/
```

It controls internal work queues, task creation, task assignment, SLA tracking, escalations, approval tasks, dependencies, workload feed and completion audit.

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

1. Task Work Queue is staff-only in MVP.
2. Task status is server-controlled.
3. Task priority is server-controlled or authorized override only.
4. Assignment requires active staff and valid queue/scope.
5. Reassignment requires reason.
6. SLA tasks require due_at.
7. SLA breach creates alert/escalation and audit event.
8. Source module permission is rechecked on source drilldown/action.
9. Approval tasks enforce maker-checker.
10. Blocked tasks cannot complete until dependencies resolve.
11. Circular dependencies are blocked.
12. Completion requires outcome code and completion note.
13. Dashboard feed uses safe summary, not raw sensitive payload.
14. Workload view must not become surveillance.
15. Task records are never hard-deleted.

## Bug fix continuity

Every Task Work Queue bug fix must add a regression test, especially for assignment scope, status transition guards, SLA breach alerts, maker-checker approvals, blocked task completion, source-module permission checks and safe dashboard payloads.
