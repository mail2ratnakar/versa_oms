# Students Module Runbook

## Purpose

Build the Students module after Schools because it depends on `school_id`, `school_users`, and `participations`.

## Required order

1. Confirm Schools module exists and school_id isolation is implemented.
2. Create `student_uploads` collection.
3. Create `students` collection.
4. Add student-module fields to `participations`.
5. Configure item-level permissions:
   - school_coordinator: own_school_only
   - operations_staff: all_schools
   - evaluator: minimal student identity only
   - finance_staff: aggregate count only
   - public: no access
6. Configure private file handling for upload files.
7. Implement server-side parser/validator for CSV/XLSX.
8. Implement API routes:
   - `GET /api/students/template`
   - `POST /api/students/upload`
   - `POST /api/students/validate`
   - `POST /api/participations/{participation_id}/finalise-students`
9. Implement screens:
   - `/school/students/upload`
   - `/school/students/review`
   - `/staff/students`
10. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Public role can read students or student_uploads.
- School coordinator can access another school's students.
- Student upload files are public.
- Count finalisation succeeds with missing consent.
- Post-lock edits can happen without admin reason/audit.
- Candidate IDs are not stable/unique.
- More than two repair attempts fail.

## Change continuity

All future student changes must use:

- `feature_request_template.json` for new features.
- `bug_fix_template.json` for bugs.
- `change_control.json` for review and migration gates.
- `versioning_policy.json` for semantic versioning.
