# Form Rules

## Form Structure

- Group fields into sections.
- Use clear labels.
- Show help text for operational terms.
- Show validation near fields.
- Preserve user input on validation errors.
- Avoid long single-column forms when groups help comprehension.

## Required Safety Controls

- High-risk forms require `ReasonBox`.
- Approval forms require maker-checker information.
- File upload forms must show privacy and retention note.
- Payment/manual confirmation forms must show amount source as server-calculated.
- Result/certificate forms must show impact warning.

## Required States

- pristine.
- editing.
- validating.
- saving.
- saved.
- failed.
- blocked by permission.
- blocked by lifecycle state.

## Forbidden

- Do not let user type server-controlled status.
- Do not let user type role/scope as free text.
- Do not let browser provide approval state.
- Do not show hidden fields in the DOM for sensitive values.
