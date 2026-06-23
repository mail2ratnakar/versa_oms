# Empty, Error and Loading States

## Empty State

Must include:

- plain explanation.
- next action.
- permission hint if no action available.
- link to help/support where useful.

## Error State

Must include:

- non-technical message.
- error code.
- request id.
- safe retry action.
- support path.
- no stack trace.
- no SQL/provider payload.

## Loading State

Use skeletons for:

- tables.
- cards.
- detail pages.
- dashboard widgets.

Avoid spinners only for long screens.

## Access Denied State

Must include:

- reason category.
- module name.
- request id.
- ask admin/support instruction.
- no sensitive record existence leak.
