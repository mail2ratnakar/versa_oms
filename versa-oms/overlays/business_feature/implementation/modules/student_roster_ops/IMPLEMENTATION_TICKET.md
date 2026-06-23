# BUILD-006 — Student Roster Ops

Module id: `student_roster_ops`

Feature slice: `roster_import_candidate_generation`

## Required Inputs

- `spec/modules/student_roster_ops/module.json`
- `spec/modules/student_roster_ops/schema.json`
- `spec/modules/student_roster_ops/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/student_roster_ops/service.ts`
- `server/modules/student_roster_ops/validators.ts`
- `server/modules/student_roster_ops/permissions.ts`
- `app/api/staff/student-roster-ops/route.ts`
- `tests/modules/student_roster_ops.test.ts`

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
