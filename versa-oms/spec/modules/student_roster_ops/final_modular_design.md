
# Student Roster Ops Module — Final Modular Design

The Student Roster Ops module is the sixth company/internal portal module under:

```text
/spec/modules/student_roster_ops/
```

It controls staff-side student roster lifecycle for approved schools and prepares downstream finance, slot, materials, courier, evaluation, results and certificate workflows.

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

1. Roster actions require approved/activated school.
2. Blocked/suspended schools cannot start new roster actions.
3. School ID is validated server-side.
4. Staff upload on behalf requires reason.
5. Roster source files are private.
6. Validation is required before lock.
7. Invalid rows and blocking duplicates prevent lock.
8. Confirmed student count is captured at lock.
9. Candidate IDs generate only after lock.
10. Candidate IDs are unique and never reused after void.
11. Direct post-lock edits are forbidden.
12. Corrections require reason, approval and downstream impact check.
13. Evaluators see candidate IDs only by default.
14. Student exports require reason, masking, approval where sensitive and audit.

## Bug fix continuity

Every Student Roster Ops bug fix must add a regression test, especially for school status gates, PII masking, candidate ID generation, post-lock corrections, exports and evaluator candidate-only visibility.
