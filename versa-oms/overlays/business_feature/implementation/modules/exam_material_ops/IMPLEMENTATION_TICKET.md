# BUILD-009 — Exam Material Ops

Module id: `exam_material_ops`

Feature slice: `secure_material_generation_release`

## Required Inputs

- `spec/modules/exam_material_ops/module.json`
- `spec/modules/exam_material_ops/schema.json`
- `spec/modules/exam_material_ops/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/exam_material_ops/service.ts`
- `server/modules/exam_material_ops/validators.ts`
- `server/modules/exam_material_ops/permissions.ts`
- `app/api/staff/exam-material-ops/route.ts`
- `tests/modules/exam_material_ops.test.ts`

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
