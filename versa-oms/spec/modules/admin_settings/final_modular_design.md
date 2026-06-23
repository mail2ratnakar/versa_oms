# Admin Settings Module — Final Modular Design

The Admin Settings module is the eighteenth company/internal portal module under:

```text
/spec/modules/admin_settings/
```

It controls centralized versioned configuration, approval-gated critical settings, activation, rollback, provider/environment references, public verification settings, feature flags and policy settings consumed by all business modules.

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

1. Admin Settings is staff-only.
2. Settings are versioned and schema-validated.
3. Active settings are resolved server-side.
4. Browser-submitted setting status, approval state and activation state are never trusted.
5. Critical settings require approval before activation.
6. Critical settings require maker-checker.
7. Rollback plan is required for critical settings.
8. Previous active version is retained.
9. Provider secrets are never stored in settings tables.
10. Provider secret references are Super Admin/security restricted.
11. Production changes are restricted.
12. Public verification changes require security review.
13. Hard-delete exceptions require Super Admin and security review.
14. Audit records are never hard-deleted.
15. Admin setting records are archived/superseded, not hard-deleted.

## Bug fix continuity

Every Admin Settings bug fix must add a regression test, especially for critical approval, maker-checker, provider secret reference handling, production restrictions, activation, rollback, server-side active-setting resolution and no-hard-delete behavior.
