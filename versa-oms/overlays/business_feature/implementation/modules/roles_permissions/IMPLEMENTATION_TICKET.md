# BUILD-003 — Roles & Permissions

Module id: `roles_permissions`

Feature slice: `rbac_policy_management`

## Required Inputs

- `spec/modules/roles_permissions/module.json`
- `spec/modules/roles_permissions/schema.json`
- `spec/modules/roles_permissions/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/roles_permissions/service.ts`
- `server/modules/roles_permissions/validators.ts`
- `server/modules/roles_permissions/permissions.ts`
- `app/api/staff/roles-permissions/route.ts`
- `tests/modules/roles_permissions.test.ts`

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
