# CI_CD_PIPELINE.md — Versa CI/CD Pipeline

## 1. Purpose

This file defines required CI/CD stages for safe LLM-driven implementation.

## 2. Pull Request Checks

Every PR must run:

1. Install dependencies.
2. Lint.
3. Type check.
4. Unit tests.
5. Integration tests where available.
6. Security baseline check.
7. Privacy baseline check.
8. API contract validation.
9. Schema registry validation.
10. Rollback metadata validation.
11. Build.

## 3. Merge Gates

PR cannot merge if:

- lint fails.
- type check fails.
- tests fail.
- schema registry invalid.
- API contract invalid.
- security baseline check fails.
- privacy baseline check fails.
- rollback metadata missing for migration/high-risk change.

## 4. Staging Deploy

Trigger:

- merge to `main`.
- manual workflow dispatch.

Steps:

1. Checkout.
2. Install.
3. Validate control packs.
4. Build.
5. Check migrations.
6. Apply staging migrations.
7. Deploy app.
8. Run staging smoke tests.
9. Upload deployment summary.
10. Update release status.

## 5. Production Deploy

Trigger:

- manual workflow dispatch only.
- requires protected production environment.

Steps:

1. Verify staging release.
2. Verify rollback file.
3. Verify backup status.
4. Verify production secrets.
5. Verify feature flags.
6. Apply production migrations.
7. Deploy app.
8. Run production smoke tests.
9. Verify health.
10. Lock release.

## 6. Hotfix Flow

Hotfix steps:

1. Create hotfix branch from production tag.
2. Apply minimal fix.
3. Run CI.
4. Deploy to staging.
5. Run targeted smoke tests.
6. Manual approval.
7. Deploy to production.
8. Run production smoke tests.
9. Create postmortem if incident-related.

## 7. LLM Autopilot Rule

LLM may generate CI files, but must not deploy production without explicit user approval.
