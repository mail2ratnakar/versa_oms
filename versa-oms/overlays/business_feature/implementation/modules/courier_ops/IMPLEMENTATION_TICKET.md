# BUILD-010 — Courier Ops

Module id: `courier_ops`

Feature slice: `dispatch_receipt_exception`

## Required Inputs

- `spec/modules/courier_ops/module.json`
- `spec/modules/courier_ops/schema.json`
- `spec/modules/courier_ops/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/courier_ops/service.ts`
- `server/modules/courier_ops/validators.ts`
- `server/modules/courier_ops/permissions.ts`
- `app/api/staff/courier-ops/route.ts`
- `tests/modules/courier_ops.test.ts`

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
