# BUILD-007 — Finance Ops

Module id: `finance_ops`

Feature slice: `invoices_payments_finance_gate`

## Required Inputs

- `spec/modules/finance_ops/module.json`
- `spec/modules/finance_ops/schema.json`
- `spec/modules/finance_ops/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/finance_ops/service.ts`
- `server/modules/finance_ops/validators.ts`
- `server/modules/finance_ops/permissions.ts`
- `app/api/staff/finance-ops/route.ts`
- `tests/modules/finance_ops.test.ts`

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
