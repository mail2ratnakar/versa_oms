# INCIDENT_RESPONSE_RUNBOOK.md

## 1. Incident Severity

### Critical

- exam material leak.
- audit tampering.
- cross-school data leak.
- result/certificate corruption.
- payment integrity issue.
- production outage during exam window.

### High

- failed login spike.
- public verification abuse.
- sensitive export anomaly.
- certificate generation failure.
- high-priority queue DLQ.

### Medium

- notification degradation.
- support SLA breach.
- non-critical worker failures.

## 2. Response Steps

1. Identify incident source.
2. Capture request ids, job ids and audit ids.
3. Contain with feature flag/queue pause/route block.
4. Preserve logs and audit.
5. Identify affected records.
6. Fix or rollback.
7. Verify with smoke tests.
8. Notify stakeholders as required.
9. Create postmortem.
10. Add regression tests.

## 3. First Containment Map

| Incident | First containment |
|---|---|
| Material leak | Disable material download/release flags and revoke URLs |
| Result corruption | Disable result publication and withhold affected batch |
| Certificate issue | Disable public verification or revoke affected certificate |
| Export leak | Disable sensitive exports and expire export files |
| Auth compromise | Revoke sessions and rotate secrets |
| Worker runaway | Pause affected queue |
| Public verify abuse | Increase rate limit/block source/disable route |
