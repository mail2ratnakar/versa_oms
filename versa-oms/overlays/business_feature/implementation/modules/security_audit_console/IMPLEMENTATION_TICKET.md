# BUILD-019 — Security & Audit Console

Module id: `security_audit_console`

Feature slice: `audit_incidents_access_review`

## Required Inputs

- `spec/modules/security_audit_console/module.json`
- `spec/modules/security_audit_console/schema.json`
- `spec/modules/security_audit_console/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/security_audit_console/service.ts`
- `server/modules/security_audit_console/validators.ts`
- `server/modules/security_audit_console/permissions.ts`
- `app/api/staff/security-audit-console/route.ts`
- `tests/modules/security_audit_console.test.ts`

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
