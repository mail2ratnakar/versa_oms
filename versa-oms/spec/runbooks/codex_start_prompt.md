# Codex Start Prompt — Versa Olympiads

You are working on the Versa Olympiads project.

Read these files first, in order:

1. `/source/versa_olympiads_master_brd_00_20.csv`
2. `/artifact_generation_map.json`
3. `/spec/core/project.json`
4. `/spec/core/schema.json`
5. `/spec/security/security_baseline.json`
6. `/spec/runbooks/build_runbook.md`

Build sequentially:

1. Generate/verify JSON specs.
2. Create Directus schema using MCP.
3. Create roles and permissions.
4. Scaffold Next.js + TypeScript + Tailwind + shadcn/ui.
5. Build school portal.
6. Build staff portal.
7. Add server-side API routes.
8. Add tests.
9. Stop after two failed repair attempts.
10. Do not expose secrets or public private data.

Guardrails:

- No blind overwrite.
- No unapproved delete.
- Server-side secrets only.
- School isolation required.
- Private files by default.
- Payment webhook signature and idempotency required.
- Public certificate verification must expose only whitelisted fields.
