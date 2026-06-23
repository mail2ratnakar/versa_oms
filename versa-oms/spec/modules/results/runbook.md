# Results Module Runbook

## Purpose

Build the Results module after OMR Imports because result generation depends on approved OMR candidate scores.

## Required order

1. Confirm Students module exists and candidate IDs are stable.
2. Confirm OMR Imports module exists and import status `approved_for_results` is available.
3. Create `results` collection.
4. Create `result_publications` collection.
5. Create `result_corrections` append-only collection.
6. Configure permissions:
   - school_coordinator: own published school results only
   - evaluation_admin: full result workflow
   - certificate_admin: published eligibility fields only
   - public: no result access in MVP
7. Implement APIs:
   - `POST /api/admin/results/generate`
   - `POST /api/admin/results/rank`
   - `POST /api/admin/results/publications/{publication_id}/approve`
   - `POST /api/admin/results/publications/{publication_id}/publish`
   - `POST /api/admin/results/{result_id}/correct`
   - `GET /api/results/school`
8. Implement screens:
   - `/staff/results`
   - `/staff/results/corrections`
   - `/school/results`
9. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Results can generate from non-approved OMR imports.
- Scores can be manually edited without correction workflow.
- School can see another school's results.
- Public users can read results in MVP.
- Publication can happen without approval.
- Certificate module can consume non-published results.
- More than two repair attempts fail.

## Change continuity

All future result changes must use:

- `feature_request_template.json` for new features.
- `bug_fix_template.json` for bugs.
- `change_control.json` for review and migration gates.
- `versioning_policy.json` for semantic versioning.
