# 00 — Project Reader Skill

## Purpose

Reads packs in correct order, builds project map, identifies next pending item and prevents coding before context is loaded.

## Must Read Before Acting

- `BUILD_PLAN.md`
- `AUTOPILOT.md`
- `IMPLEMENTATION_MANIFEST.json`
- `BUILD_ORDER.json`
- `COMPLETED_PENDING_SUMMARY.md`
- `PACKAGE_MANIFEST.json`

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
