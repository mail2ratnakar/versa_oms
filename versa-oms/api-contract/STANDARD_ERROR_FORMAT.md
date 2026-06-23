# STANDARD_ERROR_FORMAT.md

## Error Envelope

All errors must use:

```json
{
  "ok": false,
  "error": {
    "code": "ACCESS_DENIED",
    "message": "Access denied.",
    "details": [],
    "field_errors": []
  },
  "meta": {
    "request_id": "req_xxx",
    "server_time": "2026-06-22T00:00:00+04:00",
    "module": "module_id"
  }
}
```

## Standard Error Codes

- `VALIDATION_FAILED`
- `AUTH_REQUIRED`
- `ACCESS_DENIED`
- `SCOPE_DENIED`
- `NOT_FOUND`
- `STATE_CONFLICT`
- `INVALID_TRANSITION`
- `IDEMPOTENCY_CONFLICT`
- `APPROVAL_REQUIRED`
- `MAKER_CHECKER_REQUIRED`
- `REASON_REQUIRED`
- `RATE_LIMITED`
- `SIGNED_URL_EXPIRED`
- `EXPORT_APPROVAL_REQUIRED`
- `FILE_PRIVATE`
- `SERVER_ERROR`

## Security Rule

Error responses must not leak stack traces, private file paths, provider payloads, SQL errors or secrets.
