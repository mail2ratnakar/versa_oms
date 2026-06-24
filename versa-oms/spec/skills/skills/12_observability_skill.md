# 12 — Observability Skill

## Purpose

Makes the app diagnosable using structured logs, redaction, metrics, alerts, health endpoints, traces and release monitoring.

## Must Read Before Acting

- `observability/OBSERVABILITY_IMPLEMENTATION.md`
- `observability/schemas/LOGGING_SCHEMA.json`
- `observability/METRICS_CATALOG.json`
- `observability/ALERT_RULES.json`
- `observability/HEALTH_CHECKS.json`

## Checks

- structured logs
- redaction
- metrics
- alerts
- health endpoints
- release id
- request/correlation id
- worker metrics
- audit health
- smoke monitoring

## Failure Signals

- only console.log
- logs signed URL
- no health/db
- no metrics

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
