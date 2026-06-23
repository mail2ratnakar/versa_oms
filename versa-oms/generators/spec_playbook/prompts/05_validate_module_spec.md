# Prompt: Validate Module Spec

Validate the generated module spec.

Fail if:
- required files are missing
- JSON is invalid
- module.json lacks metadata
- schema.json has no collections
- permissions.json has no deny-by-default/default policy
- security.json has no hardening checklist
- lifecycle_states.json has no statuses
- dependency_map.json has no depends_on/provides_to
- tests.json has no regression test
- runbook.md lacks stop conditions
- final_modular_design.md is empty
- output is merely a CSV-row wrapper
