# ADR-012 — Deployment and Rollback Strategy

## Status

Accepted

## Context

The project is LLM/vibe-code accelerated, so delivery controls must prevent accidental production damage.

## Decision

Use CI checks, staging deployment, protected production approval, conservative production feature flags, migration checks, backup verification, smoke tests, release metadata and rollback drills.

## Options Considered

1. Controlled CI/CD with staging and rollback drills.
2. Manual deploys from local machine.
3. Auto-deploy every merge to production.
4. No formal rollback process until later.

## Consequences

### Positive

- Reduces deployment risk.
- Improves production traceability.
- Supports rollback readiness.
- Enforces testing and review gates.

### Negative

- More setup before production.
- Manual production approval slows release slightly.
- Requires maintaining CI workflows.

## Security Impact

High. Production deployment must not bypass security/privacy checks or enable high-risk flags without approval.

## Rollback Impact

Rollback uses feature flags first, then code rollback, then migration forward-fix/rollback depending on risk.

## Related Files

- `DEPLOYMENT_PLAN.md`
- `CI_CD_PIPELINE.md`
- `PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- `ROLLBACK_DRILL_RUNBOOK.md`

## LLM Implementation Rule

Before changing implementation related to this ADR, the LLM must read this ADR, the linked control files and the latest completed-vs-pending summary. The LLM must not silently reverse this decision without creating a new ADR that supersedes it.
