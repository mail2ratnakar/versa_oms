# RETRY_AND_DLQ_POLICY.md

## Temporary Failures

Retry only temporary failures:

- provider timeout.
- network timeout.
- database lock.
- storage timeout.
- queue contention.

## Permanent Failures

Do not retry:

- validation failure.
- permission failure.
- missing approval.
- invalid lifecycle state.
- revoked material.
- blocked school.
- security policy failure.

## Retry Backoff

- Retry 1: after 1 minute.
- Retry 2: after 5 minutes.
- Retry 3: after 15 minutes where allowed.

## Dead Letter Queue

Dead-letter jobs when:

- max attempts exceeded.
- permanent failure found.
- payload invalid.
- source record missing.
- source state unsafe.

Critical DLQ creates:

- task.
- audit event.
- security alert where relevant.
