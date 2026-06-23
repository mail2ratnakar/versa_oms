# BUILD-017 — Reports & Exports

Module id: `reports_exports`

Feature slice: `safe_reports_sensitive_exports`

## Required Inputs

- `spec/modules/reports_exports/module.json`
- `spec/modules/reports_exports/schema.json`
- `spec/modules/reports_exports/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/reports_exports/service.ts`
- `server/modules/reports_exports/validators.ts`
- `server/modules/reports_exports/permissions.ts`
- `app/api/staff/reports-exports/route.ts`
- `tests/modules/reports_exports.test.ts`

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
