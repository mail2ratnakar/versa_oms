# SECRETS_MANAGEMENT.md

## 1. Purpose

Secrets must be environment-specific and never committed.

## 2. Secret Locations

Use GitHub Environment Secrets for:

- staging.
- production.

Use local `.env` only for development.

## 3. Secret Classes

### Critical

- `DATABASE_URL`
- `SESSION_SECRET`
- `INTERNAL_API_SECRET`
- payment gateway secrets.
- storage secrets.
- provider webhook secrets.

### High

- email/SMS/WhatsApp provider keys.
- error monitoring DSN.
- signed URL key where applicable.

## 4. Rotation Rules

Rotate secrets when:

- staff with access exits.
- security incident occurs.
- accidental exposure occurs.
- provider credential is changed.
- production access is restructured.

## 5. Logging Rules

Never log:

- secrets.
- tokens.
- signed URLs.
- webhook signatures.
- session cookies.
- magic-link tokens.
- provider payload secrets.

## 6. LLM Rule

LLM must never generate real secrets. Use placeholders only.
