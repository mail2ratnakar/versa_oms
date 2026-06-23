# PAGINATION_CONVENTION.md

## Query Parameters

- `page`
- `page_size`
- `cursor`
- `sort`

## Defaults

- `page = 1`
- `page_size = 25`
- max `page_size = 100`

## Response

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "page_size": 25,
    "total_count": 0,
    "has_next": false,
    "next_cursor": null
  }
}
```

## Rules

- Use cursor pagination for large event/audit/export tables.
- Use page pagination for small admin lists.
- Always enforce role/scope before count.
