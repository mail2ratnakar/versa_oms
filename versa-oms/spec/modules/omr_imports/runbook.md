# OMR Imports Module Runbook

## Purpose

Build the OMR Imports module after Courier because evaluation depends on received answer sheets, candidate IDs, and approved answer keys.

## Required order

1. Confirm Students module exists and candidate IDs are generated.
2. Confirm Exam Materials module exists and OMR/candidate mapping exists.
3. Confirm Courier module exists and answer-sheet receipt/count reconciliation is complete.
4. Create `answer_keys` collection.
5. Create `omr_imports` collection.
6. Create `omr_candidate_scores` collection.
7. Configure private file handling for OMR import files.
8. Configure permissions and field restrictions.
9. Implement APIs:
   - `POST /api/admin/answer-keys`
   - `POST /api/admin/omr-imports/upload`
   - `POST /api/admin/omr-imports/{omr_import_id}/validate`
   - `POST /api/admin/omr-imports/{omr_import_id}/score`
   - `POST /api/admin/omr-imports/{omr_import_id}/approve`
10. Implement screens:
   - `/staff/answer-keys`
   - `/staff/omr-imports`
   - `/staff/omr-imports/exceptions`
11. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Answer key is visible to school/public roles.
- Raw OMR data is visible to school/public roles.
- OMR import can run before courier receipt/count reconciliation.
- Duplicate candidate rows can be scored.
- Unmatched candidate IDs can be approved.
- Scores can be manually edited in MVP.
- Results module can consume non-approved imports.
- More than two repair attempts fail.

## Change continuity

All future OMR changes must use:

- `feature_request_template.json` for new features.
- `bug_fix_template.json` for bugs.
- `change_control.json` for review and migration gates.
- `versioning_policy.json` for semantic versioning.
