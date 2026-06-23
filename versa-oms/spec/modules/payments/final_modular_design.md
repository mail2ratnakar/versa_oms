# Payments Module — Final Modular Design

The Payments module is an independent, versioned module under:

```text
/spec/modules/payments/
```

It is generated after Schools and Students because every payment belongs to a school participation and depends on confirmed student count.

## Module position

```text
Core spec
  ↓
Schools module
  ↓
Students module
  ↓
Payments module
  ↓
Exam Slots / Exam Materials / Courier / Results / Certificates
  ↓
Shared security baseline
  ↓
Change requests
  ↓
Regression tests
  ↓
Runbook execution
```

## Non-negotiable rules

1. Payment amount is always server-calculated.
2. School keeps commission at source.
3. Finverse receives net payable amount.
4. Payment is required before exam-slot booking.
5. Payment is required before question-paper/material release.
6. Webhook signature verification is mandatory.
7. Payment webhook idempotency is mandatory.
8. Manual paid marking is finance-admin only and requires evidence.
9. Payment reversal is finance/system-admin only and requires reason.
10. Payment records are never hard-deleted.

## Future extension examples

Partial payment, refund workflow, multi-provider routing, payment reminders, settlement file import, GST invoice generation, school credit ledger.

## Bug fix continuity

Every payment module bug fix must add a regression test, especially for webhook signature, idempotency, amount calculation, manual confirmation, reversal and school isolation.
