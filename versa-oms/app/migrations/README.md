# Migrations

Rules:

- Use additive migrations first.
- Every migration needs rollback metadata.
- Destructive migrations require human approval.
- Prefer forward-fix for data transformations.
- Never hard delete business/audit records.
