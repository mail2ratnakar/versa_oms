# BUILD-012 — Results Ops

Module id: `results_ops`

Feature slice: `result_generation_publication`

## Required Inputs

- `spec/modules/results_ops/module.json`
- `spec/modules/results_ops/schema.json`
- `spec/modules/results_ops/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/results_ops/service.ts`
- `server/modules/results_ops/validators.ts`
- `server/modules/results_ops/permissions.ts`
- `app/api/staff/results-ops/route.ts`
- `tests/modules/results_ops.test.ts`

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
