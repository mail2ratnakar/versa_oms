# 11 — Worker Queue Skill

## Purpose

Implements long-running work with validated, idempotent, retryable, observable and auditable worker queues.

## Must Read Before Acting

- `workers/JOB_REGISTRY.json`
- `workers/QUEUE_CONFIG.json`
- `workers/JOB_PAYLOAD_SCHEMAS.json`
- `workers/RETRY_AND_DLQ_POLICY.md`
- `workers/WORKER_SECURITY_POLICY.md`

## Checks

- registry used
- payload validated
- idempotency enforced
- source record reloaded
- feature flag checked
- retry/DLQ
- job audit
- metrics
- no sensitive logs

## Failure Signals

- worker no-op
- job synchronous in API
- payload trusted blindly

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
