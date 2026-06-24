# 17 — Gap Detection Skill

## Purpose

Forces missing layers to be reported instead of silently improvised or hidden.

## Must Read Before Acting

- `latest audit reports`
- `completed-pending summary`
- `build/BUSINESS_FEATURE_IMPLEMENTATION_MANIFEST.json`
- `effect/screen/journey catalogs`

## Checks

- effect chain exists
- screen contract exists
- journey test exists
- DB persistence
- auth
- RBAC
- audit
- idempotency
- signed URL
- worker
- observability
- seed scenario
- CI/deployment

## Failure Signals

- done claim without journey
- scaffold called production-ready
- infra pending hidden

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
