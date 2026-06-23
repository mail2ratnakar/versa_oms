
# Exam Material Ops Module — Final Modular Design

The Exam Material Ops module is the ninth company/internal portal module under:

```text
/spec/modules/exam_material_ops/
```

It controls secure exam material generation, approval, release, download, replacement, revocation, versioning and courier handoff.

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

1. Material generation requires locked exam slot assignment.
2. Material generation requires locked roster and candidate IDs.
3. Material generation/release requires active school and finance readiness.
4. Question paper release is high-risk and requires dual approval.
5. Maker-checker is mandatory for high-risk release.
6. Material files are private; public URLs are forbidden.
7. School downloads are scoped to own school only.
8. Signed URLs must be short-lived and scoped.
9. Release timers are idempotent and audited.
10. Early/manual release override requires reason and dual approval.
11. Replacement creates a new version.
12. Revocation blocks future downloads.
13. Reschedule/roster correction after generation requires material impact review.
14. Courier handoff must use active, non-revoked material version.
15. Download and print events are audited.
16. Material records are never hard-deleted.

## Bug fix continuity

Every Exam Material Ops bug fix must add a regression test, especially for release timing, dual approval, file privacy, signed URL scope, revocation, replacement, courier handoff and material impact review.
