# PRIVACY_SAFE_LOGGING_POLICY.md

## 1. Purpose

Logs must help engineering diagnose issues without leaking sensitive student, school, payment, exam, result, certificate or audit data.

## 2. Forbidden in Application Logs

Never log:

- passwords.
- session tokens.
- magic-link tokens.
- OTPs.
- signed URLs.
- private file paths.
- parent phone full value.
- parent email full value where not necessary.
- raw OMR.
- answer keys.
- full payment provider payload.
- payment secrets.
- webhook signatures.
- raw certificate file URL.
- raw audit snapshots.
- internal investigation notes.
- secrets or environment variable values.

## 3. Allowed Safe Context

Allowed:

- request id.
- correlation id.
- module id.
- entity id where not sensitive.
- masked school code.
- candidate id only where authorized.
- job id.
- job type.
- error code.
- lifecycle status.
- duration.
- queue id.
- release id.

## 4. Redaction Rules

- Apply redaction before writing logs.
- Redaction must run on both request bodies and error contexts.
- Unknown fields in sensitive modules should be redacted by default.
- Signed URL regex detection must replace value with `[REDACTED_SIGNED_URL]`.

## 5. LLM Rule

The LLM must not add `console.log(payload)` or equivalent for sensitive workflows.
