# WORKER_QUEUE_IMPLEMENTATION.md — Versa Worker Queue Implementation

## Purpose

Workers handle asynchronous and long-running work that should not block UI/API requests.

Use workers for:

- exam material generation.
- material release-window scans.
- OMR/import validation.
- score batch generation.
- result generation.
- certificate generation.
- notification delivery/retries.
- export generation/expiry.
- support/task SLA scans.
- permission drift scans.
- audit hash verification.
- suspicious login scans.
- backup health checks.

## Core Rule

API routes should validate, authorize, enqueue and return quickly.

Workers should:

1. claim job.
2. verify idempotency.
3. reload source record.
4. recheck current lifecycle state.
5. recheck feature flag.
6. execute work through source-module service.
7. write output.
8. write job event and audit event.
9. mark success/failure.

## Worker Must Not

- trust payload as source of truth.
- log secrets.
- log signed URLs.
- expose private storage paths.
- overwrite published results.
- hard delete business/audit records.
- skip audit for high-risk jobs.
