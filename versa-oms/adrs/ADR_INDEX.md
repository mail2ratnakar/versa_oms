# ADR_INDEX.md — Full Individual ADR Pack

Generated at: **2026-06-22T00:00:00+04:00**

## ADR List

| ADR | Title | Status | File |
|---|---|---|---|
| ADR-001 | Stack Choice | Accepted | `adrs/ADR-001-stack-choice.md` |
| ADR-002 | Authentication Model | Accepted | `adrs/ADR-002-auth-model.md` |
| ADR-003 | RBAC, RLS and Scope Model | Accepted | `adrs/ADR-003-rbac-rls-model.md` |
| ADR-004 | Database and Migration Strategy | Accepted | `adrs/ADR-004-database-and-migration-strategy.md` |
| ADR-005 | File Storage and Signed URL Strategy | Accepted | `adrs/ADR-005-file-storage-and-signed-url-strategy.md` |
| ADR-006 | Worker Queue Strategy | Accepted | `adrs/ADR-006-worker-queue-strategy.md` |
| ADR-007 | Audit Event Model | Accepted | `adrs/ADR-007-audit-event-model.md` |
| ADR-008 | Feature Flag Strategy | Accepted | `adrs/ADR-008-feature-flag-strategy.md` |
| ADR-009 | Reports and Export Security | Accepted | `adrs/ADR-009-reports-and-export-security.md` |
| ADR-010 | Public Verification Strategy | Accepted | `adrs/ADR-010-public-verification-strategy.md` |
| ADR-011 | Result and Certificate Versioning | Accepted | `adrs/ADR-011-result-and-certificate-versioning.md` |
| ADR-012 | Deployment and Rollback Strategy | Accepted | `adrs/ADR-012-deployment-and-rollback-strategy.md` |

## Usage Rule

Every future LLM coding or architecture step must check the relevant ADRs before changing stack, auth, RBAC, database, files, workers, audit, feature flags, exports, public verification, result/certificate versioning or deployment strategy.

## Supersession Rule

Do not edit an accepted ADR to hide a decision change. Create a new ADR and mark the old ADR as superseded.
