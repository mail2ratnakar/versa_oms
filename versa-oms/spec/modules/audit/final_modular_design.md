# Audit Module — Final Modular Design

The Audit module is the final cross-cutting control module under:

```text
/spec/modules/audit/
```

It consolidates audit, access review, reconciliation, incident handling, tamper-evidence and retention across all Versa Olympiads modules.

## Module position

```text
Core spec
  ↓
Schools / Students / Payments / Exam Slots / Exam Materials / Courier / OMR Imports / Results / Certificates / Notifications
  ↓
Audit module
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

1. Audit events are append-only.
2. Hard delete is forbidden for audit records.
3. Public and school roles have no raw audit access.
4. High-risk events require reason.
5. High-risk changes require before/after snapshot or explicit snapshot-unavailable reason.
6. Event idempotency is required.
7. Tamper-evidence hash chain is required.
8. Audit exports require reason, approval, private file and expiry.
9. Security incidents require root cause and remediation before closure.
10. Access reviews must flag permission drift.
11. Reconciliation runs must link operational exceptions to audit cases.
12. Provider secrets, passwords, tokens and private keys must never be logged.

## Final completed module chain

```text
schools
students
payments
exam_slots
exam_materials
courier
omr_imports
results
certificates
notifications
audit
```

## Future extension examples

Possible future features:

- External immutable audit anchor storage
- SIEM export
- Evidence pack generation
- Daily security digest
- Permission drift alerts
- Automated incident severity scoring
- Compliance report generator

## Bug fix continuity

Every Audit module bug fix must add a regression test, especially for append-only behavior, raw audit access denial, export controls, tamper-evidence, access review and reconciliation rules.
