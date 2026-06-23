# Prompt: Source-of-Truth to Module Registry

You are deriving a module registry from a source-of-truth CSV.

Rules:
- Every module must have module_id, module_name, owner, purpose, dependencies, provides and consumed_by.
- Use snake_case module IDs.
- Preserve generation order.
- Mark completed modules from current state if provided.
- Mark missing module specs as PENDING.
- Do not hallucinate completion status.
