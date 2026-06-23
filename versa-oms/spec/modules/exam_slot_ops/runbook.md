
# Exam Slot Ops Module Runbook

## Purpose

Build the Exam Slot Ops module after Finance Ops because final slot confirmation requires school activation, locked roster and payment gate status.

## Required order

1. Confirm `school_onboarding_ops` exists.
2. Confirm `student_roster_ops` exists.
3. Confirm `finance_ops` exists.
4. Confirm `staff_users` and `roles_permissions` exist.
5. Create `exam_cycles`.
6. Create `exam_slots`.
7. Create `school_exam_slot_assignments`.
8. Create `exam_slot_reschedule_requests`.
9. Create `exam_slot_conflicts`.
10. Create `exam_slot_events`.
11. Configure exam-operations roles and scope restrictions.
12. Configure school status gate.
13. Configure roster lock and candidate ID gate.
14. Configure payment gate.
15. Configure capacity checks and blackout windows.
16. Implement exam cycle creation/review/approval/publication.
17. Implement slot creation/publication.
18. Implement school slot assignment and bulk dry-run.
19. Implement reschedule workflow with material impact review.
20. Implement slot lock before exam material generation.
21. Implement APIs from `messages.json`.
22. Implement screens from `screens.json`.
23. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Final assignment can happen without roster lock.
- Final assignment can happen without payment gate passed/waived/credited.
- Blocked/suspended school can be assigned.
- Capacity can be exceeded without approved override.
- Slot times can be created with relative/non-absolute datetime.
- Reschedule after material generation skips material impact review.
- Slot lock can happen with blocking conflicts.
- Client/browser-submitted gate status is trusted.
- Hard delete is enabled.
- More than two repair attempts fail.

## Change continuity

All future Exam Slot Ops changes must use:

- `feature_request_template.json`
- `bug_fix_template.json`
- `change_control.json`
- `versioning_policy.json`
