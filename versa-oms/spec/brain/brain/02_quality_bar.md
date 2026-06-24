# 02 — Quality Bar

## Feature Quality Bar

A feature is complete only when all are true:

- user can see it.
- user can act on it.
- API/service works.
- database persists it.
- status changes correctly.
- downstream effects happen.
- audit is written.
- permissions work.
- sensitive data is protected.
- journey test proves it.

## Module Quality Bar

A module is complete only when:

- list screen exists.
- detail screen exists.
- action screen/form exists.
- server routes exist.
- service layer exists.
- validation exists.
- permissions exist.
- field masking exists.
- write actions are idempotent.
- high-risk actions are gated.
- audit timeline exists where relevant.
- module journey tests pass.

## System Quality Bar

The system is staging-ready only when:

- real git repo exists.
- real database is wired.
- migrations are applied.
- real auth is wired.
- dev fallback is disabled.
- private storage is wired.
- signed URLs are real.
- CI passes.
- journey tests pass.
- security/privacy tests pass.
- observability health endpoints exist.

## Production Quality Bar

The system is production-ready only when staging-ready plus:

- production secrets managed.
- production feature flags conservative.
- rollback tested.
- monitoring/alerts live.
- backup/restore verified.
- rate limits active.
- audit immutability enforced.
- no known critical/high gaps.

## Project Exception (testing phase) — APPROVED

While the project is in the **local-functional / staging-candidate** phase, the dev-auth fallback is a
**founder-approved exception** so the app and journey tests are usable before real sign-in exists:

```text
ALLOW_DEV_AUTH=true        # versa-oms/app/.env.local — resolves the SYSTEM staff actor; no sign-in flow yet
```

This is NOT a violation during testing. It MUST be removed (dev fallback disabled + real Supabase sign-in wired)
before claiming **staging-ready** or **production-ready**. Until then the honest label is local-functional /
staging-candidate.

## Forbidden Completion Claims

Do not claim:

```text
complete
production-ready
staging-ready
fully wired
secure
```

unless evidence supports it.

Use accurate labels:

```text
spec-complete
scaffold-complete
local-functional
staging-candidate
staging-ready
production-candidate
production-ready
```
