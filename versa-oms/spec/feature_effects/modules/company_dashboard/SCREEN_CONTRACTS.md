# Company Dashboard — Screen Contracts

## SCR-001 — Company Dashboard

- Route: `/staff/dashboard`
- Kind: `dashboard`
- Description: Command center with safe summary widgets
- Required data: actor session; module permission; module records; field masking profile; audit timeline for detail/action
- Required states: loading; empty; ready; validation_error; access_denied; server_error
- Required components: PageHeader; StatusBadge; Table/CardList; ActionPanel; AuditTimeline; EmptyState; ErrorState
- Must not show: raw private file URL; provider payload; raw OMR; answer key unless authorized; other-school records

## SCR-002 — Dashboard Alerts

- Route: `/staff/dashboard/alerts`
- Kind: `alerts`
- Description: Alert and incident summary panel
- Required data: actor session; module permission; module records; field masking profile; audit timeline for detail/action
- Required states: loading; empty; ready; validation_error; access_denied; server_error
- Required components: PageHeader; StatusBadge; Table/CardList; ActionPanel; AuditTimeline; EmptyState; ErrorState
- Must not show: raw private file URL; provider payload; raw OMR; answer key unless authorized; other-school records
