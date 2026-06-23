#!/usr/bin/env python3
"""
check_privacy_baseline.py

Purpose
-------
Verify privacy and data-minimization requirements in specs and generated code.

Usage
-----
python scripts/check_privacy_baseline.py --root .
python scripts/check_privacy_baseline.py --root . --scan-code
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List

REQUIRED_PRIVACY_TERMS = ["student", "mask", "sensitive", "restricted"]
FORBIDDEN_CODE_PATTERNS = [
    ("LOG_PARENT_PHONE", r"console\.log\([^\n]*(parent_phone|parent_mobile|phone)"),
    ("LOG_PAYMENT_PAYLOAD", r"console\.log\([^\n]*(provider_payload|payment_payload)"),
    ("LOG_SIGNED_URL", r"console\.log\([^\n]*(signed_url|signedUrl)"),
    ("RAW_PUBLIC_PII", r"public.*(parent_email|parent_phone|student_dob|payment_reference)"),
    ("AADHAAR_FIELD", r"aadhaar|aadhar"),
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
    matrix = root / "FIELD_MASKING_MATRIX.json"
    if not matrix.exists() and not (root / "build" / "FIELD_MASKING_MATRIX.json").exists():
        add(findings, "warning", "FIELD_MASKING_MATRIX_MISSING", matrix, "FIELD_MASKING_MATRIX.json missing")
    for d in module_dirs(root):
        dc = d / "data_classification.json"
        if not dc.exists():
            add(findings, "error", "DATA_CLASSIFICATION_MISSING", dc, "data_classification.json missing")
            continue
        txt = read(dc).lower()
        for term in REQUIRED_PRIVACY_TERMS:
            if term not in txt:
                add(findings, "warning", "PRIVACY_TERM_MISSING", dc, f"Data classification does not mention '{term}'")
        if "never_browser_trusted" not in txt:
            add(findings, "warning", "NEVER_BROWSER_TRUSTED_MISSING", dc, "Missing never_browser_trusted classification")

def check_code(root: Path, findings: List[Finding]) -> None:
    for ext in ["*.ts", "*.tsx", "*.js", "*.jsx", "*.py"]:
        for path in root.rglob(ext):
            if any(part in {"node_modules", ".git", ".next", "dist", "build"} for part in path.parts):
                continue
            txt = read(path)
            for code, pattern in FORBIDDEN_CODE_PATTERNS:
                if re.search(pattern, txt, flags=re.IGNORECASE):
                    severity = "error" if code == "AADHAAR_FIELD" else "warning"
                    add(findings, severity, code, path, f"Potential privacy issue: {code}")

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
    out = out_dir / "privacy_baseline_report.json"
    out.write_text(json.dumps({"status": "PASS" if errors == 0 else "FAIL", "errors": errors, "warnings": warnings, "findings": [asdict(f) for f in findings]}, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "PASS" if errors == 0 else "FAIL", "errors": errors, "warnings": warnings, "report": str(out)}, indent=2))
    return 0 if errors == 0 else 1

if __name__ == "__main__":
    raise SystemExit(main())
