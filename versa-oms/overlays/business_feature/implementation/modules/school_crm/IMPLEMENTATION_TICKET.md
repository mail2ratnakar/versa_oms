# BUILD-004 — School CRM

Module id: `school_crm`

Feature slice: `school_lead_pipeline`

## Required Inputs

- `spec/modules/school_crm/module.json`
- `spec/modules/school_crm/schema.json`
- `spec/modules/school_crm/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/school_crm/service.ts`
- `server/modules/school_crm/validators.ts`
- `server/modules/school_crm/permissions.ts`
- `app/api/staff/school-crm/route.ts`
- `tests/modules/school_crm.test.ts`

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
