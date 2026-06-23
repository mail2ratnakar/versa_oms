# Company Dashboard Module — Final Modular Design

The Company Dashboard module is the first company/internal portal module under:

```text
/spec/modules/company_dashboard/
```

It is a read-only control-plane view that summarizes work across the internal company portal and links staff to the correct operational modules.

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

1. Dashboard is staff-only.
2. Public users have no dashboard access.
3. Dashboard is role-aware.
4. Non-admin staff see only assigned scope.
5. Browser-supplied school_id is never trusted.
6. Widgets require source-module permissions.
7. Drilldowns re-check target-module permissions.
8. Sensitive raw payloads are never shown in dashboard tiles.
9. Dashboard cache must be scoped by role, assignment and filters.
10. Alert dismissal does not resolve source issue.
11. Dashboard does not mutate business workflow state.
12. Every dashboard feature/bug change must preserve the 14-parameter spec structure.

## Future extension examples

Possible future features:

- Executive weekly dashboard
- AI-generated operations brief
- Saved role dashboards
- Dashboard annotations
- Custom KPI builder
- Mobile command center
- Predictive SLA risk indicators

## Bug fix continuity

Every Company Dashboard bug fix must add a regression test, especially for role scope, widget permissions, drilldown permissions, cache scope and sensitive payload minimisation.
