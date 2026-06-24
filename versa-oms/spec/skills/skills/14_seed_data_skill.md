# 14 — Seed Data Skill

## Purpose

Ensures demo/staging scenarios are loaded, privacy-safe and usable for journey tests.

## Must Read Before Acting

- `seed/LOAD_ORDER.json`
- `seed/FIXTURE_INDEX.json`
- `seed/PRIVACY_AND_MASKING_NOTE.md`
- `seed/scenarios/*`
- `spec/feature_effects/catalogs/JOURNEY_ACCEPTANCE_TESTS.json`

## Checks

- happy path loaded
- pending payment loaded
- blocked school loaded
- sensitive export scenario loaded
- DB loaded
- journeys runnable
- no real PII

## Failure Signals

- seed files not loaded
- journeys use empty DB
- real PII appears

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
