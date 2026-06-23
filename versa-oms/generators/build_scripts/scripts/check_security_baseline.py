#!/usr/bin/env python3
"""
check_security_baseline.py

Purpose
-------
Verify that specs and generated code preserve non-negotiable security rules.

Usage
-----
python scripts/check_security_baseline.py --root .
python scripts/check_security_baseline.py --root . --scan-code
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List

REQUIRED_SPEC_FILES = ["security.json", "permissions.json", "access_matrix.json", "validations.json", "tests.json"]
REQUIRED_SECURITY_TERMS = ["deny", "audit", "hard_delete", "role", "scope"]
DANGEROUS_CODE_PATTERNS = [
    ("RAW_DELETE", r"\bdelete\s+from\b|\.delete\("),
    ("TRUST_CLIENT_ROLE", r"headers\.get\(['\"]x-role|req\.headers\[['\"]x-role"),
    ("TRUST_CLIENT_SCHOOL", r"headers\.get\(['\"]x-school-id|req\.headers\[['\"]x-school-id"),
    ("PUBLIC_PRIVATE_FILE", r"publicUrl|getPublicUrl|public_url"),
    ("SECRET_IN_CODE", r"(api_key|secret|password|token)\s*=\s*['\"][^'\"]{8,}"),
]

@dataclass
class Finding:
    severity: str
    code: str
    path: str
    message: str

def read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return ""

def add(findings: List[Finding], severity: str, code: str, path: Path, message: str) -> None:
    findings.append(Finding(severity, code, str(path), message))

def module_dirs(root: Path) -> List[Path]:
    spec_root = root / "spec" / "modules"
    return sorted([p for p in spec_root.iterdir() if p.is_dir()]) if spec_root.exists() else []

def check_specs(root: Path, findings: List[Finding]) -> None:
    for d in module_dirs(root):
        for file in REQUIRED_SPEC_FILES:
            path = d / file
            if not path.exists():
                add(findings, "error", "SECURITY_SPEC_FILE_MISSING", path, f"Missing {file}")
        security_path = d / "security.json"
        if security_path.exists():
            txt = read(security_path).lower()
            for term in REQUIRED_SECURITY_TERMS:
                if term not in txt:
                    add(findings, "warning", "SECURITY_TERM_MISSING", security_path, f"Security spec does not mention '{term}'")
        tests_path = d / "tests.json"
        if tests_path.exists():
            txt = read(tests_path).lower()
            for term in ["auth", "scope", "hard_delete", "audit"]:
                if term not in txt:
                    add(findings, "warning", "SECURITY_TEST_GAP", tests_path, f"Tests do not mention '{term}'")

def check_code(root: Path, findings: List[Finding]) -> None:
    for ext in ["*.ts", "*.tsx", "*.js", "*.jsx", "*.py", "*.sql"]:
        for path in root.rglob(ext):
            if any(part in {"node_modules", ".git", ".next", "dist", "build"} for part in path.parts):
                continue
            txt = read(path)
            for code, pattern in DANGEROUS_CODE_PATTERNS:
                if re.search(pattern, txt, flags=re.IGNORECASE):
                    add(findings, "warning", code, path, f"Potential dangerous pattern: {code}")

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    parser.add_argument("--scan-code", action="store_true")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    findings: List[Finding] = []
    check_specs(root, findings)
    if args.scan_code:
        check_code(root, findings)
    errors = sum(1 for f in findings if f.severity == "error")
    warnings = sum(1 for f in findings if f.severity == "warning")
    out_dir = root / ".autopilot" / "reports"
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / "security_baseline_report.json"
    out.write_text(json.dumps({"status": "PASS" if errors == 0 else "FAIL", "errors": errors, "warnings": warnings, "findings": [asdict(f) for f in findings]}, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "PASS" if errors == 0 else "FAIL", "errors": errors, "warnings": warnings, "report": str(out)}, indent=2))
    return 0 if errors == 0 else 1

if __name__ == "__main__":
    raise SystemExit(main())
