# BUILD-015 — Support Tickets

Module id: `support_tickets`

Feature slice: `support_case_management`

## Required Inputs

- `spec/modules/support_tickets/module.json`
- `spec/modules/support_tickets/schema.json`
- `spec/modules/support_tickets/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/support_tickets/service.ts`
- `server/modules/support_tickets/validators.ts`
- `server/modules/support_tickets/permissions.ts`
- `app/api/staff/support-tickets/route.ts`
- `tests/modules/support_tickets.test.ts`

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
