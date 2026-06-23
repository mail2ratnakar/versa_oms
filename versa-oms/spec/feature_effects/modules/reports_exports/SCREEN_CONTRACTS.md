# Reports & Exports — Screen Contracts

## SCR-049 — Reports & Exports List

- Route: `/staff/reports-exports`
- Kind: `list`
- Description: Queue/list view with filters, status and actions
- Required data: actor session; module permission; module records; field masking profile; audit timeline for detail/action
- Required states: loading; empty; ready; validation_error; access_denied; server_error
- Required components: PageHeader; StatusBadge; Table/CardList; ActionPanel; AuditTimeline; EmptyState; ErrorState
- Must not show: raw private file URL; provider payload; raw OMR; answer key unless authorized; other-school records

## SCR-050 — Reports & Exports Detail

- Route: `/staff/reports-exports/[id]`
- Kind: `detail`
- Description: Detail view with safe summary, status, actions and audit timeline
- Required data: actor session; module permission; module records; field masking profile; audit timeline for detail/action
- Required states: loading; empty; ready; validation_error; access_denied; server_error
- Required components: PageHeader; StatusBadge; Table/CardList; ActionPanel; AuditTimeline; EmptyState; ErrorState
- Must not show: raw private file URL; provider payload; raw OMR; answer key unless authorized; other-school records

## SCR-051 — Reports & Exports Action

- Route: `/staff/reports-exports/[id]/actions/[action]`
- Kind: `action`
- Description: Action form/panel with validation, reason, approval and confirmation
- Required data: actor session; module permission; module records; field masking profile; audit timeline for detail/action
- Required states: loading; empty; ready; validation_error; access_denied; server_error
- Required components: PageHeader; StatusBadge; Table/CardList; ActionPanel; AuditTimeline; EmptyState; ErrorState
- Must not show: raw private file URL; provider payload; raw OMR; answer key unless authorized; other-school records

## SCR-052 — Report Catalog

- Route: `/staff/reports-exports/catalog`
- Kind: `catalog`
- Description: Safe reports and export request entry
- Required data: actor session; module permission; module records; field masking profile; audit timeline for detail/action
- Required states: loading; empty; ready; validation_error; access_denied; server_error
- Required components: PageHeader; StatusBadge; Table/CardList; ActionPanel; AuditTimeline; EmptyState; ErrorState
- Must not show: raw private file URL; provider payload; raw OMR; answer key unless authorized; other-school records
