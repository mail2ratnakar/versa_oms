
# Exam Material Ops Module Runbook

## Purpose

Build the Exam Material Ops module after Exam Slot Ops because secure material generation requires locked slot assignments, locked rosters, candidate IDs and finance/payment readiness.

## Required order

1. Confirm `exam_slot_ops` exists.
2. Confirm `student_roster_ops` exists.
3. Confirm `finance_ops` exists.
4. Confirm `school_onboarding_ops` exists.
5. Confirm `staff_users` and `roles_permissions` exist.
6. Create `exam_material_templates`.
7. Create `exam_material_packages`.
8. Create `exam_material_files`.
9. Create `exam_material_approvals`.
10. Create `exam_material_download_events`.
11. Create `exam_material_events`.
12. Configure material/content/release roles.
13. Configure school scoped download permissions.
14. Configure private file storage and signed URL policy.
15. Configure material generation gates.
16. Configure question paper release dual approval.
17. Configure scheduled release timer and override workflow.
18. Configure replacement/revocation workflow.
19. Configure download audit and suspicious download alerts.
20. Configure courier handoff.
21. Implement APIs from `messages.json`.
22. Implement screens from `screens.json`.
23. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Material can generate without locked slot.
- Material can generate without locked roster/candidate IDs.
- Question paper can release without dual approval.
- Same user can generate and final approve high-risk release.
- Private material file gets a public URL.
- Signed URL has no TTL or is not school scoped.
- Revoked/superseded material can be downloaded.
- Reschedule/roster correction after generation skips impact review.
- Courier can print revoked/superseded version.
- Browser-submitted release/download status is trusted.
- Hard delete is enabled.
- More than two repair attempts fail.

## Change continuity

All future Exam Material Ops changes must use:

- `feature_request_template.json`
- `bug_fix_template.json`
- `change_control.json`
- `versioning_policy.json`
