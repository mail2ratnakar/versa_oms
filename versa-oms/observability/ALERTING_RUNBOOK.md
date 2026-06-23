# ALERTING_RUNBOOK.md

## 1. Alert Triage

For every alert:

1. Identify alert id and severity.
2. Confirm affected environment.
3. Check release id.
4. Check module id.
5. Check request/job/audit correlation id.
6. Determine if feature flag rollback is needed.
7. Create or update incident/task.
8. Record resolution.

## 2. Severity

### Critical

Requires immediate attention.

Examples:

- production smoke failed.
- audit hash mismatch.
- critical worker DLQ.
- material release failure near exam.
- result publication failure.
- permission drift critical finding.

### High

Same day response.

Examples:

- failed login spike.
- public verification abuse.
- export anomaly.
- certificate generation failure.

### Medium

Operational response.

Examples:

- notification delivery degradation.
- support SLA risk.
- elevated API errors.

## 3. First Containment Options

- disable feature flag.
- pause queue.
- revoke signed URLs.
- block public endpoint.
- rollback release.
- rotate secret.
- restrict role/scope temporarily.

## 4. Required Post-Alert Record

- alert id.
- owner.
- start time.
- end time.
- affected module.
- affected entity count.
- containment action.
- root cause.
- follow-up task.
