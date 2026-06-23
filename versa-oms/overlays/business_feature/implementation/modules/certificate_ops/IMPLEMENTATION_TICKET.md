# BUILD-013 — Certificate Ops

Module id: `certificate_ops`

Feature slice: `certificate_generation_verification`

## Required Inputs

- `spec/modules/certificate_ops/module.json`
- `spec/modules/certificate_ops/schema.json`
- `spec/modules/certificate_ops/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/certificate_ops/service.ts`
- `server/modules/certificate_ops/validators.ts`
- `server/modules/certificate_ops/permissions.ts`
- `app/api/staff/certificate-ops/route.ts`
- `tests/modules/certificate_ops.test.ts`

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
