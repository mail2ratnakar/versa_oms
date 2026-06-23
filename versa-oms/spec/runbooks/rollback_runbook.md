# Rollback Runbook

Rollback policy generated from runbook/deployment rows.

| question_id | section | module | question | answer | test_instruction |
|---|---|---|---|---|---|
| 19.025 | 19 Build Instructions and Runbook | no_unapproved_delete | What guardrail 'no_unapproved_delete' applies to Codex autopilot? | Codex must not delete collections, fields, permissions or files without explicit approval. | Review runbook contains guardrail no_unapproved_delete. |
| 20.016 | 20 Deployment and Operations Runbook | restore_drill | What deployment/operations item 'restore_drill' is required? | Before go-live, document how to restore schema/data/files into staging and verify a sample school journey. | Deployment checklist verifies restore_drill. |
| 20.021 | 20 Deployment and Operations Runbook | rollback_plan | What deployment/operations item 'rollback_plan' is required? | Keep previous deployment package/commit; rollback frontend independently of Directus schema when possible; schema migrations need rollback notes. | Deployment checklist verifies rollback_plan. |
| 20.022 | 20 Deployment and Operations Runbook | schema_migration_policy | What deployment/operations item 'schema_migration_policy' is required? | Every schema change requires migration note, impact analysis, backup/checkpoint and rollback approach. | Deployment checklist verifies schema_migration_policy. |
| 20.042 | 20 Deployment and Operations Runbook | gl_backup_ready | What go-live check 'gl_backup_ready' must pass? | Backup/export and restore plan documented and checked. | Confirm checklist item gl_backup_ready before production launch. |
