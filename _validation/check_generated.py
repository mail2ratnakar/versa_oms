#!/usr/bin/env python3
"""Drift guardrail — makes hand-editing generated files impossible to miss.

Re-runs every generator, then checks whether any generated file changed. If so,
either a generated file was hand-edited, or a spec changed without regenerating.
Run on a clean tree (everything committed). Exit 1 on drift (CI gate)."""
import subprocess, sys
from pathlib import Path

# Order matters: services (modules) -> core staff modules/pages (core) -> pages (ui) -> page/route overrides (screens/actions) -> lib (effects/guards).
# gen_core owns the olympiad-core staff modules+pages (staff/core/*) — now drift-guarded so they can't silently lag.
GENERATORS = ["gen_modules.py", "gen_core.py", "gen_ui.py", "gen_screens.py", "gen_actions.py", "gen_effects.py", "gen_guards.py", "gen_endpoints.py"]
GENERATED = [
    "versa-oms/app/server/modules",       # all staff + secondary services (gen_modules)
    "versa-oms/app/app/api/staff",        # all staff + secondary API routes
    "versa-oms/app/app/staff",            # all staff + secondary pages (gen_ui/gen_screens)
    "versa-oms/app/components/navLinks.ts",  # generated sidebar nav (gen_ui.gen_nav)
    "versa-oms/app/server/crm/leadService.ts",
    "versa-oms/app/server/lib/transitionEffects.ts",
    "versa-oms/app/server/lib/transitionPreconditions.ts",
    "versa-oms/app/server/lib/transitionGuards.ts",
]

def main():
    for g in GENERATORS:
        r = subprocess.run([sys.executable, f"_validation/{g}"], capture_output=True, text=True)
        if r.returncode != 0:
            print(f"generator failed: {g}\n{r.stderr}"); sys.exit(2)
    diff = subprocess.run(["git", "diff", "--stat", "--"] + GENERATED, capture_output=True, text=True).stdout.strip()
    if diff:
        print("DRIFT DETECTED - generated files differ from their specs:\n")
        print(diff)
        print("\nA generated file was hand-edited, or a spec changed without regenerating.")
        print("Fix: edit the SPEC (not the output), re-run the generator, and commit.")
        sys.exit(1)
    print("OK - all generated files match their specs (no drift).")

if __name__ == "__main__":
    main()
