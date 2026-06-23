# WORKER_OBSERVABILITY.md

## Metrics

- queue depth.
- queued/running/succeeded/failed/dead-lettered jobs.
- retry count.
- average duration.
- p95 duration.
- timeout count.
- idempotency conflict count.

## Alerts

- critical queue DLQ > 0.
- material generation failure.
- result generation failure.
- certificate generation failure.
- notification failure spike.
- export generation failure.
- audit hash mismatch.
- permission drift finding.
- backup health failure.

## Logging Rules

Log job id, job type, queue, owner module, status, duration and safe error code.

Do not log secrets, signed URLs, private paths, raw OMR, answer keys, provider payloads or parent contacts.
