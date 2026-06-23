# AUDIT_METADATA_CONVENTION.md

## Required Metadata for Writes

Every state-changing API must record:

- request_id.
- actor_id.
- actor_type.
- actor_role_snapshot.
- actor_scope_snapshot.
- source_module.
- entity_type.
- entity_id.
- action.
- previous_status.
- new_status.
- reason where required.
- ip/device metadata where available.
- created_at.

## High-Risk Actions

High-risk actions additionally require:

- approval_id.
- maker_checker_status.
- approver_id.
- approval_reason.
- rollback_reference.
