# QUEUE_ARCHITECTURE.md

## Queue Types

- `critical_approval`
- `security`
- `materials`
- `evaluation`
- `results`
- `certificates`
- `notifications`
- `exports`
- `sla`
- `default`
- `maintenance`

## Implementation Options

Acceptable first implementation options:

1. Postgres-backed jobs table.
2. BullMQ/Redis.
3. Managed cloud queue.

Required capabilities:

- locking.
- retries.
- delayed jobs.
- dead-letter queue.
- idempotency.
- job audit.
- queue metrics.

## Worker Identity

Workers run as system actors:

```json
{
  "actor_type": "system",
  "actor_id": "worker:<queue_id>",
  "roles": ["system_worker"],
  "scopes": ["system:<owner_module>"]
}
```

System workers still call source-module services and must not bypass business policy.
