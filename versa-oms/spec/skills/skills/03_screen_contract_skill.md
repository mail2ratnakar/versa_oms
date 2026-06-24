# 03 — Screen Contract Skill

## Purpose

Ensures every feature has a real screen contract with route, data, components, states, permissions and action wiring.

## Must Read Before Acting

- `spec/feature_effects/catalogs/SCREEN_CONTRACTS.json`
- `spec/feature_effects/SCREEN_CONTRACT_CATALOG.md`
- `design-system/DESIGN_SYSTEM.md`
- `design-system/navigation/ROLE_AWARE_NAVIGATION.md`

## Checks

- list/detail/action screens exist
- loading/empty/error/access-denied states
- role actions hidden in UI and blocked server-side
- mobile behavior defined

## Failure Signals

- API exists but no page
- button has no API wiring
- no empty/error state

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
