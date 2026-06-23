from __future__ import annotations

import argparse
import subprocess
import sys
from common import ROOT, load_state

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=1)
    args = parser.parse_args()

    state = load_state()
    pending = state.get("pending_modules", [])
    for module_id in pending[:args.limit]:
        subprocess.check_call([sys.executable, str(ROOT / "scripts" / "run_pipeline.py"), "--mode", "module", "--module", module_id])

if __name__ == "__main__":
    main()
