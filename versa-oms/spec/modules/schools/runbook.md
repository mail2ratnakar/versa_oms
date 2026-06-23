# Schools Module Runbook

## Purpose

Build the Schools module first because it provides `school_id`, `school_code`, coordinator identity, and school-level isolation for all downstream modules.

## Required order

1. Read `module.json`.
2. Create/check Directus roles required by the module.
3. Create `schools` collection.
4. Create `school_users` collection.
5. Add school-owned fields to `participations`.
6. Configure item-level permissions.
7. Configure field-level restrictions.
8. Implement server-side API routes:
   - `POST /api/schools/register`
   - `POST /api/admin/schools/{school_id}/approve`
   - `GET /api/school/dashboard`
9. Implement screens:
   - `/school/register`
   - `/staff/schools`
   - `/school/dashboard`
10. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Public role can read schools, school_users or participations.
- School coordinator can access another school's data.
- School approval can be performed by unauthorised role.
- School user mapping cannot be enforced in Directus permissions.
- More than two repair attempts fail.

## Change continuity

All future school changes must use:

- `feature_request_template.json` for new features.
- `bug_fix_template.json` for bugs.
- `change_control.json` for review and migration gates.
- `versioning_policy.json` for semantic versioning.
