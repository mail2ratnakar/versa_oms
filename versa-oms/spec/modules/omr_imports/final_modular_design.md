# OMR Imports Module — Final Modular Design

The OMR Imports module is an independent, versioned module under:

```text
/spec/modules/omr_imports/
```

It is generated after Courier because OMR import should not begin until answer sheets are received and count reconciliation is cleared.

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
OMR Imports module
  ↓
Results / Certificates
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

1. Courier receipt/count gate must pass before OMR import.
2. Answer key must be approved/active before scoring.
3. Raw OMR files are private.
4. Answer keys are restricted.
5. Candidate IDs must match finalised students in same school/participation.
6. Duplicate candidate rows block approval.
7. Manual score override is forbidden in MVP.
8. Evaluation admin approval is required before Results module consumes scores.
9. Superseded imports remain traceable.
10. All import, scoring and approval events are audited.
