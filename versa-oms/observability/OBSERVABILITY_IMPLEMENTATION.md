# OBSERVABILITY_IMPLEMENTATION.md — Versa Observability Implementation

## 1. Purpose

Observability ensures Versa Olympiads can detect, diagnose and respond to problems in production.

The system must observe:

- APIs.
- auth/session events.
- school scope access.
- staff role/scope changes.
- payments.
- exam material generation/release/downloads.
- OMR/evaluation imports.
- result generation/publication.
- certificate generation/verification.
- notifications.
- reports/exports.
- worker queues.
- audit events.
- security incidents.
- public verification traffic.
- deployment health.

## 2. Observability Layers

Versa uses five layers:

1. Application logs.
2. Audit logs.
3. Metrics.
4. Alerts.
5. Traces.

## 3. Separation of Logs and Audit

Application logs are operational.

Audit logs are business/security evidence.

Do not mix them.

Application logs may be sampled and retained for shorter periods.

Audit logs must be append-only, protected, searchable only by authorized users and retained according to policy.

## 4. Core Rule

Every high-risk action must produce:

- API request log.
- authorization decision.
- audit event.
- metric event.
- error log if failed.
- alert if critical failure.
- trace/span later for debugging.

## 5. Required Correlation IDs

Every request/job must carry:

- `request_id`
- `correlation_id`
- `actor_id`
- `actor_type`
- `module_id`
- `entity_id` where safe
- `job_id` for workers
- `release_id` for deployments

## 6. Sensitive Data Rule

Never log:

- passwords.
- session tokens.
- magic links.
- signed URLs.
- private file paths.
- raw OMR.
- answer keys.
- full parent contact.
- full payment provider payload.
- secret keys.
- webhook signatures.
- raw audit snapshots.

## 7. Production Readiness

Before production, verify:

- `/api/health`
- `/api/health/db`
- `/api/health/storage`
- `/api/health/workers`
- `/api/health/audit`
- worker queue dashboards.
- critical alert routes.
- security incident creation.
- log redaction.
- release monitoring.
