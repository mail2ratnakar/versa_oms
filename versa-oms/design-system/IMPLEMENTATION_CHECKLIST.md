# Design System Implementation Checklist

## Before building module UI

- [ ] Read `DESIGN_SYSTEM.md`.
- [ ] Import `tokens/tokens.css`.
- [ ] Check `components/COMPONENT_INVENTORY.json`.
- [ ] Check `navigation/ROLE_AWARE_NAVIGATION.json`.
- [ ] Check module spec.
- [ ] Check RLS and field masking matrix.
- [ ] Identify high-risk actions.
- [ ] Identify sensitive fields.
- [ ] Identify empty/error/loading states.
- [ ] Identify mobile behavior.

## For every page

- [ ] Page header exists.
- [ ] Status is visible.
- [ ] Primary action is clear.
- [ ] Permission state is handled.
- [ ] Loading state exists.
- [ ] Empty state exists.
- [ ] Error state exists.
- [ ] Mobile behavior defined.
- [ ] No sensitive field leaks.
- [ ] Server rechecks permission.

## For every high-risk action

- [ ] Reason required.
- [ ] Impact warning shown.
- [ ] Approval/maker-checker panel shown.
- [ ] Audit note shown.
- [ ] Rollback/supersede note shown where relevant.
- [ ] Confirmation is explicit.

## For every table

- [ ] Safe filters only.
- [ ] Pagination.
- [ ] Status badge.
- [ ] Row actions permission-gated.
- [ ] Sensitive values masked.
- [ ] Export action gated.
