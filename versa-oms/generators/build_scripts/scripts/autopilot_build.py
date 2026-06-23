#!/usr/bin/env python3
"""
autopilot_build.py

Purpose
-------
Orchestrate the guarded LLM/autopilot build loop.

This script intentionally defaults to planning and validation. It does not deploy.

Usage
-----
python scripts/autopilot_build.py --root . --mode plan --module finance_ops
python scripts/autopilot_build.py --root . --mode validate
python scripts/autopilot_build.py --root . --mode generate --module support_tickets
python scripts/autopilot_build.py --root . --mode check
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

SCRIPT_DIR = Path(__file__).resolve().parent

def run(cmd: List[str], cwd: Path) -> Dict[str, object]:
    proc = subprocess.run(cmd, cwd=str(cwd), text=True, capture_output=True)
    return {"cmd": cmd, "returncode": proc.returncode, "stdout": proc.stdout, "stderr": proc.stderr}

def load_json(path: Path, default=None):
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)

def discover_next(root: Path) -> Optional[str]:
    manifest = load_json(root / "IMPLEMENTATION_MANIFEST.json") or load_json(root / "build" / "IMPLEMENTATION_MANIFEST.json")
    if isinstance(manifest, dict):
        for m in manifest.get("modules", []):
            if m.get("implementation_status") not in ["DONE", "COMPLETED", "COMPLETED_FOR_REVIEW"]:
                return m.get("module_id")
    spec_root = root / "spec" / "modules"
    if spec_root.exists():
        dirs = sorted([p.name for p in spec_root.iterdir() if p.is_dir()])
        return dirs[0] if dirs else None
    return None

def write_report(root: Path, report: Dict[str, object]) -> Path:
    out_dir = root / ".autopilot" / "reports"
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"autopilot_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.json"
    out.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return out

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    parser.add_argument("--mode", choices=["plan", "validate", "generate", "check"], default="plan")
    parser.add_argument("--module", default=None)
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    module = args.module or discover_next(root)
    steps = []

    if args.mode in ["plan", "generate"]:
        cmd = [sys.executable, str(SCRIPT_DIR / "build_from_specs.py"), "--root", str(root)]
        if args.all:
            cmd.append("--all")
        elif module:
            cmd += ["--module", module]
        else:
            cmd.append("--next")
        steps.append(run(cmd, root))

    if args.mode in ["validate", "generate", "check"]:
        steps.append(run([sys.executable, str(SCRIPT_DIR / "validate_specs.py"), "--root", str(root)], root))

    if args.mode == "generate":
        if module and not args.all:
            steps.append(run([sys.executable, str(SCRIPT_DIR / "generate_migrations.py"), "--root", str(root), "--module", module], root))
            steps.append(run(["node", str(SCRIPT_DIR / "generate_routes.js"), "--root", str(root), "--module", module], root))
            steps.append(run(["node", str(SCRIPT_DIR / "generate_tests.js"), "--root", str(root), "--module", module], root))
        else:
            steps.append(run([sys.executable, str(SCRIPT_DIR / "generate_migrations.py"), "--root", str(root), "--all"], root))
            steps.append(run(["node", str(SCRIPT_DIR / "generate_routes.js"), "--root", str(root), "--all"], root))
            steps.append(run(["node", str(SCRIPT_DIR / "generate_tests.js"), "--root", str(root), "--all"], root))

    if args.mode in ["check", "generate"]:
        steps.append(run([sys.executable, str(SCRIPT_DIR / "check_security_baseline.py"), "--root", str(root)], root))
        steps.append(run([sys.executable, str(SCRIPT_DIR / "check_privacy_baseline.py"), "--root", str(root)], root))

    failed = [s for s in steps if s["returncode"] != 0]
    report = {
        "status": "PASS" if not failed else "FAIL",
        "mode": args.mode,
        "module": module,
        "step_count": len(steps),
        "failed_count": len(failed),
        "steps": steps,
        "stop_condition_hit": bool(failed),
        "next_recommended_action": "Review report and fix failures" if failed else "Proceed to next autopilot step"
    }
    out = write_report(root, report)
    print(json.dumps({"status": report["status"], "mode": args.mode, "module": module, "report": str(out), "failed_count": len(failed)}, indent=2))
    return 0 if not failed else 1

if __name__ == "__main__":
    raise SystemExit(main())
