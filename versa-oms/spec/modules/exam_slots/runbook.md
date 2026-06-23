# Exam Slots Module Runbook

## Purpose

Build the Exam Slots module after Schools, Students and Payments because booking requires school scope, confirmed student count and payment gate.

## Required order

1. Confirm Schools module exists and school_id isolation is implemented.
2. Confirm Students module exists and confirmed_student_count is available.
3. Confirm Payments module exists and payment gate statuses are available.
4. Create `exam_slots` collection.
5. Create `exam_slot_bookings` collection.
6. Configure permissions and field restrictions.
7. Implement capacity rules with atomic booking.
8. Implement API routes:
   - `POST /api/admin/exam-slots`
   - `GET /api/exam-slots`
   - `POST /api/exam-slots/book`
   - `POST /api/exam-slots/bookings/{booking_id}/change`
9. Implement screens:
   - `/school/exam-slot`
   - `/staff/exam-slots`
   - `/staff/exam-slots/bookings`
10. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Payment gate is missing or client-controlled.
- Capacity check is not server-side and atomic.
- School coordinator can access another school's booking.
- Public role can read slots/bookings.
- More than one active booking per participation is possible.
- Booking can change after lock/material release without staff override.
- More than two repair attempts fail.

## Change continuity

All future exam slot changes must use:

- `feature_request_template.json` for new features.
- `bug_fix_template.json` for bugs.
- `change_control.json` for review and migration gates.
- `versioning_policy.json` for semantic versioning.
