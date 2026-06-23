# ADR-006 — Worker Queue Strategy

## Status

Accepted

## Context

Many Versa workflows are long-running or provider-dependent. They should not block UI/API requests.

## Decision

Use asynchronous worker queues for material generation, exports, notifications, certificate generation, evaluation imports, SLA scans, security scans and retention jobs. Jobs must be idempotent, auditable and retry-safe.

## Options Considered

1. Dedicated worker queue architecture.
2. Run all work synchronously inside API routes.
3. Cron-only background scripts.
4. Manual staff processing only.

## Consequences

### Positive

- Improves reliability for heavy workflows.
- Supports retries and dead-letter queues.
- Improves observability.
- Keeps UI/API responsive.

### Negative

- Requires queue infrastructure.
- Workers need idempotency and audit design.
- Failure handling must be visible to staff.

## Security Impact

High. Workers run with system identity but must obey source-module policies and avoid leaking secrets/logging sensitive payloads.

## Rollback Impact

Pause queues, disable feature flags, drain/retry/dead-letter safely and preserve job audit.

## Related Files

- `WORKER_JOB_PLAN.md`
- `task_work_queue module`
- `notification_ops module`
- `reports_exports module`

## LLM Implementation Rule

Before changing implementation related to this ADR, the LLM must read this ADR, the linked control files and the latest completed-vs-pending summary. The LLM must not silently reverse this decision without creating a new ADR that supersedes it.
