# 06 — Database Migration Skill

## Purpose

Creates safe additive migrations with real tables, indexes, lifecycle fields, RLS, audit/idempotency/job tables and no destructive changes.

## Must Read Before Acting

- `implementation/CANONICAL_DATA_MODEL.json`
- `deployment/MIGRATION_DEPLOYMENT_PLAN.md`
- `implementation/RLS_POLICY_MATRIX.json`

## Checks

- real module tables
- indexes
- foreign keys
- status/lifecycle fields
- archived_at
- audit_events
- idempotency_keys
- worker jobs
- RLS
- no hard delete
- append-only audit

## Failure Signals

- generic table only
- migration drops data
- delete route added
- RLS omitted

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
