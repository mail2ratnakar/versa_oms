# ADR-008 — Feature Flag Strategy

## Status

Accepted

## Context

The system includes risky features such as material release, result publication, public verification, bulk notifications and sensitive exports.

## Decision

Use feature flags for high-risk features and production kill switches. Production defaults are conservative; high-risk features remain disabled until explicitly approved.

## Options Considered

1. Feature flags and kill switches.
2. Deploy code only when ready with no flags.
3. Environment variables only with no audit.
4. Manual code rollback for every issue.

## Consequences

### Positive

- Safer staged rollout.
- Fast containment during incidents.
- Supports rollback without redeploy.
- Matches production readiness strategy.

### Negative

- Flag sprawl risk.
- Need audit and ownership for flag changes.
- UI must handle disabled states.

## Security Impact

High. Public/exam/payment/result/export flags require approval and audit.

## Rollback Impact

First rollback option is usually disabling the relevant feature flag.

## Related Files

- `FEATURE_FLAGS.json`
- `PRODUCTION_FEATURE_FLAG_DEFAULTS.json`
- `ROLLBACK_PLAN.md`

## LLM Implementation Rule

Before changing implementation related to this ADR, the LLM must read this ADR, the linked control files and the latest completed-vs-pending summary. The LLM must not silently reverse this decision without creating a new ADR that supersedes it.
