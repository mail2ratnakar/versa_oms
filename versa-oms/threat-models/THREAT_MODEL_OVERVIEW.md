# THREAT_MODEL_OVERVIEW.md — Versa Olympiads Threat Model Pack

## 1. Purpose

This pack defines module-level threat models for the Versa Olympiads production build.

It must be used before implementing high-risk modules, API routes, public verification, exports, payments, exam material release, results, certificates and security audit.

## 2. Method

This pack uses:

- STRIDE for technical threat categories.
- LINDDUN-style privacy categories for privacy risks.
- Asset/trust-boundary analysis.
- Abuse cases.
- Security test mapping.
- Mitigation matrix.

## 3. Protected Assets

Highest-risk protected assets:

- staff sessions.
- school sessions.
- staff roles and scopes.
- student rosters.
- parent contacts.
- payment records.
- question papers.
- answer sheets.
- answer keys.
- OMR/import files.
- score batches.
- published results.
- certificates.
- private files.
- export files.
- audit events.
- security incidents.

## 4. Global Security Assumptions

- Browser-submitted role, scope, school_id, status, approval and payment state are never trusted.
- All staff routes require server-side role/scope guard.
- All school routes require own-school scope guard.
- All high-risk actions require reason and audit.
- Configured high-risk actions require maker-checker or dual approval.
- Sensitive files must be private.
- Signed URLs must be short-lived and audited.
- Public verification exposes minimal fields only.
- Audit events are append-only.
- Hard delete is forbidden for business/security/audit records.

## 5. Highest-Risk Domains

- Authentication and sessions.
- School scope isolation.
- Payments.
- Exam materials.
- Evaluation and results.
- Certificates and public verification.
- Reports and exports.
- Security audit.

## 6. Required Implementation Output

Every real module implementation must produce:

- threat mitigations wired in code.
- security tests.
- privacy tests.
- audit events.
- rollback handling.
- feature flag controls where high-risk.
