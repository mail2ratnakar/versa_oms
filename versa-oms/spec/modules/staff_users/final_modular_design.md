# Staff Users Module — Final Modular Design

The Staff Users module is the second company/internal portal module under:

```text
/spec/modules/staff_users/
```

It provides invite-only internal staff identity, profile, access lifecycle and assignment scope for all later company portal operations.

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

1. Staff access is invite-only.
2. Staff self-registration is disabled.
3. Only Super Admin and Company Admin invite staff.
4. Staff email is unique.
5. Invitation token is never stored raw.
6. Invitation expires.
7. Staff profile links to Directus user.
8. Non-admin staff require assignment scope.
9. Staff cannot change own role or assignment scope.
10. Disabled/exited staff cannot log in.
11. Disable revokes sessions.
12. Last active Super Admin is protected.
13. Staff hard delete is forbidden.
14. Every lifecycle change is audited.

## Future extension examples

Possible future features:

- Google SSO for company domain
- OTP for high-risk approvals
- Vendor/evaluator limited portal accounts
- Staff document vault
- HR integration
- Advanced suspicious login detection
- Automatic manager approval routing

## Bug fix continuity

Every Staff Users bug fix must add a regression test, especially for invitation security, self-registration blocking, public access denial, assignment scope, session revocation and last-admin protection.
