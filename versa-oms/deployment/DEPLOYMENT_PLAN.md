# DEPLOYMENT_PLAN.md — Versa Deployment Plan

## 1. Purpose

This document defines how Versa Olympiads moves from local development to staging and production.

## 2. Environment Model

Versa uses three environments:

- `development`
- `staging`
- `production`

Optional later:

- `preview`
- `uat`
- `disaster_recovery`

## 3. Deployment Principle

No code goes directly to production.

Flow:

```text
feature branch
  ↓
pull request
  ↓
CI checks
  ↓
merge to main
  ↓
staging deploy
  ↓
staging smoke tests
  ↓
manual production approval
  ↓
production deploy
  ↓
production smoke tests
  ↓
release lock
```

## 4. Deployment Rules

- Every deployment has a release id.
- Every release has rollback metadata.
- Every release has migration status.
- Every production release requires manual approval.
- Every production deployment must run smoke tests.
- Every production deployment must create audit/release record.
- Destructive migrations are blocked unless explicitly approved.
- Feature flags must default conservative in production.
- High-risk features must be disabled by default in production.

## 5. Deployment Targets

### Development

Purpose:

- local coding.
- skeleton validation.
- mock data.
- no real secrets.
- no real student data.

Allowed:

- auto-deploy from local or dev branch.
- fake/mock providers.
- fake storage.
- fake payment gateway.

### Staging

Purpose:

- production-like validation.
- masked seed data.
- integration checks.
- migration rehearsal.
- rollback drill.

Allowed:

- deploy after CI.
- run real migrations against staging.
- use sandbox providers.
- use masked data only.

### Production

Purpose:

- real customer/school operations.

Allowed only after:

- CI passed.
- staging passed.
- smoke tests passed.
- rollback plan generated.
- backup verified.
- manual approval recorded.

## 6. Production Stop Conditions

Production deployment must stop if:

- CI failed.
- type check failed.
- security test failed.
- privacy test failed.
- migration check failed.
- rollback metadata missing.
- backup missing.
- smoke tests undefined.
- high-risk feature flags enabled without approval.
- secrets missing.
- production environment not protected.
- public route allow-list changed without approval.
- destructive migration present without approval.

## 7. Deployment Artifacts

Every deployment should produce:

- build artifact id.
- commit sha.
- release id.
- migration id list.
- feature flag diff.
- rollback file.
- smoke test result.
- approver id.
- deployed timestamp.
- production health result.

## 8. Recommended Implementation

Use GitHub Actions initially:

- `ci.yml`
- `staging-deploy.yml`
- `production-deploy.yml`
- `migration-check.yml`
- `rollback-drill.yml`
- `release-audit.yml`

Use protected GitHub environments:

- `staging`
- `production`

Production environment requires reviewers.
