# BUILD-001 — Company Dashboard

Module id: `company_dashboard`

Feature slice: `dashboard_summary`

## Required Inputs

- `spec/modules/company_dashboard/module.json`
- `spec/modules/company_dashboard/schema.json`
- `spec/modules/company_dashboard/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/company_dashboard/service.ts`
- `server/modules/company_dashboard/validators.ts`
- `server/modules/company_dashboard/permissions.ts`
- `app/api/staff/company-dashboard/route.ts`
- `tests/modules/company_dashboard.test.ts`

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
