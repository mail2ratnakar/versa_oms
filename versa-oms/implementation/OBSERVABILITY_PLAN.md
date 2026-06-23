# OBSERVABILITY_PLAN.md — Versa Observability Plan

## Layers
- Application logs: API, errors, validation failures, permission denials.
- Audit logs: state changes, high-risk actions, approvals, exports, downloads, login events.
- Metrics: API latency/error rate, job queue depth, failed jobs, notification failures, export failures, failed logins, SLA breaches.
- Traces later: roster upload, material release, evaluation import, result publication, certificate generation, export generation.

## Required Alerts
- API error spike.
- failed login spike.
- permission drift.
- sensitive export requested/downloaded.
- material release failure.
- result publication failure.
- certificate generation failure.
- critical notification failure.
- job dead-letter count > 0.
- backup failure.
- audit hash mismatch.
- public verification anomaly.

## Health Checks
`/api/health`, DB connectivity, storage, worker queue, notification provider, background heartbeat and audit writer health.

## Logging Privacy
Logs must not include secrets, tokens, signed URLs, parent contacts, raw OMR, answer keys, payment provider payloads, private file URLs or full audit snapshots.
