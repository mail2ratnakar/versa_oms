
# Student Roster Ops Module Runbook

## Purpose

Build the Student Roster Ops module after School Onboarding Ops because only approved/activated schools should proceed to roster, payment and exam readiness workflows.

## Required order

1. Confirm `school_onboarding_ops` exists.
2. Confirm `staff_users` and `roles_permissions` exist.
3. Confirm base `students`, `schools`, and `participations` collections exist or are mapped from business modules.
4. Create `student_roster_batches`.
5. Create `student_roster_corrections`.
6. Create `candidate_id_events`.
7. Create `student_roster_events`.
8. Configure staff-only operations permissions.
9. Configure school status guard for approved/activated/not blocked schools.
10. Configure PII field masking.
11. Configure evaluator candidate-ID-only view.
12. Implement roster upload on behalf.
13. Implement validation and duplicate scan.
14. Implement roster lock.
15. Implement candidate ID generation.
16. Implement post-lock correction workflow.
17. Implement controlled student exports.
18. Implement APIs from `messages.json`.
19. Implement screens from `screens.json`.
20. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Staff can access roster outside assignment scope.
- Blocked/suspended school can upload or lock roster.
- Candidate IDs can generate before roster lock.
- Direct post-lock student edit is possible.
- OMR operator can see student names or parent contacts.
- Finance can see student PII by default.
- Student exports can run without reason/audit.
- Roster source files are public.
- Hard delete is enabled.
- More than two repair attempts fail.

## Change continuity

All future Student Roster Ops changes must use:

- `feature_request_template.json` for new features.
- `bug_fix_template.json` for bugs.
- `change_control.json` for review and migration gates.
- `versioning_policy.json` for semantic versioning.
