# HEALTH_CHECKS.md

## Required Health Endpoints

- `/api/health`
- `/api/health/db`
- `/api/health/storage`
- `/api/health/workers`
- `/api/health/audit`
- `/api/health/providers`
- `/api/health/release`

## Rules

- Health checks must not expose secrets.
- Production health must not expose internal database details.
- Failed dependency must return safe status and request id.
- Health checks should include release id.
- Worker health must include queue status summary, not sensitive job payloads.
