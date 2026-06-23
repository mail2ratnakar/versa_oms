# Courier Ops Module — Final Modular Design

The Courier Ops module is the tenth company/internal portal module under:

```text
/spec/modules/courier_ops/
```

It controls dispatch, AWB/tracking, school return logistics, receipt confirmation, mismatch resolution, lost/damaged incident handling and Evaluation Ops handoff.

## Module position

```text
company_dashboard → staff_users → roles_permissions → school_crm → school_onboarding_ops → student_roster_ops → finance_ops → exam_slot_ops → exam_material_ops → courier_ops → evaluation_ops → results_ops → certificate_ops → notification_ops → support_tickets → task_work_queue → reports_exports → admin_settings → security_audit_console
```

## Non-negotiable rules

1. Outbound dispatch requires active, non-revoked material package.
2. Dispatch batch requires manifest.
3. School return actions are scoped to own school only.
4. School ID, shipment status and receipt counts are never trusted from browser.
5. AWB number is unique when present.
6. Tracking events are append-only.
7. Delivered does not equal received.
8. Receipt confirmation requires expected and received counts.
9. Count mismatch creates courier exception.
10. Blocking mismatch prevents Evaluation Ops handoff.
11. Lost/damaged/tampering incidents require owner and resolution.
12. Candidate mapping is hidden from courier roles by default.
13. Proof files are private.
14. Batch close requires all shipments resolved or risk accepted.
15. Courier records are never hard-deleted.

## Bug fix continuity

Every Courier Ops bug fix must add a regression test, especially for material-readiness gates, AWB uniqueness, school scope, tracking append-only rules, receipt counts, mismatch blocking, evaluation handoff and proof-file privacy.
