# WORKER_JOB_PLAN.md — Versa Worker and Background Job Plan

## Job Categories
- Generation: exam materials, certificates, reports, QR codes.
- Delivery: notifications, email, in-app, retries.
- Scans: SLA, permission drift, access review, export retention, suspicious login.
- Imports: roster validation, OMR import, evaluation scoring, lead import.
- Security: audit hash verification, failed login aggregation, suspicious export detection.

## Worker Queues
- default
- high_priority
- critical_approval
- notifications
- exports
- materials
- evaluation
- certificates
- security
- maintenance

## Job Rules
Every job must have idempotency key, owner module, status, audit event, capped retry, failure visibility and dead-letter behavior. Critical failed jobs create work-queue tasks.

## Security
Workers run server-side only, use system identity, obey source-module policies, write audit events, store generated files privately and never log secrets or sensitive payloads.
