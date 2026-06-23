# Results Module — Final Modular Design

The Results module is an independent, versioned module under:

```text
/spec/modules/results/
```

It is generated after OMR Imports because result generation depends on approved OMR candidate scores.

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
Results module
  ↓
Certificates
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

1. Results generate only from approved OMR candidate scores.
2. Manual score edits are forbidden outside audited correction workflow.
3. Ranking must run before publication.
4. Evaluation admin approval is required before publication.
5. School coordinators see only own published school results.
6. Public result lookup is disabled in MVP.
7. Withheld/revoked/superseded results are not certificate-eligible.
8. Result corrections are append-only and audited.
9. Rank recalculation is required after score-impacting corrections.
10. Certificates consume published results only.

## Future extension examples

Possible future features:

- Public result lookup by candidate ID and OTP
- Parent/student result portal
- Re-evaluation request workflow
- Grace marks workflow
- Multiple subject rank types
- School analytics dashboard
- Award-band automation

## Bug fix continuity

Every Results module bug fix must add a regression test, especially for publication gate, school isolation, ranking correctness, correction workflow and certificate eligibility.
