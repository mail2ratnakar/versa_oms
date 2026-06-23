# SIGNED_URL_RESPONSE_CONVENTION.md

## Purpose

Sensitive files must never return raw private storage paths.

## Standard Response

```json
{
  "ok": true,
  "data": {
    "file_id": "uuid",
    "download_url": "https://signed-url",
    "expires_at": "2026-06-22T00:15:00+04:00",
    "ttl_seconds": 900,
    "disposition": "attachment",
    "content_type": "application/pdf"
  },
  "meta": {
    "request_id": "req_xxx",
    "audit_event_id": "aud_xxx"
  }
}
```

## Rules

- Signed URLs are short-lived.
- Every download is audited.
- URLs are generated only after permission check.
- Never log signed URLs.
- Revoke/expire URLs during rollback or incident.
