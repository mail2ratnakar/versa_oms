# Staff Portal UI Rules

## Purpose

The staff portal is the internal operations console.

## Design Rules

- Dense but readable.
- Use tables for operational queues.
- Use detail pages for high-risk workflows.
- Use drawers for safe previews.
- Show audit timeline on every sensitive detail page.
- Show owner and SLA where applicable.
- Show permission-gated actions.
- Show explicit state transitions.

## Staff UX Requirements

- Every queue must show status, owner, priority and updated time.
- Every high-risk action must show reason and approval panel.
- Every export must show sensitivity and approval state.
- Every file download must use signed download button.
- Every support view must use safe summary.
- Every security view must restrict raw details.

## Staff UI Must Not

- Expose raw private file URLs.
- Expose raw OMR in support.
- Expose answer keys outside authorized evaluation/results users.
- Allow status changes from plain dropdown without workflow guard.
- Hide approval requirement.
