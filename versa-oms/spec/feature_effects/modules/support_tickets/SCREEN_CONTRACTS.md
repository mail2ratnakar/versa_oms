# Support Tickets — Screen Contracts

## SCR-043 — Support Tickets List

- Route: `/staff/support-tickets`
- Kind: `list`
- Description: Queue/list view with filters, status and actions
- Required data: actor session; module permission; module records; field masking profile; audit timeline for detail/action
- Required states: loading; empty; ready; validation_error; access_denied; server_error
- Required components: PageHeader; StatusBadge; Table/CardList; ActionPanel; AuditTimeline; EmptyState; ErrorState
- Must not show: raw private file URL; provider payload; raw OMR; answer key unless authorized; other-school records

## SCR-044 — Support Tickets Detail

- Route: `/staff/support-tickets/[id]`
- Kind: `detail`
- Description: Detail view with safe summary, status, actions and audit timeline
- Required data: actor session; module permission; module records; field masking profile; audit timeline for detail/action
- Required states: loading; empty; ready; validation_error; access_denied; server_error
- Required components: PageHeader; StatusBadge; Table/CardList; ActionPanel; AuditTimeline; EmptyState; ErrorState
- Must not show: raw private file URL; provider payload; raw OMR; answer key unless authorized; other-school records

## SCR-045 — Support Tickets Action

- Route: `/staff/support-tickets/[id]/actions/[action]`
- Kind: `action`
- Description: Action form/panel with validation, reason, approval and confirmation
- Required data: actor session; module permission; module records; field masking profile; audit timeline for detail/action
- Required states: loading; empty; ready; validation_error; access_denied; server_error
- Required components: PageHeader; StatusBadge; Table/CardList; ActionPanel; AuditTimeline; EmptyState; ErrorState
- Must not show: raw private file URL; provider payload; raw OMR; answer key unless authorized; other-school records
