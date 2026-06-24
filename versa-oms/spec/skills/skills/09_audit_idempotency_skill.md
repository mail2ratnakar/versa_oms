# 09 — Audit Idempotency Skill

## Purpose

Ensures write/high-risk actions are audit-backed, reasoned, retry-safe and idempotent.

## Must Read Before Acting

- `api-contract/AUDIT_METADATA_CONVENTION.md`
- `api-contract/IDEMPOTENCY_HEADER_CONVENTION.md`
- `implementation/HIGH_RISK_ACTIONS.json`
- `workers/JOB_AUDIT_POLICY.md`

## Checks

- idempotency key required
- same key/payload replays
- same key/different payload conflicts
- audit written
- reason captured
- prev/new status
- actor/scope snapshot
- event hash
- append-only audit

## Failure Signals

- duplicate effect created
- write lacks audit
- high-risk lacks reason

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
