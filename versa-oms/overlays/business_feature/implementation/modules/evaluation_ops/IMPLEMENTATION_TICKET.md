# BUILD-011 — Evaluation Ops

Module id: `evaluation_ops`

Feature slice: `omr_import_scoring`

## Required Inputs

- `spec/modules/evaluation_ops/module.json`
- `spec/modules/evaluation_ops/schema.json`
- `spec/modules/evaluation_ops/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/evaluation_ops/service.ts`
- `server/modules/evaluation_ops/validators.ts`
- `server/modules/evaluation_ops/permissions.ts`
- `app/api/staff/evaluation-ops/route.ts`
- `tests/modules/evaluation_ops.test.ts`

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
