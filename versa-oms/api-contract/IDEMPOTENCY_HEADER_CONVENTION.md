# IDEMPOTENCY_HEADER_CONVENTION.md

## Header

`X-Idempotency-Key`

## Required For

- All POST routes that create records.
- All POST transition routes.
- All approval/rejection routes.
- All file generation routes.
- All export generation routes.
- All notification send routes.
- All payment/manual confirmation routes.
- All result/certificate publication routes.

## Key Format

Recommended:

```text
<module_id>:<operation>:<actor_id>:<source_entity_id>:<client_nonce>
```

## Server Behavior

- Same key + same payload returns same result.
- Same key + different payload returns `IDEMPOTENCY_CONFLICT`.
- Idempotency keys expire by policy.
- Idempotency must be server-side.
