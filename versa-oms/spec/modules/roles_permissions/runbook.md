# Roles & Permissions Module Runbook

## Purpose

Build the Roles & Permissions module after Staff Users because the company portal needs fixed roles, permissions, scope rules and approval powers before operational modules.

## Required order

1. Confirm Staff Users module exists.
2. Confirm Directus users/roles/permissions are available.
3. Create `portal_roles` collection.
4. Create `portal_permission_rules` collection.
5. Create `role_change_requests` collection.
6. Create `approval_policies` collection.
7. Seed fixed MVP role catalog from `role_catalog.json`.
8. Seed approval matrix from `approval_matrix_policy.json`.
9. Configure deny-by-default permissions.
10. Configure public role with no internal access.
11. Configure no hard delete on business/audit records.
12. Implement server-side permission check:
    - `POST /api/internal/roles-permissions/check`
13. Implement role/permission change workflow:
    - create request
    - review
    - approve/reject
    - apply
    - post-apply tests
14. Implement access review trigger.
15. Implement screens:
    - `/staff/admin/roles-permissions/roles`
    - `/staff/admin/roles-permissions/matrix`
    - `/staff/admin/roles-permissions/approval-matrix`
    - `/staff/admin/roles-permissions/change-requests`
    - `/staff/admin/roles-permissions/access-review`
16. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Public role can read sensitive/internal collections.
- Any role has hard delete on business/audit records.
- Staff can change own role/scope/permissions.
- Same user can make and approve high-risk action.
- Permission changes can be applied without reason/security review.
- Non-admin staff can access unscoped records.
- Finance role can read student PII by default.
- Operations role can read answer keys.
- More than two repair attempts fail.

## Change continuity

All future Roles & Permissions changes must use:

- `feature_request_template.json` for new features.
- `bug_fix_template.json` for bugs.
- `change_control.json` for review and migration gates.
- `versioning_policy.json` for semantic versioning.
