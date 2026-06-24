# 01 — Spec Interpreter Skill

## Purpose

Converts source-of-truth specs into tasks and separates nouns, states, actions, effects, screens and tests.

## Must Read Before Acting

- `implementation/CANONICAL_DATA_MODEL.json`
- `spec/modules/<m>/module.json`
- `spec/modules/<m>/schema.json`
- `spec/modules/<m>/permissions.json`
- `build/BUSINESS_FEATURE_IMPLEMENTATION_MANIFEST.json`

## Checks

- entities separated from workflows
- statuses separated from effects
- actions identified
- module boundaries respected
- missing behavior flagged

## Failure Signals

- tables exist but behavior missing
- statuses exist but no consequences
- API exists but no screen

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
