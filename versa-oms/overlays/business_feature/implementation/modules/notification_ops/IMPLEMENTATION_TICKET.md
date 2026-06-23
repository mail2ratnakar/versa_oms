# BUILD-014 — Notification Ops

Module id: `notification_ops`

Feature slice: `template_delivery_logs`

## Required Inputs

- `spec/modules/notification_ops/module.json`
- `spec/modules/notification_ops/schema.json`
- `spec/modules/notification_ops/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/notification_ops/service.ts`
- `server/modules/notification_ops/validators.ts`
- `server/modules/notification_ops/permissions.ts`
- `app/api/staff/notification-ops/route.ts`
- `tests/modules/notification_ops.test.ts`

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
