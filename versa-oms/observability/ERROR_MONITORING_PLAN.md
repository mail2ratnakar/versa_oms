# ERROR_MONITORING_PLAN.md

## Error Event Fields

- error id.
- timestamp.
- level.
- module id.
- route.
- request id.
- correlation id.
- actor type.
- safe actor id.
- release id.
- error code.
- safe message.
- stack trace in non-production or protected production tooling only.

## Grouping

Group errors by:

- error code.
- module id.
- route.
- job type.
- release id.

## Rules

- Do not send secrets to external monitoring.
- Redact request body.
- Redact headers.
- Redact signed URLs.
- Mask contact/payment data.
- Attach request id for support.

## Release Monitoring

After production deploy:

- monitor API errors.
- monitor login failures.
- monitor worker DLQ.
- monitor audit writer.
- monitor public verification.
- monitor feature flag state.
