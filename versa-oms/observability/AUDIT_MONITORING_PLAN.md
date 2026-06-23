# AUDIT_MONITORING_PLAN.md

## 1. Audit Monitoring Purpose

Audit monitoring detects tampering, missing audit events and unusual high-risk activity.

## 2. Required Monitors

- high-risk action without audit event.
- audit event hash missing for security-critical events.
- audit hash mismatch.
- role/scope change without maker-checker.
- manual payment confirmation without reason.
- material release without approval.
- result publication without approval.
- certificate revocation/reissue without approval.
- sensitive export without approval.
- public verification policy change without approval.

## 3. Audit Health Check

`/api/health/audit` should verify:

- audit writer available.
- latest audit event readable.
- append-only path working.
- event hash generation available.
- no audit queue backlog above threshold.

## 4. Alerting

Critical audit failures create:

- security alert.
- task for security reviewer.
- dashboard alert.
- optional notification to admin/security.
