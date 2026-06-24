# 04 — Journey Test Skill

## Purpose

Proves each feature end-to-end from screen action to API, DB state, downstream effect, audit and UI update.

## Must Read Before Acting

- `spec/feature_effects/catalogs/JOURNEY_ACCEPTANCE_TESTS.json`
- `spec/feature_effects/JOURNEY_ACCEPTANCE_TEST_CATALOG.md`
- `modules/<module_id>/JOURNEY_ACCEPTANCE_TESTS.md`
- `build/TEST_MATRIX.md`

## Checks

- actor resolves
- screen opens
- action performs API/worker call
- DB state changes
- audit exists
- downstream effect appears
- UI updates
- unauthorized actor blocked
- sensitive fields masked

## Failure Signals

- only unit tests exist
- test never checks DB
- test never checks downstream effect

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
