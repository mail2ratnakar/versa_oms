#!/usr/bin/env python3
"""Drift guardrail — makes hand-editing generated files impossible to miss.

Re-runs every generator, then checks whether any generated file changed. If so,
either a generated file was hand-edited, or a spec changed without regenerating.
Run on a clean tree (everything committed). Exit 1 on drift (CI gate)."""
import subprocess, sys
from pathlib import Path

GENERATORS = ["gen_screens.py", "gen_actions.py", "gen_effects.py", "gen_guards.py"]
GENERATED = [
    "versa-oms/app/app/staff/schools/crm/page.tsx",
    "versa-oms/app/server/crm/leadService.ts",
    "versa-oms/app/server/lib/transitionEffects.ts",
    "versa-oms/app/server/lib/transitionGuards.ts",
]

def main():
    for g in GENERATORS:
        r = subprocess.run([sys.executable, f"_validation/{g}"], capture_output=True, text=True)
        if r.returncode != 0:
            print(f"generator failed: {g}\n{r.stderr}"); sys.exit(2)
    diff = subprocess.run(["git", "diff", "--stat", "--"] + GENERATED, capture_output=True, text=True).stdout.strip()
    if diff:
        print("DRIFT DETECTED — generated files differ from their specs:\n")
        print(diff)
        print("\nA generated file was hand-edited, or a spec changed without regenerating.")
        print("Fix: edit the SPEC (not the output), re-run the generator, and commit.")
        sys.exit(1)
    print("OK — all generated files match their specs (no drift).")

if __name__ == "__main__":
    main()
