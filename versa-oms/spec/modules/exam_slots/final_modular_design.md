# Exam Slots Module — Final Modular Design

The Exam Slots module is an independent, versioned module under:

```text
/spec/modules/exam_slots/
```

It is generated after Schools, Students and Payments because slot booking depends on school scope, confirmed student count and payment clearance.

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
Exam Slots module
  ↓
Exam Materials / Courier / OMR / Results / Certificates
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

1. Payment must be completed before exam-slot booking.
2. Student count must be finalised before exam-slot booking.
3. Slot capacity must be checked server-side and atomically.
4. One active slot booking is allowed per participation.
5. School_id must be derived from authenticated school user mapping.
6. Slot creation is staff/admin only.
7. Booking changes after lock/material release require staff review.
8. Public users have no slot/booking access.

## Future extension examples

Possible future features:

- Region-wise slot restrictions
- Grade-wise slot restrictions
- Multiple subject slots
- Reschedule approval workflow
- Waitlist for full slots
- Calendar export

## Bug fix continuity

Every exam slot module bug fix must add a regression test, especially for payment gate, capacity, school isolation and booking lock behavior.
