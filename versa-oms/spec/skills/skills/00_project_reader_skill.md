# 00 — Project Reader Skill

## Purpose

Reads packs in correct order, builds project map, identifies next pending item and prevents coding before context is loaded.

## Must Read Before Acting

- `build/BUILD_PLAN.md`
- `build/AUTOPILOT.md`
- `build/IMPLEMENTATION_MANIFEST.json`
- `build/BUILD_ORDER.json`
- `reports/BUILD_STATUS.md`
- `build/BUSINESS_FEATURE_IMPLEMENTATION_MANIFEST.json`

## Checks

- required packs present
- latest summary used
- build order known
- current phase identified
- no coding before reading context

## Failure Signals

- starts editing before reading build order
- picks random module
- ignores latest summary

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
