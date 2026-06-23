# BUILD-016 — Task Work Queue

Module id: `task_work_queue`

Feature slice: `tasks_approvals_sla`

## Required Inputs

- `spec/modules/task_work_queue/module.json`
- `spec/modules/task_work_queue/schema.json`
- `spec/modules/task_work_queue/permissions.json`
- `implementation/RLS_POLICY_MATRIX.json`
- `implementation/FIELD_MASKING_MATRIX.json`
- `api-contract/openapi.json`

## Required Outputs

- `server/modules/task_work_queue/service.ts`
- `server/modules/task_work_queue/validators.ts`
- `server/modules/task_work_queue/permissions.ts`
- `app/api/staff/task-work-queue/route.ts`
- `tests/modules/task_work_queue.test.ts`

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
