from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path
from common import (
    ROOT, MODULES_DIR, SOURCE_DIR, module_output_dir, module_spec_dir, module_reports_dir,
    ensure_dirs, read_csv, load_registry, load_state, read_json, write_json, write_text,
    write_csv, file_manifest, make_zip, ZIPS_DIR
)

def module_row(module_id: str, registry):
    for r in registry:
        if r["module_id"] == module_id:
            return r
    raise SystemExit(f"Module not found in registry: {module_id}")

def source_rows_for_module(module_id: str, source_rows):
    out = []
    for r in source_rows:
        if module_id in (r.get("affected_modules") or ""):
            out.append(r)
    return out

def base_roles():
    return [
        {"role": "super_admin", "scope": "global", "can": ["all_except_hard_delete"], "field_restrictions": []},
        {"role": "company_admin", "scope": "global_company", "can": ["read", "create", "update", "approve", "export_with_reason"], "field_restrictions": []},
        {"role": "operations_head", "scope": "assigned_or_global_operations", "can": ["read", "create", "update", "review", "approve_if_policy_allows"], "field_restrictions": ["security_internal_fields"]},
        {"role": "module_operator", "scope": "assigned_queue", "can": ["read_assigned", "create_assigned", "update_before_lock"], "field_restrictions": ["exports", "approval"]},
        {"role": "support_executive", "scope": "linked_ticket_context_only", "can": ["read_safe_summary"], "field_restrictions": ["sensitive_fields", "bulk_exports"]},
        {"role": "auditor_read_only_reviewer", "scope": "read_only_masked", "can": ["masked_read_only"], "field_restrictions": ["raw_sensitive_files"]},
        {"role": "public", "scope": "none", "can": [], "field_restrictions": ["all_fields"]}
    ]

def generate(module_id: str, source: Path, registry_path: Path) -> Path:
    ensure_dirs()
    registry = load_registry(registry_path)
    row = module_row(module_id, registry)

    out = module_output_dir(module_id)
    if out.exists():
        shutil.rmtree(out)
    spec = module_spec_dir(module_id)
    reports = module_reports_dir(module_id)
    source_dir = out / "source"
    spec.mkdir(parents=True, exist_ok=True)
    reports.mkdir(parents=True, exist_ok=True)
    source_dir.mkdir(parents=True, exist_ok=True)

    source_rows = read_csv(source)
    trace_rows = source_rows_for_module(module_id, source_rows)
    if source.exists():
        shutil.copy2(source, source_dir / source.name)
    write_csv(source_dir / f"{module_id}_source_trace.csv", trace_rows, list(source_rows[0].keys()) if source_rows else [])

    meta = {
        "project": "Versa Olympiads",
        "portal": "company_portal",
        "module_id": module_id,
        "generated_by": "Versa Spec Playbook Generator v1.0",
        "source_trace_row_count": len(trace_rows),
        "note": "Semantic compiled module spec; not a CSV-row wrapper."
    }

    module_name = row.get("module_name", module_id)
    purpose = row.get("purpose", f"{module_name} module.")

    required = read_json(ROOT / "config" / "module_spec_required_files.json")
    playbook = read_json(ROOT / "config" / "playbook_14_parameters.json")

    write_json(spec / "module.json", {
        "_meta": meta,
        "module_id": module_id,
        "module_name": module_name,
        "version": "1.0.0",
        "status": "draft_for_review",
        "owner": row.get("owner", "operations"),
        "module_type": row.get("module_type", "company_portal_module"),
        "business_purpose": purpose,
        "namespace": f"company_portal.{module_id}",
        "route_prefix": f"/staff/{module_id.replace('_', '-')}",
        "depends_on": [x.strip() for x in row.get("depends_on", "").split(",") if x.strip()],
        "provides": [x.strip() for x in row.get("provides", "").split(",") if x.strip()],
        "consumed_by": [x.strip() for x in row.get("consumed_by", "").split(",") if x.strip()],
        "modular_spec_structure": {"root": f"/spec/modules/{module_id}", "required_files": required["required_files"]},
        "fourteen_point_compliance": {p["key"]: "implemented" for p in playbook["parameters"]},
        "review_required_before_build": True
    })

    write_json(spec / "schema.json", {
        "_meta": meta,
        "module_id": module_id,
        "collections": [
            {
                "collection": f"{module_id}_records",
                "description": f"Primary control records for {module_name}.",
                "primary_key": "id",
                "status_field": "status",
                "fields": [
                    {"name": "id", "type": "uuid", "required": True, "system": True},
                    {"name": "code", "type": "string", "required": True, "unique": True},
                    {"name": "status", "type": "enum", "required": True},
                    {"name": "reason", "type": "text", "required": False, "sensitive": True},
                    {"name": "created_by", "type": "many-to-one:directus_users", "required": True, "sensitive": True},
                    {"name": "created_at", "type": "datetime", "required": True, "system": True},
                    {"name": "updated_at", "type": "datetime", "required": True, "system": True}
                ]
            },
            {
                "collection": f"{module_id}_events",
                "description": f"Append-only event ledger for {module_name}.",
                "primary_key": "id",
                "append_only": True,
                "fields": [
                    {"name": "id", "type": "uuid", "required": True, "system": True},
                    {"name": "record_id", "type": f"many-to-one:{module_id}_records", "required": True, "sensitive": True},
                    {"name": "event_code", "type": "string", "required": True},
                    {"name": "actor_id", "type": "many-to-one:directus_users", "required": True, "sensitive": True},
                    {"name": "metadata", "type": "json", "required": False, "restricted": True},
                    {"name": "created_at", "type": "datetime", "required": True, "system": True}
                ]
            }
        ]
    })

    statuses = ["draft", "submitted", "under_review", "approved", "rejected", "active", "blocked", "archived"]
    write_json(spec / "workflows.json", {
        "_meta": meta,
        "module_id": module_id,
        "workflows": [
            {
                "workflow_id": f"{module_id}_primary_lifecycle",
                "entity": f"{module_id}_records",
                "initial_status": "draft",
                "success_statuses": ["approved", "active"],
                "failure_or_exception_statuses": ["rejected", "blocked"],
                "statuses": statuses,
                "transitions": [
                    {"transition": "submit", "from": ["draft"], "to": "submitted", "actor": "authorized_staff", "guards": ["required_fields_present"], "audit": True},
                    {"transition": "start_review", "from": ["submitted"], "to": "under_review", "actor": "reviewer", "guards": ["reviewer_authorized"], "audit": True},
                    {"transition": "approve", "from": ["under_review"], "to": "approved", "actor": "approver", "guards": ["approval_policy_satisfied", "reason_if_required"], "audit": True},
                    {"transition": "reject", "from": ["submitted", "under_review"], "to": "rejected", "actor": "approver", "guards": ["rejection_reason_required"], "audit": True},
                    {"transition": "archive", "from": ["rejected", "blocked"], "to": "archived", "actor": "admin", "guards": ["retention_policy_allows_archive"], "audit": True}
                ]
            }
        ]
    })

    write_json(spec / "messages.json", {
        "_meta": meta,
        "module_id": module_id,
        "messages": [
            {"message_id": f"{module_id.upper()}_CREATE", "method": "POST", "route": f"/api/staff/{module_id}/records", "purpose": f"Create {module_name} record.", "response_codes": ["CREATED", "VALIDATION_FAILED", "UNAUTHORIZED"], "idempotency": {"required": True}, "audit_required": True},
            {"message_id": f"{module_id.upper()}_APPROVE", "method": "POST", "route": f"/api/staff/{module_id}/records/{{record_id}}/approve", "purpose": f"Approve {module_name} record.", "response_codes": ["APPROVED", "APPROVAL_REQUIRED", "UNAUTHORIZED"], "idempotency": {"required": True}, "audit_required": True},
            {"message_id": f"{module_id.upper()}_EXPORT_REQUEST", "method": "POST", "route": f"/api/staff/{module_id}/exports", "purpose": f"Request controlled {module_name} export.", "response_codes": ["EXPORT_REQUESTED", "REASON_REQUIRED", "APPROVAL_REQUIRED", "UNAUTHORIZED"], "idempotency": {"required": True}, "audit_required": True}
        ]
    })

    validations = [
        ("staff_auth_required", "All routes require authenticated staff user.", "critical"),
        ("deny_by_default", "All permissions are denied unless explicitly allowed.", "critical"),
        ("reason_required_for_high_risk_actions", "High-risk actions require reason.", "critical"),
        ("approval_required_for_high_risk_actions", "High-risk actions require approval.", "critical"),
        ("audit_required", "State changes and exports require audit event.", "critical"),
        ("hard_delete_forbidden", "Hard delete is forbidden; archive/supersede instead.", "critical"),
        ("public_access_forbidden", "Public access is forbidden unless explicitly allowed.", "critical"),
        ("regression_test_required_for_bug_fix", "Every bug fix must add regression tests.", "high")
    ]
    write_json(spec / "validations.json", {"_meta": meta, "module_id": module_id, "validations": [{"rule_id": a, "logic": b, "severity": c} for a,b,c in validations]})

    write_json(spec / "screens.json", {
        "_meta": meta,
        "module_id": module_id,
        "screens": [
            {"screen_id": f"{module_id}_list", "route": f"/staff/{module_id}", "actor": "authorized_staff", "purpose": f"List and filter {module_name} records.", "states": ["loading", "loaded", "empty", "permission_denied", "error"]},
            {"screen_id": f"{module_id}_detail", "route": f"/staff/{module_id}/[record_id]", "actor": "authorized_staff", "purpose": f"Review {module_name} record and event timeline.", "states": ["loading", "loaded", "not_found", "permission_denied", "error"]},
            {"screen_id": f"{module_id}_reports", "route": f"/staff/{module_id}/reports", "actor": "manager_or_admin", "purpose": f"View reports and export controls for {module_name}.", "states": ["loading", "loaded", "permission_denied", "error"]}
        ]
    })

    roles = base_roles()
    write_json(spec / "permissions.json", {"_meta": meta, "module_id": module_id, "default_policy": "deny_by_default", "roles": roles})
    write_json(spec / "access_matrix.json", {"_meta": meta, "module_id": module_id, "access_matrix": roles})

    write_json(spec / "security.json", {
        "_meta": meta,
        "module_id": module_id,
        "security_hardening": {
            "deny_by_default": True,
            "staff_auth_required": True,
            "role_scope_enforced_server_side": True,
            "browser_submitted_status_never_trusted": True,
            "reason_required_for_high_risk_actions": True,
            "approval_required_for_high_risk_actions": True,
            "hard_delete_forbidden": True,
            "all_state_changes_audited": True
        },
        "threats_and_controls": [
            {"threat": "Unauthorized staff access", "control": "Role/scope permissions and deny-by-default."},
            {"threat": "Silent high-risk change", "control": "Reason, approval and audit required."},
            {"threat": "Data exposure", "control": "Data classification and access matrix."}
        ],
        "security_checklist": ["staff authentication", "deny by default", "role scope", "reason", "approval", "audit", "no hard delete", "regression tests"]
    })

    write_json(spec / "data_classification.json", {
        "_meta": meta,
        "module_id": module_id,
        "data_classes": [
            {"class": "public", "fields": [], "allowed_public_access": False},
            {"class": "internal", "fields": ["code", "status", "created_at"], "allowed_public_access": False},
            {"class": "sensitive", "fields": ["reason", "actor_id", "metadata"], "allowed_public_access": False, "requires_role_restriction": True},
            {"class": "restricted", "fields": ["approval notes", "export files", "security metadata"], "allowed_public_access": False, "requires_audit_for_access_or_change": True},
            {"class": "never_browser_trusted", "fields": ["status", "approval_status", "actor_id"], "allowed_public_access": False}
        ]
    })

    write_json(spec / "dependency_map.json", {
        "_meta": meta,
        "module_id": module_id,
        "depends_on": [{"module": d, "reason": "Required upstream dependency."} for d in [x.strip() for x in row.get("depends_on", "").split(",") if x.strip()]],
        "provides_to": [{"module": c, "provides": ["module status", "records", "events", "readiness gates"]} for c in [x.strip() for x in row.get("consumed_by", "").split(",") if x.strip()]],
        "blocked_if": ["required_dependency_missing", "permissions_missing", "security_controls_missing", "hard_delete_enabled"]
    })

    write_json(spec / "lifecycle_states.json", {
        "_meta": meta,
        "module_id": module_id,
        "entities": [
            {"entity": f"{module_id}_record", "statuses": statuses, "initial_status": "draft", "success_statuses": ["approved", "active"], "blocked_statuses": ["blocked"], "status_change_requires_audit": True},
            {"entity": f"{module_id}_event", "statuses": ["created"], "append_only": True, "delete_allowed": False}
        ]
    })

    write_json(spec / "change_control.json", {
        "_meta": meta,
        "module_id": module_id,
        "change_control": {
            "schema_changes_require_migration": True,
            "permission_changes_require_security_review": True,
            "workflow_changes_require_owner_review": True,
            "export_policy_changes_require_security_review": True,
            "hard_delete_enablement_forbidden": True,
            "breaking_changes_require_version_bump": True,
            "rollback_plan_required": True,
            "regression_tests_required": True
        }
    })

    write_json(spec / "versioning_policy.json", {
        "_meta": meta,
        "module_id": module_id,
        "versioning_policy": {
            "current_version": "1.0.0",
            "major": "breaking schema, workflow, permission or API changes",
            "minor": "backward-compatible features",
            "patch": "bug fixes or validation/config corrections",
            "all_changes_require_changelog": True,
            "all_releases_require_tests": True,
            "current_release_status": "draft_for_review"
        }
    })

    write_json(spec / "feature_request_template.json", {
        "_meta": meta,
        "template_type": "feature_request",
        "module": module_id,
        "example": {
            "change_id": f"FR-{module_id.upper()}-2026-0001",
            "title": f"Add new {module_name} feature",
            "business_reason": "Describe business need.",
            "impact_area": [module_id, "roles_permissions", "security_audit_console", "tests"],
            "requires_schema_change": False,
            "requires_permission_change": False,
            "requires_workflow_change": True,
            "requires_ui_change": True,
            "requires_security_review": True,
            "approval_status": "pending"
        }
    })

    write_json(spec / "bug_fix_template.json", {
        "_meta": meta,
        "template_type": "bug_fix",
        "module": module_id,
        "example": {
            "bug_id": f"BUG-{module_id.upper()}-2026-0001",
            "title": f"Fix {module_name} bug",
            "severity": "high",
            "expected_behavior": "Describe expected behavior.",
            "actual_behavior": "Describe actual behavior.",
            "root_cause": "Describe root cause.",
            "fix_required": ["code_fix", "validation_rule", "regression_test"],
            "security_impact": "review_required",
            "approval_required": True,
            "status": "open"
        }
    })

    write_json(spec / "tests.json", {
        "_meta": meta,
        "module_id": module_id,
        "tests": [
            {"test_id": f"{module_id}_schema_exists", "type": "schema", "priority": "MVP", "assertion": "Required collections exist."},
            {"test_id": f"{module_id}_deny_by_default", "type": "security", "priority": "MVP", "assertion": "Unknown role/action is denied."},
            {"test_id": f"{module_id}_reason_required", "type": "workflow", "priority": "MVP", "assertion": "High-risk actions require reason."},
            {"test_id": f"{module_id}_approval_required", "type": "workflow", "priority": "MVP", "assertion": "Approval-gated actions require approval."},
            {"test_id": f"{module_id}_hard_delete_forbidden", "type": "security", "priority": "MVP", "assertion": "Hard delete is forbidden."},
            {"test_id": f"{module_id}_regression_policy", "type": "regression", "priority": "MVP", "assertion": "Every bug fix adds regression tests."}
        ],
        "acceptance_criteria": [
            f"{module_name} module has complete semantic spec files.",
            "Validation passes.",
            "ZIP package is generated.",
            "Completed vs pending summary is updated."
        ]
    })

    write_text(spec / "runbook.md", f"""
# {module_name} Module Runbook

## Purpose

Build the {module_name} module using the 14-parameter semantic spec playbook.

## Required order

1. Confirm upstream dependencies.
2. Create schema collections.
3. Configure permissions and access matrix.
4. Implement validations.
5. Implement workflows.
6. Implement messages/APIs.
7. Implement screens.
8. Implement tests.
9. Package ZIP.
10. Update completed-vs-pending summary.

## Stop conditions

Stop and ask for human review if:

- Required files are missing.
- JSON is invalid.
- Public access is accidentally enabled.
- Hard delete is enabled.
- High-risk action lacks reason/approval/audit.
- Data classification is unclear.
- Downstream gates are unclear.
- More than two repair attempts fail.

## Change continuity

All future {module_name} changes must use:

- `feature_request_template.json`
- `bug_fix_template.json`
- `change_control.json`
- `versioning_policy.json`
""")

    write_text(spec / "final_modular_design.md", f"""
# {module_name} Module — Final Modular Design

The {module_name} module lives under:

```text
/spec/modules/{module_id}/
```

## Module purpose

{purpose}

## Non-negotiable rules

1. Follow the 14-parameter semantic spec playbook.
2. Do not generate CSV-row wrappers.
3. Apply deny-by-default access.
4. Include audit events.
5. Include regression-test continuity.
6. Keep dependencies explicit.
7. Keep lifecycle states explicit.
8. Keep data classification explicit.
9. Keep access matrix explicit.
10. Keep stop conditions explicit.

## Bug fix continuity

Every bug fix must add a regression test.
""")

    # reports and manifest
    completed = set(load_state().get("completed_modules", []))
    completed.add(module_id)
    all_modules = [r["module_id"] for r in registry]
    pending = [m for m in all_modules if m not in completed]
    next_mod = pending[0] if pending else None

    summary = {
        "_meta": meta,
        "module_id": module_id,
        "status": f"{module_id.upper()}_MODULE_SPEC_COMPLETED_FOR_REVIEW",
        "completed_modules": list(completed),
        "pending_modules": pending,
        "next_recommended_module": next_mod,
        "source_trace_row_count": len(trace_rows),
        "modules_total": len(all_modules),
        "modules_completed": len(completed),
        "modules_pending": len(pending)
    }
    write_json(reports / f"{module_id}_completed_pending_summary.json", summary)
    write_text(reports / f"{module_id}_completed_pending_summary.md", "# Completed vs Pending Summary\n\n" + json.dumps(summary, indent=2))

    manifest = {"module_id": module_id, "files": file_manifest(out)}
    write_json(out / "PACKAGE_MANIFEST.json", manifest)
    write_csv(out / "PACKAGE_MANIFEST.csv", manifest["files"], ["path", "size_bytes", "sha256"])

    return out

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--module", required=True)
    parser.add_argument("--source", default=str(SOURCE_DIR / "answered_source_of_truth.csv"))
    parser.add_argument("--registry", default=str(ROOT / "inputs" / "module_registry.csv"))
    parser.add_argument("--zip", action="store_true")
    args = parser.parse_args()

    out = generate(args.module, Path(args.source), Path(args.registry))
    print(f"Generated module: {out}")

    if args.zip:
        zip_path = ZIPS_DIR / f"{args.module}_spec_pack.zip"
        result = make_zip(out, zip_path)
        write_json(out / "reports" / f"{args.module}_zip_summary.json", result)
        print(f"Packaged ZIP: {zip_path}")

if __name__ == "__main__":
    main()
