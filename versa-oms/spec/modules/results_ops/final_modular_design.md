# Results Ops Module — Final Modular Design

The Results Ops module is the twelfth company/internal portal module under:

```text
/spec/modules/results_ops/
```

It controls result generation, ranking, approval, publication, withholding, correction, school visibility and certificate-impact handoff.

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

1. Results generate only from approved Evaluation Ops score batch.
2. Evaluation handoff snapshot hash is mandatory.
3. Scores/ranks/statuses are never trusted from browser.
4. Ranking uses versioned ranking policy.
5. Publication requires dual approval and maker-checker.
6. School sees own-school published results only.
7. Withheld results are hidden or marked by policy.
8. Withhold/release requires reason, approval and audit.
9. Published correction creates a new result version.
10. Score-affecting correction triggers rank recalculation.
11. Published correction requires certificate impact review.
12. Public lookup is not MVP and requires security review.
13. Result exports are controlled and audited.
14. Result records are never hard-deleted.

## Bug fix continuity

Every Results Ops bug fix must add a regression test, especially for score-batch intake, ranking, publication approval, school scope, withhold, correction, rank recalculation and certificate impact review.
