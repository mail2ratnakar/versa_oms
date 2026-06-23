# Exam Materials Module Runbook

## Purpose

Build the Exam Materials module after Schools, Students, Payments and Exam Slots because materials require school scope, candidate IDs, payment clearance and confirmed exam schedule.

## Required order

1. Confirm Schools module exists and school_id isolation is implemented.
2. Confirm Students module exists and candidate IDs are generated.
3. Confirm Payments module exists and payment gate statuses are available.
4. Confirm Exam Slots module exists and booking is confirmed.
5. Create `exam_materials` collection.
6. Create `exam_material_downloads` append-only audit collection.
7. Configure private Directus file storage and no public material URLs.
8. Configure permissions and field restrictions.
9. Implement generation/release/download/revoke APIs:
   - `POST /api/admin/exam-materials/generate`
   - `POST /api/admin/exam-materials/{exam_material_id}/release`
   - `GET /api/exam-materials/{exam_material_id}/download`
   - `POST /api/admin/exam-materials/{exam_material_id}/revoke`
10. Implement screens:
   - `/school/exam-materials`
   - `/staff/exam-materials`
   - `/staff/exam-materials/download-audit`
11. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Material files are public.
- Download works before release time.
- Payment gate or slot gate is missing.
- School coordinator can download another school's material.
- Downloads are not audited.
- Revoked material remains downloadable.
- More than two repair attempts fail.

## Change continuity

All future exam material changes must use:

- `feature_request_template.json` for new features.
- `bug_fix_template.json` for bugs.
- `change_control.json` for review and migration gates.
- `versioning_policy.json` for semantic versioning.
