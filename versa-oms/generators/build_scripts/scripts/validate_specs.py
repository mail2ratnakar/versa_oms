#!/usr/bin/env python3
"""
validate_specs.py

Purpose
-------
Validate Versa Olympiads spec packs before any LLM/autopilot build step.

What it checks
--------------
- Required production control files exist when run from repo root.
- Required module spec files exist.
- All JSON files parse.
- Module metadata is consistent with folder/module id.
- Lifecycle, permissions, validations, tests, security and data classification files exist.
- No module is missing core 14-parameter build inputs.

Usage
-----
python scripts/validate_specs.py --root .
python scripts/validate_specs.py --root . --module results_ops
python scripts/validate_specs.py --root . --strict

Output
------
Writes: .autopilot/reports/validate_specs_report.json
Exits: 0 on pass, 1 on failure.
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Dict, List, Optional

REQUIRED_CONTROL_FILES = [
    "BUILD_PLAN.md",
    "AUTOPILOT.md",
    "IMPLEMENTATION_MANIFEST.json",
    "BUILD_ORDER.json",
    "ROLLBACK_PLAN.md",
    "rollback.schema.json",
    "CHANGE_REQUEST_TEMPLATE.json",
    "SECURITY_BASELINE.md",
    "PRIVACY_BASELINE.md",
    "PRODUCTION_READINESS_CHECKLIST.md",
]

REQUIRED_MODULE_FILES = [
    "module.json",
    "features.json",
    "schema.json",
    "workflows.json",
    "messages.json",
    "validations.json",
    "screens.json",
    "permissions.json",
    "security.json",
    "data_classification.json",
    "access_matrix.json",
    "dependency_map.json",
    "lifecycle_states.json",
    "change_control.json",
    "versioning_policy.json",
    "feature_request_template.json",
    "bug_fix_template.json",
    "tests.json",
    "runbook.md",
    "final_modular_design.md",
]

REQUIRED_STARTER_FILES = [
    "MASTER_DATA_MODEL.md",
    "DATABASE_SCHEMA_REGISTRY.json",
    "RLS_POLICY_MATRIX.json",
    "FIELD_MASKING_MATRIX.json",
    "HIGH_RISK_ACTIONS.json",
    "FEATURE_FLAGS.json",
    "API_CONTRACT_PLAN.md",
    "TEST_STRATEGY.md",
    "REPO_STRUCTURE.md",
    "WORKER_JOB_PLAN.md",
    "OBSERVABILITY_PLAN.md",
    "ADR_INDEX.md",
]

@dataclass
class Finding:
    severity: str
    code: str
    path: str
    message: str

def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)

def add(findings: List[Finding], severity: str, code: str, path: Path | str, message: str) -> None:
    findings.append(Finding(severity=severity, code=code, path=str(path), message=message))

def discover_module_dirs(root: Path, requested_module: Optional[str]) -> List[Path]:
    spec_root = root / "spec" / "modules"
    if requested_module:
        return [spec_root / requested_module]
    if not spec_root.exists():
        return []
    return sorted([p for p in spec_root.iterdir() if p.is_dir()])

def validate_control_files(root: Path, findings: List[Finding], strict: bool) -> None:
    for rel in REQUIRED_CONTROL_FILES:
        if not (root / rel).exists() and not (root / "build" / rel).exists():
            add(findings, "error" if strict else "warning", "CONTROL_FILE_MISSING", rel, f"Control file missing: {rel}")
    for rel in REQUIRED_STARTER_FILES:
        if not (root / rel).exists() and not (root / "build" / rel).exists():
            add(findings, "warning", "STARTER_FILE_MISSING", rel, f"Implementation starter file missing: {rel}")

def validate_json_file(path: Path, findings: List[Finding]) -> Optional[Any]:
    if not path.exists():
        add(findings, "error", "JSON_FILE_MISSING", path, "Required JSON file missing")
        return None
    try:
        return load_json(path)
    except Exception as exc:
        add(findings, "error", "JSON_PARSE_FAILED", path, f"JSON parse failed: {exc}")
        return None

def validate_module_dir(module_dir: Path, findings: List[Finding]) -> None:
    module_id = module_dir.name
    if not module_dir.exists():
        add(findings, "error", "MODULE_DIR_MISSING", module_dir, f"Module directory missing: {module_id}")
        return

    for file_name in REQUIRED_MODULE_FILES:
        path = module_dir / file_name
        if not path.exists():
            add(findings, "error", "MODULE_FILE_MISSING", path, f"Required module file missing: {file_name}")

    module_json = validate_json_file(module_dir / "module.json", findings)
    if isinstance(module_json, dict):
        found_id = module_json.get("module_id") or module_json.get("_meta", {}).get("module_id")
        if found_id and found_id != module_id:
            add(findings, "error", "MODULE_ID_MISMATCH", module_dir / "module.json", f"module_id '{found_id}' does not match folder '{module_id}'")
        if not module_json.get("business_purpose") and not module_json.get("purpose"):
            add(findings, "warning", "MODULE_PURPOSE_MISSING", module_dir / "module.json", "Module purpose/business_purpose missing")

    for json_path in sorted(module_dir.glob("*.json")):
        validate_json_file(json_path, findings)

    # Structural semantic checks.
    schema = validate_json_file(module_dir / "schema.json", findings) if (module_dir / "schema.json").exists() else None
    if isinstance(schema, dict):
        collections = schema.get("collections", [])
        if not isinstance(collections, list) or not collections:
            add(findings, "error", "SCHEMA_COLLECTIONS_EMPTY", module_dir / "schema.json", "schema.json must contain non-empty collections list")

    tests = validate_json_file(module_dir / "tests.json", findings) if (module_dir / "tests.json").exists() else None
    if isinstance(tests, dict):
        test_items = tests.get("tests", [])
        if not isinstance(test_items, list) or not test_items:
            add(findings, "error", "TESTS_EMPTY", module_dir / "tests.json", "tests.json must contain non-empty tests list")

    security = validate_json_file(module_dir / "security.json", findings) if (module_dir / "security.json").exists() else None
    if isinstance(security, dict):
        txt = json.dumps(security).lower()
        for phrase in ["deny", "audit", "hard_delete"]:
            if phrase not in txt:
                add(findings, "warning", "SECURITY_BASELINE_WEAK", module_dir / "security.json", f"security.json does not mention '{phrase}'")

def write_report(root: Path, report: Dict[str, Any]) -> Path:
    out_dir = root / ".autopilot" / "reports"
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / "validate_specs_report.json"
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return out

def main() -> int:
    parser = argparse.ArgumentParser(description="Validate Versa spec files before build.")
    parser.add_argument("--root", default=".", help="Repository root")
    parser.add_argument("--module", default=None, help="Validate only this module id")
    parser.add_argument("--strict", action="store_true", help="Treat missing control files as errors")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    findings: List[Finding] = []

    validate_control_files(root, findings, args.strict)
    module_dirs = discover_module_dirs(root, args.module)
    if not module_dirs:
        add(findings, "error", "NO_MODULE_SPECS_FOUND", root / "spec" / "modules", "No module spec directories found")
    for module_dir in module_dirs:
        validate_module_dir(module_dir, findings)

    error_count = sum(1 for f in findings if f.severity == "error")
    warning_count = sum(1 for f in findings if f.severity == "warning")
    report = {
        "status": "PASS" if error_count == 0 else "FAIL",
        "root": str(root),
        "module_filter": args.module,
        "modules_checked": [p.name for p in module_dirs],
        "error_count": error_count,
        "warning_count": warning_count,
        "findings": [asdict(f) for f in findings],
    }
    out = write_report(root, report)
    print(json.dumps({"status": report["status"], "errors": error_count, "warnings": warning_count, "report": str(out)}, indent=2))
    return 0 if error_count == 0 else 1

if __name__ == "__main__":
    raise SystemExit(main())
