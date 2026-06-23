# JOB_IDEMPOTENCY_POLICY.md

## Key Format

```text
<job_type>:<source_entity_id>:<version_or_hash>
```

## Rules

- Every job has idempotency key.
- Same key plus same payload returns same result.
- Same key plus different payload causes idempotency conflict.
- Generated files are not duplicated silently.
- Notification jobs must not duplicate sends.
- Result/certificate jobs must check existing versions.
