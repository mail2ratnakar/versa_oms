# Versa Olympiads — Working App Skeleton

Generated at: 2026-06-22T00:00:00+04:00

This repository scaffold is the first working implementation shell for the Versa Olympiads production build.

It is intentionally a **safe skeleton**, not a full feature implementation. It establishes the app layout, route groups, server module boundaries, database/migration folders, test folders, deployment folders and control-artifact import locations.

## What this pack gives you

- Next.js App Router style app skeleton.
- Staff portal route skeletons.
- School portal route skeletons.
- Public verification route skeleton.
- API health route.
- Staff API module route skeletons.
- Shared server guards.
- Audit writer stub.
- Idempotency utility stub.
- Signed URL utility stub.
- Feature flag utility stub.
- Module service/validator/permission/audit stubs.
- Test folder structure.
- Migration folder structure.
- Seed folder structure.
- Deployment folder structure.
- Control pack import folders.
- Running completed-vs-pending summary.

## What this pack does not yet do

- It does not implement full business workflows.
- It does not connect to a real database yet.
- It does not run real auth yet.
- It does not implement full RBAC/RLS yet.
- It does not implement production CI/CD yet.
- It does not include real seed/mock data yet.
- It does not include the final design system yet.

## Recommended next prompt

Generate the **Seed and Mock Data Pack** next.

## Minimal local run after merging into a repo

```bash
npm install
npm run dev
```

## LLM rule

Before coding in this repo, the LLM must read:

1. `/build/BUILD_PLAN.md`
2. `/build/AUTOPILOT.md`
3. `/build/IMPLEMENTATION_MANIFEST.json`
4. `/build/BUILD_ORDER.json`
5. `/implementation/DATABASE_SCHEMA_REGISTRY.json`
6. `/implementation/RLS_POLICY_MATRIX.json`
7. `/api-contract/openapi.json`
8. current module spec under `/spec/modules/<module_id>/`
