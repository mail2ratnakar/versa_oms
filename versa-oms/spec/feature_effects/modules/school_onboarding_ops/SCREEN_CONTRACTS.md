# School Onboarding Ops — Screen Contracts

## SCR-013 — School Onboarding Ops List

- Route: `/staff/school-onboarding-ops`
- Kind: `list`
- Description: Queue/list view with filters, status and actions
- Required data: actor session; module permission; module records; field masking profile; audit timeline for detail/action
- Required states: loading; empty; ready; validation_error; access_denied; server_error
- Required components: PageHeader; StatusBadge; Table/CardList; ActionPanel; AuditTimeline; EmptyState; ErrorState
- Must not show: raw private file URL; provider payload; raw OMR; answer key unless authorized; other-school records

## SCR-014 — School Onboarding Ops Detail

- Route: `/staff/school-onboarding-ops/[id]`
- Kind: `detail`
- Description: Detail view with safe summary, status, actions and audit timeline
- Required data: actor session; module permission; module records; field masking profile; audit timeline for detail/action
- Required states: loading; empty; ready; validation_error; access_denied; server_error
- Required components: PageHeader; StatusBadge; Table/CardList; ActionPanel; AuditTimeline; EmptyState; ErrorState
- Must not show: raw private file URL; provider payload; raw OMR; answer key unless authorized; other-school records

## SCR-015 — School Onboarding Ops Action

- Route: `/staff/school-onboarding-ops/[id]/actions/[action]`
- Kind: `action`
- Description: Action form/panel with validation, reason, approval and confirmation
- Required data: actor session; module permission; module records; field masking profile; audit timeline for detail/action
- Required states: loading; empty; ready; validation_error; access_denied; server_error
- Required components: PageHeader; StatusBadge; Table/CardList; ActionPanel; AuditTimeline; EmptyState; ErrorState
- Must not show: raw private file URL; provider payload; raw OMR; answer key unless authorized; other-school records
