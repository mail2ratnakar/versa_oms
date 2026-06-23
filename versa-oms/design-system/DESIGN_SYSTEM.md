# DESIGN_SYSTEM.md — Versa Olympiads Design System Implementation Guide

## 1. Purpose

This design system is for a production-grade Olympiad operations platform with three user surfaces:

- Company/staff operations console.
- School portal.
- Public verification screens.

The UI must support heavy reading, complex workflows, role-scoped views, approvals, audit trails, sensitive data, exports and operational exceptions.

## 2. Design Principles

- Calm before colorful.
- Data clarity over decorative UI.
- Status must be obvious.
- High-risk actions must look different from ordinary actions.
- Mask sensitive data by default.
- Every page must explain what the user can do next.
- All modules should feel like one product.
- Tables must be readable.
- Forms must be safe.
- Errors must be actionable.
- Mobile must work for school users and basic staff review.

## 3. Visual Tone

- Clean operational interface.
- Light background.
- White cards.
- Soft borders.
- Conservative shadows.
- Blue reserved mostly for brand, focus and primary actions.
- Risk/status colors reserved for meaning.
- No excessive gradients.
- No dense decorative glass unless used subtly.

## 4. Typography

- Use Inter or system sans-serif.
- Keep body text at 14–16px.
- Use 12px only for metadata, labels and badges.
- Use clear heading hierarchy:
  - Page title: 24–30px.
  - Section title: 18–20px.
  - Card title: 16px semibold.
  - Table text: 14px.
- Avoid cramped paragraphs.
- Use sentence case for labels.

## 5. Layout

- Staff portal uses a persistent left sidebar.
- School portal can use left sidebar on desktop and bottom/compact nav on mobile.
- Page header must include title, description, breadcrumbs and primary actions.
- Main content max width: 1440px.
- Use grid only when it improves scanning.
- Use tabs for same-entity views.
- Use drawers for preview/detail.
- Use modals only for small decisions.
- Use full pages for serious workflows.

## 6. Status Language

Use consistent lifecycle labels.

Examples:

- Draft
- Submitted
- Under review
- Approved
- Active
- Blocked
- Locked
- Generated
- Released
- Published
- Withheld
- Revoked
- Superseded
- Archived

Do not invent synonyms like “done”, “complete”, “ready” unless defined.

## 7. High-Risk Action UI

High-risk actions must include:

- warning callout.
- reason field.
- expected impact.
- affected module/entity.
- approval requirement.
- maker-checker status.
- audit note.
- rollback note if relevant.

Examples:

- material release.
- result publication.
- certificate revocation.
- sensitive export.
- staff role change.
- manual payment confirmation.

## 8. Privacy UI

Sensitive values must use:

- masked display.
- reveal only with permission.
- reveal reason where required.
- audit event when revealed.
- never reveal private file URL.

Examples:

- parent phone.
- parent email.
- payment reference.
- audit snapshots.
- raw OMR.
- answer keys.
- provider payloads.

## 9. Accessibility

- Keyboard accessible controls.
- Visible focus ring.
- Color is never the only indicator.
- Labels for all inputs.
- ARIA labels for icon-only buttons.
- Table headers must be semantic.
- Modals trap focus.
- Error messages announced near field.

## 10. Implementation Rule for LLM

Before building UI for a module, the LLM must read:

1. `DESIGN_SYSTEM.md`
2. `tokens/DESIGN_TOKENS.json`
3. `components/COMPONENT_INVENTORY.json`
4. `navigation/ROLE_AWARE_NAVIGATION.json`
5. current module spec
6. security/privacy matrices
