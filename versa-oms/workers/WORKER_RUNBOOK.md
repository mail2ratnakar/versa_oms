# WORKER_RUNBOOK.md

## Daily Checks

- queue depth normal.
- no critical DLQ.
- no stuck running jobs.
- no audit hash failures.
- no backup health failure.
- notification failure rate normal.
- export jobs not stuck.

## Failed Job Handling

1. Open job record.
2. Check owner module.
3. Check source entity state.
4. Check idempotency key.
5. Check error code.
6. Retry, cancel or dead-letter.
7. Record reason.
8. Create task for critical failure.

## Incident Handling

1. Pause affected queue.
2. Disable related feature flag.
3. Preserve logs and audit.
4. Identify affected records.
5. Fix and test.
6. Requeue only safe jobs.
