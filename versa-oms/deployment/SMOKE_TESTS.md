# SMOKE_TESTS.md

## Development Smoke Test

- app boots.
- home page loads.
- staff dashboard loads.
- school dashboard loads.
- health endpoint returns ok.

## Staging Smoke Test

- staff login works.
- school login works.
- dashboard loads.
- create support ticket.
- create task.
- read report catalog.
- API health ok.
- database health ok.
- private file test uses signed URL only.
- audit writer test ok.

## Production Smoke Test

Minimum:

- `/api/health` returns ok.
- staff login page loads.
- school login page loads.
- public verification health route works.
- dashboard loads for approved admin.
- no critical errors in logs.
- release id visible.
- feature flags match production defaults.

## Production Smoke Test Rules

- Do not create real payment.
- Do not send bulk notification.
- Do not publish real result.
- Do not release real material.
- Use safe smoke-only endpoints or read-only checks.
