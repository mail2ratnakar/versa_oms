# TEST_STRATEGY.md — Versa Production Test Strategy

## Test Layers
- Unit: validators, permissions, state guards, masking, idempotency, signed URLs, feature flags.
- Integration: API + DB, auth, RLS, audit event creation, file privacy.
- E2E: staff login, school login, roster upload, finance gate, material release, evaluation, results, certificates, support, tasks, exports, audit.
- Security: cross-school access, disabled staff, role escalation, high-risk approval, sensitive export, signed URL expiry, raw audit restriction.
- Privacy: PII masking, support safe summary, evaluator candidate-ID view, courier no candidate mapping, public minimal fields.
- Regression: every bug fix must add a regression test.

## CI Gates
- lint
- typecheck
- unit tests
- changed-module integration tests
- security tests for changed guards
- privacy tests for changed masking/export/public routes
- migration validation
- rollback schema validation

## Required Seed Personas
super_admin, company_admin, operations_head, finance_admin, support_executive, evaluation_manager, results_approver, certificate_manager, school_coordinator, auditor, public_verifier.

## Production Smoke Tests
staff login, school login, dashboard, support ticket, internal task, safe report, audit event, public verification health check.
