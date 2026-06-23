# FILTERING_CONVENTION.md

## Filter Parameter

Use:

```text
?filter=<json-encoded-safe-filter>
```

## Allowed Filter Types

- `eq`
- `in`
- `contains`
- `date_range`
- `status`
- `module`
- `school`
- `exam_cycle`
- `priority`
- `risk_level`

## Rules

- Server validates allowed filter fields per route.
- Browser-submitted school_id is not trusted.
- Browser-submitted role/scope is not trusted.
- Large exports require filters.
- Sensitive filters require audit.
