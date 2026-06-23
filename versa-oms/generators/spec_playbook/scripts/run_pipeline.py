from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path
from common import ROOT, SOURCE_DIR, load_state

def run(cmd):
    print("+", " ".join(str(c) for c in cmd))
    subprocess.check_call([sys.executable] + [str(c) for c in cmd])

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scope", default=str(ROOT / "inputs" / "scope.md"))
    parser.add_argument("--mode", choices=["questionnaire_only", "hybrid", "llm_draft", "module"], default="hybrid")
    parser.add_argument("--module", default="")
    args = parser.parse_args()

    if args.mode in ("questionnaire_only", "hybrid", "llm_draft"):
        run([ROOT / "scripts" / "generate_questionnaire.py", "--scope", args.scope])
    if args.mode in ("hybrid", "llm_draft"):
        run([ROOT / "scripts" / "answer_questionnaire_with_llm.py", "--mode", args.mode])
        run([ROOT / "scripts" / "build_source_of_truth_csv.py"])
    if args.mode == "module":
        if not args.module:
            raise SystemExit("--module is required when --mode module")
        run([ROOT / "scripts" / "generate_module_spec.py", "--module", args.module, "--zip"])
        run([ROOT / "scripts" / "validate_module_spec.py", "--module", args.module])
        run([ROOT / "scripts" / "package_module_zip.py", "--module", args.module])
        run([ROOT / "scripts" / "update_completed_pending_summary.py", "--extra-completed", ",".join(load_state().get("completed_modules", []) + [args.module])])

if __name__ == "__main__":
    main()
