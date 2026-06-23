# Evaluation Ops Module — Final Modular Design

The Evaluation Ops module is the eleventh company/internal portal module under:

```text
/spec/modules/evaluation_ops/
```

It controls answer keys, OMR/answer-sheet intake, scan/CSV import, candidate response validation, scoring, exception resolution, score-batch approval and Results Ops handoff.

## Module position

```text
company_dashboard
  ↓
staff_users
  ↓
roles_permissions
  ↓
school_crm
  ↓
school_onboarding_ops
  ↓
student_roster_ops
  ↓
finance_ops
  ↓
exam_slot_ops
  ↓
exam_material_ops
  ↓
courier_ops
  ↓
evaluation_ops
  ↓
results_ops
  ↓
certificate_ops
  ↓
notification_ops
  ↓
support_tickets
  ↓
task_work_queue
  ↓
reports_exports
  ↓
admin_settings
  ↓
security_audit_console
```

## Non-negotiable rules

1. Scoring requires final answer key.
2. Final answer key requires dual approval and maker-checker.
3. OMR/import source files are private.
4. Candidate ID is required for every response.
5. OMR operators see candidate IDs only by default.
6. Student names and parent contacts are hidden from OMR operators.
7. Duplicate candidates and count mismatches create blocking exceptions.
8. Quality report is required before scoring.
9. Manual raw score edit is forbidden in MVP.
10. Score recalculation creates a new version.
11. Score batch approval is required before Results Ops handoff.
12. Results handoff requires no unresolved blocking exceptions.
13. Answer key access is restricted and audited.
14. Evaluation records are never hard-deleted.

## Bug fix continuity

Every Evaluation Ops bug fix must add a regression test, especially for answer-key approval, import validation, duplicate candidate detection, count mismatch, scoring, exception gate, score approval and Results Ops handoff.
