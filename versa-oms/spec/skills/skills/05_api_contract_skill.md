# 05 — API Contract Skill

## Purpose

Keeps routes, schemas, envelopes, errors, pagination, filtering, idempotency and public/private routing aligned to API contracts.

## Must Read Before Acting

- `openapi.json`
- `REQUEST_RESPONSE_SCHEMAS.json`
- `STANDARD_ERROR_FORMAT.md`
- `IDEMPOTENCY_HEADER_CONVENTION.md`
- `PUBLIC_PRIVATE_ROUTE_ALLOWLIST.json`

## Checks

- route exists
- method correct
- request schema valid
- standard envelope
- write route requires idempotency
- errors standardized
- allowlist respected

## Failure Signals

- route differs from OpenAPI
- raw DB record returned
- custom error format

## Operating Rule

Before coding, state which inputs were read for this skill and which checks are satisfied. If any check cannot be satisfied, stop and report the gap instead of improvising.

## Completion Rule

This skill is complete only when the relevant implementation has evidence: files changed, tests run, outputs produced and completed/pending summary updated.
