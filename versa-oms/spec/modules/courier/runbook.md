# Courier Module Runbook

## Purpose

Build the Courier module after Exam Materials because courier operations depend on material bundle release and expected answer-sheet counts.

## Required order

1. Confirm Schools module exists and school_id isolation is implemented.
2. Confirm Students module exists and confirmed_student_count is available.
3. Confirm Exam Materials module exists and material bundle context exists.
4. Create `courier_batches` collection.
5. Create `courier_events` append-only collection.
6. Configure private courier file handling.
7. Configure permissions and field restrictions.
8. Implement courier APIs:
   - `POST /api/admin/courier/batches`
   - `POST /api/admin/courier/batches/{courier_batch_id}/dispatch`
   - `POST /api/courier/batches/{courier_batch_id}/return-submit`
   - `POST /api/admin/courier/batches/{courier_batch_id}/receive`
9. Implement screens:
   - `/school/courier`
   - `/staff/courier`
   - `/staff/courier/reconciliation`
10. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Expected answer sheet count can be client-supplied.
- School can access another school's courier batch.
- Count mismatch does not block OMR import.
- Courier receipt/proof files are public.
- Courier events are editable/deletable.
- Exception can be resolved without note.
- More than two repair attempts fail.

## Change continuity

All future courier changes must use:

- `feature_request_template.json` for new features.
- `bug_fix_template.json` for bugs.
- `change_control.json` for review and migration gates.
- `versioning_policy.json` for semantic versioning.
