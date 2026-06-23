
# Exam Slot Ops Module — Final Modular Design

The Exam Slot Ops module is the eighth company/internal portal module under:

```text
/spec/modules/exam_slot_ops/
```

It controls staff-side exam cycles, slots, school assignments, capacity, rescheduling, slot locking and material-readiness gates.

## Module position

```text
Company Portal Source of Truth
  ↓
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

1. Final slot assignment requires active school.
2. Final slot assignment requires locked roster.
3. Final slot assignment requires payment gate passed, waived or approved credit.
4. Capacity is calculated server-side.
5. Capacity override requires reason and approval.
6. Slot creation respects exam cycle window and blackout windows.
7. API uses absolute datetimes and stores UTC plus local time.
8. Published slots are school-visible only within school scope.
9. Reschedule requires reason.
10. Reschedule after material generation requires material impact review.
11. Slot lock is required before exam material generation.
12. Slot lock requires no blocking conflicts.
13. Browser-submitted gate/status values are never trusted.
14. Records are never hard-deleted.

## Bug fix continuity

Every Exam Slot Ops bug fix must add a regression test, especially for school status gate, roster gate, payment gate, capacity checks, reschedule material impact and slot lock conflicts.
