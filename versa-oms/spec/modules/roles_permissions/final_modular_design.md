# Roles & Permissions Module — Final Modular Design

The Roles & Permissions module is the third company/internal portal module under:

```text
/spec/modules/roles_permissions/
```

It defines fixed staff roles, permission matrix, assignment scope, maker-checker controls and access review rules for all later company portal modules.

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

1. Deny by default.
2. Fixed roles for MVP.
3. Public role has no internal/sensitive access.
4. Staff cannot change own role, scope or permissions.
5. Browser-submitted role/scope/permission decision is never trusted.
6. Non-admin roles require assignment scope.
7. Hard delete is forbidden for business/audit records.
8. High-risk actions require reason.
9. High-risk actions use maker-checker where configured.
10. Same user cannot make and approve same high-risk action.
11. Permission changes require security review.
12. Permission drift review is monthly and on change.
13. Last active Super Admin is protected.
14. Every permission change is audited.

## Future extension examples

Possible future features:

- Custom role builder
- Temporary access elevation
- Just-in-time approvals
- Fine-grained field permission UI
- Permission simulator
- Directus permission migration generator
- Role comparison report
- Access review automation dashboard

## Bug fix continuity

Every Roles & Permissions bug fix must add a regression test, especially for deny-by-default, public access, hard delete, own-role changes, maker-checker, assignment scope and permission drift.
