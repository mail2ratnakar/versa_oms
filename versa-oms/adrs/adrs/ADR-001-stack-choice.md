# ADR-001 — Stack Choice

## Status

Accepted

## Context

Versa Olympiads needs a school portal, internal staff portal, API layer, private file workflows, auditability, testability and LLM-readable structure. The user prefers practical vibe-coding and minimal local complexity while still requiring production controls.

## Decision

Use a TypeScript-first web application skeleton based on Next.js App Router conventions, with PostgreSQL-compatible schema planning, private object storage, GitHub Actions CI/CD and JSON/Markdown spec-control artifacts.

## Options Considered

1. Next.js full-stack app with API routes and server utilities.
2. Separate React frontend and custom Node/Express backend.
3. Directus-first backend with custom frontend.
4. Supabase-first backend with custom frontend.
5. Odoo/low-code-first build.

## Consequences

### Positive

- One repo can hold app, APIs, server utilities, tests and control packs.
- TypeScript improves LLM code generation consistency.
- Next.js route structure maps well to staff/school/public surfaces.
- Can still integrate Supabase, Directus or custom Postgres later.

### Negative

- Exact database/backend choice remains to be finalized before production.
- Large monorepo can become messy without strict repo structure.
- App Router/server action boundaries need discipline.

## Security Impact

Stack must support server-side auth/role/scope checks, private storage, audit writer and protected APIs. Browser-submitted role, school_id, status and approval values remain forbidden.

## Rollback Impact

Stack choice is high-cost to reverse after real module implementation. Before business-code build, it remains reversible.

## Related Files

- `REPO_STRUCTURE.md`
- `DEPLOYMENT_PLAN.md`
- `API_CONTRACT_PLAN.md`
- `openapi.json`

## LLM Implementation Rule

Before changing implementation related to this ADR, the LLM must read this ADR, the linked control files and the latest completed-vs-pending summary. The LLM must not silently reverse this decision without creating a new ADR that supersedes it.
