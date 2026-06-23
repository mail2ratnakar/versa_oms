# Payments Module Runbook

## Purpose

Build the Payments module after Schools and Students because it depends on `school_id`, `participation_id`, and `confirmed_student_count`.

## Required order

1. Confirm Schools module exists and school_id isolation is implemented.
2. Confirm Students module exists and confirmed_student_count is finalised.
3. Create `payments` collection.
4. Create `payment_events` append-only collection.
5. Configure item-level and field-level permissions.
6. Implement server-side amount calculation.
7. Implement payment link creation.
8. Implement Razorpay webhook handler with signature verification, idempotency, and amount/reference matching.
9. Implement manual confirmation with evidence.
10. Implement reversal with reason and downstream gate update.
11. Implement reconciliation report.
12. Implement screens: `/school/payment`, `/staff/payments`, `/staff/payments/reconciliation`.
13. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Payment amount is accepted from browser instead of server-calculated.
- Webhook signature verification is missing.
- Webhook idempotency is missing.
- Public role can read payments.
- School coordinator can access another school's payment.
- Manual confirmation can happen without finance role/evidence.
- Reversal does not reopen payment gates.
- More than two repair attempts fail.

## Change continuity

All future payment changes must use `feature_request_template.json`, `bug_fix_template.json`, `change_control.json`, and `versioning_policy.json`.
