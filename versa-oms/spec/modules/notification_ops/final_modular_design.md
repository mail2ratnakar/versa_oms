# Notification Ops Module — Final Modular Design

The Notification Ops module is the fourteenth company/internal portal module under:

```text
/spec/modules/notification_ops/
```

It controls notification templates, event triggers, recipient resolution, bulk announcements, delivery attempts, provider abstraction, retries, consent preferences and notification audit.

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

1. Recipient scope is resolved server-side.
2. Browser-submitted recipient lists are never trusted.
3. Templates use whitelisted variables only.
4. Active template is required before send.
5. Bulk send requires dry-run and recipient count preview.
6. Critical communication requires reason and approval.
7. Maker-checker applies to critical bulk communication.
8. Provider webhook requires signature validation when enabled.
9. Provider secrets are never stored in module tables.
10. Provider payload is restricted and redacted.
11. Rate limits and retry limits are enforced.
12. Unsubscribed recipients are blocked for non-critical messages.
13. Critical service messages are not unsubscribable but remain audited.
14. Notification records are never hard-deleted.

## Bug fix continuity

Every Notification Ops bug fix must add a regression test, especially for recipient scope, dry-run snapshot, critical approval, template variables, provider webhook signature, retry cap, consent handling and provider payload redaction.
