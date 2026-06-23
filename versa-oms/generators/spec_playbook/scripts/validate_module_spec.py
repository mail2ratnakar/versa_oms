from __future__ import annotations

import argparse
import json
from pathlib import Path
from common import ROOT, module_spec_dir, module_reports_dir, read_json, write_json

def validate(module_id: str) -> dict:
    spec = module_spec_dir(module_id)
    required = read_json(ROOT / "config" / "module_spec_required_files.json")
    report = {
        "module_id": module_id,
        "valid": True,
        "errors": [],
        "warnings": [],
        "required_file_checks": {},
        "json_checks": {}
    }

    for filename in required["required_files"]:
        p = spec / filename
        exists = p.exists()
        report["required_file_checks"][filename] = exists
        if not exists:
            report["valid"] = False
            report["errors"].append(f"Missing required file: {filename}")

    for filename in required["required_json_files"]:
        p = spec / filename
        if p.exists():
            try:
                data = json.loads(p.read_text(encoding="utf-8"))
                report["json_checks"][filename] = True
                if filename == "module.json":
                    for key in ["module_id", "module_name", "business_purpose"]:
                        if not data.get(key):
                            report["valid"] = False
                            report["errors"].append(f"module.json missing {key}")
                if filename == "schema.json" and not data.get("collections"):
                    report["valid"] = False
                    report["errors"].append("schema.json has no collections")
                if filename == "permissions.json" and data.get("default_policy") != "deny_by_default":
                    report["valid"] = False
                    report["errors"].append("permissions.json missing deny_by_default")
                if filename == "security.json":
                    if not data.get("security_checklist") and not data.get("security_hardening"):
                        report["valid"] = False
                        report["errors"].append("security.json missing hardening/checklist")
                if filename == "tests.json":
                    tests = data.get("tests", [])
                    if not any("regression" in str(t).lower() for t in tests):
                        report["warnings"].append("tests.json may be missing explicit regression test")
            except Exception as e:
                report["valid"] = False
                report["json_checks"][filename] = False
                report["errors"].append(f"Invalid JSON {filename}: {e}")

    combined_text = ""
    for p in spec.glob("*"):
        if p.is_file():
            combined_text += p.read_text(encoding="utf-8", errors="ignore")[:5000]
    for pattern in required.get("forbidden_patterns", []):
        if pattern in combined_text:
            report["valid"] = False
            report["errors"].append(f"Forbidden CSV-wrapper pattern found: {pattern}")

    runbook = spec / "runbook.md"
    if runbook.exists() and "Stop conditions" not in runbook.read_text(encoding="utf-8"):
        report["valid"] = False
        report["errors"].append("runbook.md missing Stop conditions")

    final_design = spec / "final_modular_design.md"
    if final_design.exists() and len(final_design.read_text(encoding="utf-8").strip()) < 100:
        report["valid"] = False
        report["errors"].append("final_modular_design.md too short")

    reports = module_reports_dir(module_id)
    reports.mkdir(parents=True, exist_ok=True)
    write_json(reports / f"{module_id}_validation_report.json", report)
    return report

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--module", required=True)
    args = parser.parse_args()
    report = validate(args.module)
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()
