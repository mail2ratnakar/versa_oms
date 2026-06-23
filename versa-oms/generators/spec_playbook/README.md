# Versa Spec Playbook Generator v1.0

Reusable generator for converting a brief scope into:

```text
Scope
  → Questionnaire
  → Answers
  → Source-of-truth CSV
  → Module Registry
  → 14-parameter semantic module specs
  → Validation
  → ZIP package
  → Completed/Pending Summary
```

This kit is designed so the process survives long chats, lost LLM memory, changed LLMs, and Codex restarts.

---

## Current frozen company portal state

Completed modules:

1. company_dashboard
2. staff_users
3. roles_permissions
4. school_crm
5. school_onboarding_ops
6. student_roster_ops
7. finance_ops

Pending modules:

1. exam_slot_ops
2. exam_material_ops
3. courier_ops
4. evaluation_ops
5. results_ops
6. certificate_ops
7. notification_ops
8. support_tickets
9. task_work_queue
10. reports_exports
11. admin_settings
12. security_audit_console

Next recommended module:

```text
exam_slot_ops
```

---

## Critical rule

Generated specs must be **semantic compiled specs**, not JSON wrappers around CSV rows.

Wrong:

```json
{"rows": [...]}
```

Right:

```text
module.json
schema.json
workflows.json
messages.json
validations.json
screens.json
permissions.json
security.json
data_classification.json
access_matrix.json
dependency_map.json
lifecycle_states.json
change_control.json
versioning_policy.json
feature_request_template.json
bug_fix_template.json
tests.json
runbook.md
final_modular_design.md
```

---

## 14-parameter semantic spec playbook

Every module must include:

1. Modular spec structure
2. Module metadata
3. Feature continuity
4. Bug-fix continuity
5. Dependency mapping
6. Lifecycle states
7. Security hardening
8. Data classification
9. Access matrix
10. Change-control rules
11. Versioning rules
12. Runbook continuity
13. Security hardening checklist
14. Final modular design

The frozen config is here:

```text
config/playbook_14_parameters.json
```

---

## Quick start

From this folder:

```bash
python scripts/generate_questionnaire.py --scope inputs/scope.md
```

```bash
python scripts/answer_questionnaire_with_llm.py --mode hybrid
```

```bash
python scripts/build_source_of_truth_csv.py
```

```bash
python scripts/generate_module_spec.py --module exam_slot_ops --zip
```

```bash
python scripts/validate_module_spec.py --module exam_slot_ops
```

```bash
python scripts/package_module_zip.py --module exam_slot_ops
```

```bash
python scripts/update_completed_pending_summary.py --extra-completed company_dashboard,staff_users,roles_permissions,school_crm,school_onboarding_ops,student_roster_ops,finance_ops,exam_slot_ops
```

---

## One-command module generation

```bash
python scripts/run_pipeline.py --mode module --module exam_slot_ops
```

---

## Continue pending modules

Generate one next pending module from the frozen state:

```bash
python scripts/continue_pending_modules.py --limit 1
```

Generate three pending modules:

```bash
python scripts/continue_pending_modules.py --limit 3
```

---

## Folder structure

```text
config/
  playbook_14_parameters.json
  module_spec_required_files.json
  questionnaire_schema.json
  source_of_truth_schema.json
  module_registry_schema.json
  default_pipeline_config.json

inputs/
  scope.md
  module_registry.csv

prompts/
  01_scope_to_questionnaire.md
  02_answers_to_source_of_truth_csv.md
  03_source_to_module_registry.md
  04_generate_module_spec.md
  05_validate_module_spec.md
  06_completed_pending_summary.md

scripts/
  common.py
  llm_client.py
  generate_questionnaire.py
  answer_questionnaire_with_llm.py
  build_source_of_truth_csv.py
  build_module_registry.py
  generate_module_spec.py
  validate_module_spec.py
  update_completed_pending_summary.py
  package_module_zip.py
  package_all_modules_zip.py
  run_pipeline.py
  continue_pending_modules.py

templates/
  json/
  markdown/

state/
  current_company_portal_state.json
  current_company_portal_module_registry.csv
  current_completed_pending_summary.md

outputs/
  source_of_truth/
  modules/
  reports/
  zips/
```

---

## Optional LLM use

The scripts are deterministic by default.

An optional minimal OpenAI client is included:

```text
scripts/llm_client.py
```

Set:

```bash
export OPENAI_API_KEY="..."
export OPENAI_MODEL="..."
```

Then extend scripts to call `call_openai(...)` using the supplied prompts.

---

## Recommended Codex instruction

Paste this into Codex:

```text
Use this repository as the permanent source of truth for the Versa module specification process.

Do not depend on chat history.

Always follow:
Scope → Questionnaire → Answers → Source-of-truth CSV → Module Registry → 14-parameter semantic module specs → Validation → ZIP → Completed/Pending Summary.

Never generate JSON wrappers around CSV rows.

Current completed modules:
company_dashboard, staff_users, roles_permissions, school_crm, school_onboarding_ops, student_roster_ops, finance_ops.

Current pending modules:
exam_slot_ops, exam_material_ops, courier_ops, evaluation_ops, results_ops, certificate_ops, notification_ops, support_tickets, task_work_queue, reports_exports, admin_settings, security_audit_console.

Next module:
exam_slot_ops.
```
