# Courier Module — Final Modular Design

The Courier module is an independent, versioned module under:

```text
/spec/modules/courier/
```

It is generated after Exam Materials because dispatch/return logistics depend on school material bundles and expected answer-sheet counts.

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
Exam Materials module
  ↓
Courier module
  ↓
OMR Imports / Results / Certificates
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

1. Courier batches are school-scoped.
2. Expected answer-sheet count is server-derived.
3. School can submit only own return courier details.
4. Operations controls received answer-sheet count.
5. Count mismatch blocks OMR import.
6. Courier proofs and receipts are private files.
7. Courier events are append-only.
8. Exception resolution requires note and audit.

## Future extension examples

Possible future features:

- Courier provider API tracking
- QR scan at receipt center
- Photo proof of packed answer sheets
- Automated delay alerts
- Multi-package AWB support
- Evaluation center handover workflow

## Bug fix continuity

Every courier module bug fix must add a regression test, especially for count reconciliation, school isolation, private files and OMR readiness gate.
