# 15 — CI Deployment Skill

## Purpose

Prevents local-only builds from being mistaken as staging or production complete.

## Must Read Before Acting

- `deployment/CI_CD_PIPELINE.md`
- `deployment/DEPLOYMENT_PLAN.md`
- `deployment/PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- `deployment/SMOKE_TESTS.md`
- `deployment/ROLLBACK_DRILL_RUNBOOK.md`

## Checks

- git repo
- CI committed
- lint/typecheck/tests/build pass
- migration check
- staging deploy
- production approval
- rollback drill

## Failure Signals

- not git repo
- no CI
- local-only build
- no staging smoke

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
