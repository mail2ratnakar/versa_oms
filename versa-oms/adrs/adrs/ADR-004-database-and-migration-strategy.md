# ADR-004 — Database and Migration Strategy

## Status

Accepted

## Context

The system has many modules and high-risk records. LLMs may otherwise generate duplicate schemas or destructive migrations.

## Decision

Use a canonical schema registry, additive migrations first, no hard delete for business/audit records, lifecycle states instead of destructive removal, migration metadata and rollback/forward-fix planning.

## Options Considered

1. Canonical schema registry with additive migration rules.
2. Module-owned independent schemas without consolidation.
3. Ad-hoc migrations generated per prompt.
4. No migration discipline during MVP.

## Consequences

### Positive

- Prevents duplicate/conflicting tables.
- Improves production safety.
- Preserves audit/history.
- Supports controlled migration deployment.

### Negative

- Requires upfront schema discipline.
- Some cleanup operations require archive/void/supersede logic instead of delete.
- Migration generation must check registry.

## Security Impact

High. Migration changes touching roles, payments, materials, results, certificates or audit require review.

## Rollback Impact

Prefer forward-fix, old-column retention and feature flag rollback. Destructive rollback is discouraged.

## Related Files

- `DATABASE_SCHEMA_REGISTRY.json`
- `MIGRATION_DEPLOYMENT_PLAN.md`
- `ROLLBACK_PLAN.md`
- `rollback.schema.json`

## LLM Implementation Rule

Before changing implementation related to this ADR, the LLM must read this ADR, the linked control files and the latest completed-vs-pending summary. The LLM must not silently reverse this decision without creating a new ADR that supersedes it.
