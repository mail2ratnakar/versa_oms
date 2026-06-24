# 02 — Effect Chain Skill

## Purpose

Defines what must happen after every action: database changes, status transition, tasks, jobs, notifications, audit and downstream effects.

## Must Read Before Acting

- `FEATURE_EFFECT_CATALOG.json`
- `CROSS_MODULE_EFFECT_CHAINS.json`
- `modules/<module_id>/FEATURE_EFFECTS.md`
- `HIGH_RISK_ACTIONS.json`

## Checks

- created records explicit
- updated records explicit
- status transition explicit
- task/job/notification explicit
- dashboard/school/staff UI updates explicit
- audit explicit

## Failure Signals

- button changes only local UI
- lead conversion does not create onboarding
- payment paid does not open finance gate

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
