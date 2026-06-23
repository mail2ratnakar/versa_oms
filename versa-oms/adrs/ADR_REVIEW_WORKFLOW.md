# ADR_REVIEW_WORKFLOW.md

## 1. Purpose

ADR review prevents future LLM prompts from reversing architecture decisions silently.

## 2. When to Create a New ADR

Create a new ADR when changing:

- stack.
- auth/session model.
- database/migration strategy.
- role/scope model.
- file storage and signed URL model.
- audit event model.
- worker queue model.
- feature flag strategy.
- public verification exposure.
- reports/exports policy.
- result/certificate versioning.
- deployment/rollback strategy.

## 3. When to Update an ADR

Update only for:

- typo correction.
- link correction.
- implementation note that does not change decision.

## 4. Superseding an ADR

If a decision changes:

1. Create new ADR.
2. Mark old ADR as `Superseded`.
3. Link new ADR in old ADR.
4. Add migration/rollback impact.
5. Update `ADR_REGISTER.json`.
6. Update `DECISION_MAP.json`.

## 5. Approval Requirement

High-risk ADR changes require human approval:

- auth.
- RBAC/RLS.
- database migration strategy.
- file storage.
- audit.
- results/certificates.
- public verification.
- deployment/rollback.

## 6. LLM Rule

The LLM must not make an architecture change in code unless the relevant ADR supports the change or a new ADR has been explicitly requested.
