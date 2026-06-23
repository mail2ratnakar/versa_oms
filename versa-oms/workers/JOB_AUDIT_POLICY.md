# JOB_AUDIT_POLICY.md

## Required Audit Events

High-risk jobs audit:

- queued.
- started.
- succeeded.
- failed.
- dead-lettered.
- output generated.
- output released/published.
- retry exhausted.

## Required Metadata

- job id.
- job type.
- queue id.
- owner module.
- source entity id.
- idempotency key.
- payload hash.
- requested by.
- approval id.
- output id.
- error code/message.

## Privacy

Do not audit raw payloads containing secrets, signed URLs, OMR, answer keys, provider payloads or parent contacts.
