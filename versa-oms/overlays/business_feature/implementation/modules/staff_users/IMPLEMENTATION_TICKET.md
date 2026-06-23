# BUILD-002 — Staff Users

Module id: `staff_users`

Feature slice: `staff_identity_lifecycle`

## Required Inputs

- `spec/modules/staff_users/module.json`
- `spec/modules/staff_users/schema.json`
- `spec/modules/staff_users/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/staff_users/service.ts`
- `server/modules/staff_users/validators.ts`
- `server/modules/staff_users/permissions.ts`
- `app/api/staff/staff-users/route.ts`
- `tests/modules/staff_users.test.ts`

## Acceptance

- server-side auth/scope guard.
- audit event for write/state action.
- idempotency for write actions.
- sensitive fields masked.
- status server-controlled.
- no hard delete.
- tests added.

## Stop Conditions

- browser role/scope/status trusted.
- hard delete added.
- high-risk action lacks reason/audit.
- sensitive file URL exposed.
