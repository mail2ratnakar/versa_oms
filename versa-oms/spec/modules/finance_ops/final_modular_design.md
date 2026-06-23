# Finance Ops Module — Final Modular Design

The Finance Ops module is the seventh company/internal portal module under:

```text
/spec/modules/finance_ops/
```

It controls staff-side school billing, invoices, payment links, confirmations, reconciliation, adjustments and finance gates.

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

1. Final billing requires locked roster.
2. Blocked/suspended schools cannot receive new invoices/payment links.
3. Amounts are always server-calculated.
4. Browser-submitted amount is never trusted.
5. Issued invoices are not directly edited.
6. Payment links require issued invoice with positive balance.
7. Manual payment confirmation requires proof, reference and reason.
8. High-risk manual payments require dual approval.
9. Refunds/reversals/discounts/waivers require reason and approval.
10. Reconciliation mismatch creates an exception task.
11. Payment gate is recomputed after every finance adjustment.
12. Finance exports require reason and audit.
13. Student PII is excluded by default.
14. Finance records are never hard-deleted.

## Bug fix continuity

Every Finance Ops bug fix must add a regression test, especially for amount calculation, manual confirmation, refund/reversal approval, reconciliation, export controls and downstream payment gates.
