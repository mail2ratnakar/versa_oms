# Results Ops Module Runbook

## Purpose

Build the Results Ops module after Evaluation Ops because result generation requires an approved evaluation score batch and immutable handoff snapshot.

## Required order

1. Confirm `evaluation_ops` exists.
2. Confirm `student_roster_ops` exists.
3. Confirm `school_onboarding_ops` exists.
4. Confirm `finance_ops` exists if finance holds are enabled.
5. Create `result_batches`.
6. Create `candidate_results`.
7. Create `result_publication_windows`.
8. Create `result_corrections`.
9. Create `result_rank_snapshots`.
10. Create `result_events`.
11. Configure result/ranking rules.
12. Configure withhold and correction rules.
13. Configure school-scoped visibility.
14. Configure publication dual approval.
15. Configure certificate impact review.
16. Implement APIs from `messages.json`.
17. Implement screens from `screens.json`.
18. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Results can generate from unapproved score batch.
- Browser-submitted scores/ranks/statuses are trusted.
- Publication can happen without dual approval.
- Same user can generate and final publish.
- School can view another school's results.
- Published correction skips new version creation.
- Score-affecting correction skips rank recalculation.
- Correction skips certificate impact review.
- Public lookup is enabled without security review.
- Hard delete is enabled.
- More than two repair attempts fail.

## Change continuity

All future Results Ops changes must use:

- `feature_request_template.json`
- `bug_fix_template.json`
- `change_control.json`
- `versioning_policy.json`
