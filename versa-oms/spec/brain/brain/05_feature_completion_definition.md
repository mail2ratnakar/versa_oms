# 05 — Feature Completion Definition

## Completion Levels

### 1. Spec-complete

The feature has:

- noun/entity.
- states.
- actions.
- effect chain.
- screen contract.
- journey test.

No code required yet.

### 2. Scaffold-complete

The feature has:

- route placeholders.
- page placeholders.
- schema placeholders.
- test placeholders.

Not functionally complete.

### 3. Local-functional

The feature works locally with real service logic but may use dev auth, local DB or mock infra.

Not staging-ready.

### 4. Staging-ready

The feature works against real staging infra:

- real DB.
- real auth.
- real storage where required.
- migrations applied.
- tests pass.
- CI passes.

### 5. Production-ready

The feature is staging-ready plus:

- monitoring.
- alerts.
- security hardening.
- rollback.
- production feature flags.
- no critical/high gaps.

## Completion Rule

A feature is complete only if:

```text
screen + action + API + DB + effect + audit + security + journey test
```

are all present.

## Not Complete If

- API route exists but no screen.
- screen exists but no DB persistence.
- DB changes but no downstream effect.
- downstream effect exists but no audit.
- audit exists but no journey test.
- local demo works but real infra absent.
