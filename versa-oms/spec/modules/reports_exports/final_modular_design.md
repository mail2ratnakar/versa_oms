# Reports & Exports Module — Final Modular Design

The Reports & Exports module is the seventeenth company/internal portal module under:

```text
/spec/modules/reports_exports/
```

It controls report catalog, role-scoped report access, export requests, sensitive export approvals, masking, watermarking, snapshots, secure downloads, retention and export audit.

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

1. Reports are role-scoped and source-module scoped.
2. Browser-submitted role, scope, filters and school_id are never trusted.
3. Staff exports require reason.
4. Sensitive exports require approval.
5. Requester cannot approve own sensitive export.
6. Source module permissions are rechecked before generation.
7. Student PII is masked by default.
8. Payment-sensitive data is masked by default.
9. Answer key export is forbidden by default.
10. Raw OMR export is forbidden by default.
11. Provider payload export is forbidden by default.
12. Every export creates immutable snapshot hash.
13. Sensitive exports include watermark metadata.
14. CSV injection protection is mandatory.
15. Downloads use signed URLs and are audited.
16. Export files expire by retention policy.
17. Report/export records are never hard-deleted.

## Bug fix continuity

Every Reports & Exports bug fix must add a regression test, especially for source permission checks, sensitive approval, masking, forbidden raw exports, CSV injection protection, signed URL expiry, download audit and no-hard-delete behavior.
