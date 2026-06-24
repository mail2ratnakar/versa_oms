# 16 — Completion Verification Skill

## Purpose

Defines what done means and forces evidence-based completed/pending reporting.

## Must Read Before Acting

- `ACCEPTANCE_CRITERIA.md`
- `TEST_MATRIX.md`
- `COMPLETED_PENDING_SUMMARY.md`
- `PACKAGE_MANIFEST.json`

## Checks

- spec read
- effect chain
- screen
- API
- DB persisted
- audit
- security/privacy
- journey test
- CI
- summary updated

## Failure Signals

- API-only completion
- local-only completion
- no DB/auth/journey/audit

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
