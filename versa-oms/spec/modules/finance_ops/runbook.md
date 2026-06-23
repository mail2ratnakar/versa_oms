# Finance Ops Module Runbook

## Purpose

Build the Finance Ops module after Student Roster Ops because final billing uses locked roster confirmed student count.

## Required order

1. Confirm `school_onboarding_ops` exists.
2. Confirm `student_roster_ops` exists.
3. Confirm `staff_users` and `roles_permissions` exist.
4. Create `finance_invoices`.
5. Create `finance_payment_links`.
6. Create `finance_payments`.
7. Create `finance_adjustments`.
8. Create `finance_reconciliation_batches`.
9. Create `finance_events`.
10. Configure finance roles and field restrictions.
11. Configure school status guard.
12. Configure server-side pricing and amount calculation.
13. Implement invoice generation and issue workflow.
14. Implement payment link creation.
15. Implement manual payment confirmation with proof/reference/reason.
16. Implement gateway/mock payment status path.
17. Implement reconciliation and exception tasks.
18. Implement refund/reversal/discount/waiver adjustments.
19. Implement finance export controls.
20. Implement APIs from `messages.json`.
21. Implement screens from `screens.json`.
22. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Amount can be accepted from browser without server recomputation.
- Final invoice can be issued without locked roster.
- Manual payment can be confirmed without proof/reference/reason.
- Refund/reversal can happen without approval.
- Payment gate is not recomputed after adjustment.
- Gateway secrets are stored in DB.
- Finance export includes student PII by default.
- Hard delete is enabled.
- More than two repair attempts fail.

## Change continuity

All future Finance Ops changes must use `feature_request_template.json`, `bug_fix_template.json`, `change_control.json`, and `versioning_policy.json`.
