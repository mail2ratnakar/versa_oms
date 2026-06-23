# Courier Ops Module Runbook

## Purpose

Build Courier Ops after Exam Material Ops because outbound dispatch depends on active, non-revoked material packages and return logistics feed Evaluation Ops.

## Required order

1. Confirm `exam_material_ops` exists.
2. Confirm `exam_slot_ops` exists.
3. Confirm `student_roster_ops` exists.
4. Confirm `school_onboarding_ops` exists.
5. Confirm `staff_users` and `roles_permissions` exist.
6. Create `courier_vendors`.
7. Create `courier_dispatch_batches`.
8. Create `courier_shipments`.
9. Create `courier_tracking_events`.
10. Create `courier_receipts`.
11. Create `courier_exceptions`.
12. Create `courier_events`.
13. Configure courier/logistics roles and school return permissions.
14. Configure material-readiness and revocation gates.
15. Configure AWB uniqueness and tracking event ledger.
16. Configure school return AWB/proof submission.
17. Configure receipt confirmation and count mismatch workflow.
18. Configure lost/damaged/late/tampering incident workflow.
19. Configure evaluation handoff gate.
20. Configure courier reconciliation and batch closure.
21. Implement APIs from `messages.json`.
22. Implement screens from `screens.json`.
23. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Revoked/superseded material can be dispatched.
- School can submit return AWB for another school.
- Duplicate AWB is accepted.
- Tracking events can be edited/deleted.
- Delivered status is treated as receipt confirmation.
- Receipt can be confirmed without expected/received counts.
- Count mismatch does not create exception.
- Blocking mismatch can enter Evaluation Ops.
- Courier staff can see candidate mapping by default.
- Proof files are public.
- Critical incident does not alert security/evaluation.
- Hard delete is enabled.
- More than two repair attempts fail.

## Change continuity

All future Courier Ops changes must use:

- `feature_request_template.json`
- `bug_fix_template.json`
- `change_control.json`
- `versioning_policy.json`
