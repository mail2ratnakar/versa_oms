# TRACE_PLAN.md

## Purpose

Tracing connects API, service, worker, storage and provider operations.

## Required Spans Later

- HTTP request span.
- auth/session span.
- RBAC/scope guard span.
- database query span.
- file storage span.
- signed URL generation span.
- queue enqueue span.
- worker job span.
- provider API span.
- audit writer span.

## Correlation

Every trace should include:

- request id.
- correlation id.
- module id.
- entity id where safe.
- job id where applicable.
- release id.

## Privacy

Do not put raw payloads into span attributes.
