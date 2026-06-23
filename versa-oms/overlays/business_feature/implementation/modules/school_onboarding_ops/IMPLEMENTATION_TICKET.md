# BUILD-005 — School Onboarding Ops

Module id: `school_onboarding_ops`

Feature slice: `school_activation`

## Required Inputs

- `spec/modules/school_onboarding_ops/module.json`
- `spec/modules/school_onboarding_ops/schema.json`
- `spec/modules/school_onboarding_ops/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/school_onboarding_ops/service.ts`
- `server/modules/school_onboarding_ops/validators.ts`
- `server/modules/school_onboarding_ops/permissions.ts`
- `app/api/staff/school-onboarding-ops/route.ts`
- `tests/modules/school_onboarding_ops.test.ts`

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
