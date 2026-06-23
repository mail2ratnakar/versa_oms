# Staff Users Module Runbook

## Purpose

Build the Staff Users module after Company Dashboard because the company portal needs invite-only staff identity, profile, status and assignment scope before deeper permissions and operations modules.

## Required order

1. Confirm platform authentication exists.
2. Confirm or stub Directus user/role integration.
3. Create `staff_profiles` collection.
4. Create `staff_invitations` collection.
5. Create `staff_assignment_scopes` collection.
6. Create `staff_access_events` append-only collection.
7. Configure deny-by-default permissions.
8. Disable public access.
9. Disable staff self-registration.
10. Implement invitation token hashing and expiry.
11. Implement access lifecycle:
    - invite
    - accept
    - activate
    - suspend
    - disable
    - reactivate
    - exit-date auto-disable
12. Implement assignment scope management.
13. Implement APIs:
    - `POST /api/admin/staff/invitations`
    - `POST /api/staff/invitations/accept`
    - `GET /api/admin/staff/{staff_profile_id}`
    - `PATCH /api/admin/staff/{staff_profile_id}`
    - `POST /api/admin/staff/{staff_profile_id}/assignment-scopes`
    - `POST /api/admin/staff/{staff_profile_id}/disable`
    - `POST /api/admin/staff/{staff_profile_id}/reactivate`
14. Implement screens:
    - `/staff/users`
    - `/staff/users/[staff_profile_id]`
    - `/staff/users/invite`
    - `/staff/invitations/accept`
    - `/staff/users/[staff_profile_id]/scopes`
    - `/staff/users/[staff_profile_id]/access`
15. Run tests in `tests.json`.

## Stop conditions

Stop and ask for human review if:

- Staff self-registration is enabled.
- Public role can read staff collections.
- Raw invitation token is stored.
- Disabled/exited staff can log in.
- Active sessions are not revoked on disable.
- Staff can change own role or assignment scope.
- Last active Super Admin can be disabled.
- Hard delete is enabled on staff lifecycle records.
- More than two repair attempts fail.

## Change continuity

All future Staff Users changes must use:

- `feature_request_template.json` for new features.
- `bug_fix_template.json` for bugs.
- `change_control.json` for review and migration gates.
- `versioning_policy.json` for semantic versioning.
