#!/usr/bin/env python3
"""
build_from_specs.py

Purpose
-------
Convert module specifications into implementation task plans. This script does not assume a
specific framework; it creates deterministic build tasks for migrations, routes, UI, permissions,
tests, audit and rollback.

Usage
-----
python scripts/build_from_specs.py --root . --module finance_ops
python scripts/build_from_specs.py --root . --all
python scripts/build_from_specs.py --root . --next

Outputs
-------
.autopilot/build_tasks/<module_id>.json
.autopilot/build_tasks/<module_id>.md
.autopilot/build_tasks/build_index.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

REQUIRED_STEPS = [
    "read_module_spec",
    "confirm_dependencies",
    "create_or_update_schema_migration",
    "create_server_validators",
    "create_permission_guards",
    "create_api_routes",
    "create_ui_screens",
    "create_audit_events",
    "create_unit_tests",
    "create_integration_tests",
    "create_security_tests",
    "create_privacy_tests",
    "update_rollback_entry",
    "update_implementation_manifest",
    "run_lint_typecheck_tests",
]

def load_json(path: Path, default: Any = None) -> Any:
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)

def module_dir(root: Path, module_id: str) -> Path:
    return root / "spec" / "modules" / module_id

def discover_modules(root: Path) -> List[str]:
    build_order = load_json(root / "BUILD_ORDER.json") or load_json(root / "build" / "BUILD_ORDER.json")
    if isinstance(build_order, dict):
        mods = build_order.get("module_build_order") or []
        ids = [m.get("module_id") for m in mods if m.get("module_id")]
        if ids:
            return ids
    spec_root = root / "spec" / "modules"
    if spec_root.exists():
        return [p.name for p in sorted(spec_root.iterdir()) if p.is_dir()]
    return []

def next_module(root: Path) -> Optional[str]:
    manifest = load_json(root / "IMPLEMENTATION_MANIFEST.json") or load_json(root / "build" / "IMPLEMENTATION_MANIFEST.json")
    if isinstance(manifest, dict):
        for module in manifest.get("modules", []):
            if module.get("implementation_status") not in ["DONE", "COMPLETED", "COMPLETED_FOR_REVIEW"]:
                return module.get("module_id")
    ids = discover_modules(root)
    return ids[0] if ids else None

def summarize_module(root: Path, module_id: str) -> Dict[str, Any]:
    d = module_dir(root, module_id)
    module = load_json(d / "module.json", {}) or {}
    schema = load_json(d / "schema.json", {}) or {}
    messages = load_json(d / "messages.json", {}) or {}
    tests = load_json(d / "tests.json", {}) or {}
    permissions = load_json(d / "permissions.json", {}) or {}
    workflows = load_json(d / "workflows.json", {}) or {}
    security = load_json(d / "security.json", {}) or {}
    collections = schema.get("collections", []) if isinstance(schema, dict) else []
    routes = messages.get("messages", []) if isinstance(messages, dict) else []
    test_items = tests.get("tests", []) if isinstance(tests, dict) else []
    return {
        "module_id": module_id,
        "module_name": module.get("module_name") or module.get("name") or module_id,
        "module_path": str(d),
        "exists": d.exists(),
        "risk": "critical" if "critical" in json.dumps(security).lower() else "high" if "high" in json.dumps(security).lower() else "medium",
        "collections": [c.get("collection") for c in collections if isinstance(c, dict)],
        "route_count": len(routes),
        "test_count": len(test_items),
        "workflow_count": len(workflows.get("workflows", [])) if isinstance(workflows, dict) else 0,
        "roles_count": len(permissions.get("roles", [])) if isinstance(permissions, dict) else 0,
    }

def build_tasks(root: Path, module_id: str) -> Dict[str, Any]:
    summary = summarize_module(root, module_id)
    task_items = []
    for idx, step in enumerate(REQUIRED_STEPS, 1):
        task_items.append({
            "order": idx,
            "step_id": step,
            "status": "PENDING",
            "module_id": module_id,
            "guard": "human_approval_required" if step in ["create_or_update_schema_migration"] and summary["risk"] == "critical" else "autopilot_allowed",
        })
    return {
        "module": summary,
        "build_tasks": task_items,
        "stop_conditions": [
            "missing_spec_file",
            "destructive_migration_needed",
            "security_baseline_conflict",
            "privacy_baseline_conflict",
            "two_failed_repair_attempts",
        ],
        "definition_of_done": [
            "migration_created_or_confirmed",
            "routes_created",
            "guards_created",
            "ui_created",
            "tests_created",
            "security_checks_passed",
            "privacy_checks_passed",
            "rollback_entry_created",
            "manifest_updated",
        ],
    }

def write_outputs(root: Path, module_id: str, plan: Dict[str, Any]) -> None:
    out_dir = root / ".autopilot" / "build_tasks"
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / f"{module_id}.json").write_text(json.dumps(plan, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    md = [f"# Build Tasks — {module_id}", "", f"Module: **{plan['module']['module_name']}**", "", "## Tasks", ""]
    for task in plan["build_tasks"]:
        md.append(f"{task['order']}. `{task['step_id']}` — {task['status']} — {task['guard']}")
    md += ["", "## Definition of Done", ""]
    for item in plan["definition_of_done"]:
        md.append(f"- {item}")
    (out_dir / f"{module_id}.md").write_text("\n".join(md) + "\n", encoding="utf-8")

def main() -> int:
    parser = argparse.ArgumentParser(description="Create implementation tasks from module specs.")
    parser.add_argument("--root", default=".")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--module")
    group.add_argument("--all", action="store_true")
    group.add_argument("--next", action="store_true")
    args = parser.parse_args()
    root = Path(args.root).resolve()

    if args.module:
        module_ids = [args.module]
    elif args.next:
        nxt = next_module(root)
        if not nxt:
            print(json.dumps({"status": "NO_NEXT_MODULE"}, indent=2))
            return 1
        module_ids = [nxt]
    else:
        module_ids = discover_modules(root)

    if not module_ids:
        print(json.dumps({"status": "FAIL", "error": "No modules discovered"}, indent=2))
        return 1

    index = []
    for module_id in module_ids:
        plan = build_tasks(root, module_id)
        write_outputs(root, module_id, plan)
        index.append({"module_id": module_id, "task_count": len(plan["build_tasks"]), "risk": plan["module"]["risk"]})

    out_dir = root / ".autopilot" / "build_tasks"
    (out_dir / "build_index.json").write_text(json.dumps({"status": "READY", "modules": index}, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "READY", "modules": index, "out_dir": str(out_dir)}, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
