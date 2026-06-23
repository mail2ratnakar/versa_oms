# WORKER_SECURITY_POLICY.md

## Worker Security Rules

- Workers run server-side only.
- Workers use system identity.
- Workers reload source records.
- Workers call source-module services.
- Workers enforce feature flags.
- Workers do not log secrets or signed URLs.
- Workers do not write public file URLs.
- Workers do not overwrite published result/certificate records.
- Workers do not hard delete business/audit records.

## Incident Triggers

Create incident if:

- high-risk idempotency conflict occurs.
- cross-school write attempted.
- signed URL/private path leak detected.
- audit hash verification fails.
- worker receives invalid high-risk payload.
