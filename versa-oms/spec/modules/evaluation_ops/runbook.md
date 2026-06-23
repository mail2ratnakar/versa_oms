# Evaluation Ops Module Runbook

## Purpose

Build the Evaluation Ops module after Courier Ops because returned answer-sheet receipt and intake handoff feed OMR/scan import, scoring and Results Ops handoff.

## Required order

1. Confirm `courier_ops` exists.
2. Confirm `exam_material_ops` exists.
3. Confirm `student_roster_ops` exists.
4. Confirm `exam_slot_ops` exists.
5. Create `evaluation_answer_keys`.
6. Create `evaluation_import_batches`.
7. Create `evaluation_candidate_responses`.
8. Create `evaluation_score_batches`.
9. Create `evaluation_candidate_scores`.
10. Create `evaluation_exceptions`.
11. Create `evaluation_events`.
12. Configure answer-key roles and redaction.
13. Configure candidate-ID-only operator view.
14. Configure import validation and quality checks.
15. Configure scoring and score-batch approval.
16. Configure exception resolution.
17. Configure results handoff gate.
18. Implement APIs from `messages.json`.
19. Implement screens from `screens.json`.
20. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Scoring can run without final answer key.
- Final answer key can be approved without dual approval.
- OMR operator can see student names/parent contacts.
- Source scans or answer key files are public.
- Duplicate candidate or count mismatch does not create blocking exception.
- Manual raw score edit is possible in MVP.
- Results handoff can happen with unresolved blocking exceptions.
- Browser-submitted score/status is trusted.
- Hard delete is enabled.
- More than two repair attempts fail.

## Change continuity

All future Evaluation Ops changes must use:

- `feature_request_template.json`
- `bug_fix_template.json`
- `change_control.json`
- `versioning_policy.json`
