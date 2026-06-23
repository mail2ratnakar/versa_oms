# BUILD-018 — Admin Settings

Module id: `admin_settings`

Feature slice: `flags_settings_policy`

## Required Inputs

- `spec/modules/admin_settings/module.json`
- `spec/modules/admin_settings/schema.json`
- `spec/modules/admin_settings/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/admin_settings/service.ts`
- `server/modules/admin_settings/validators.ts`
- `server/modules/admin_settings/permissions.ts`
- `app/api/staff/admin-settings/route.ts`
- `tests/modules/admin_settings.test.ts`

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
