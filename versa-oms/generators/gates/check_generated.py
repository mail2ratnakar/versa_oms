#!/usr/bin/env python3
"""GATE check_generated — re-run all robots; if spec/derived/ changes, the output was hand-edited (drift)."""
import subprocess, sys
ROBOTS = ["derive_specs","derive_canonical","derive_catalog","derive_annotations","derive_5w1h","derive_deferred","gen_db","gen_services","gen_routes","gen_rules","gen_screens","gen_portal","gen_fixtures","gen_annotate","gen_manifest"]
def main():
    for r in ROBOTS:
        subprocess.run([sys.executable, f"versa-oms/generators/robots/{r}.py"], capture_output=True)
    diff = subprocess.run(["git","status","--porcelain","versa-oms/spec/derived"], capture_output=True, text=True).stdout.strip()
    if diff:
        print("check_generated: FAIL — generated output drifted from source (hand-edited?):"); print(diff[:600]); return 1
    print("check_generated: PASS — all derived output matches re-running the robots (no drift)"); return 0
if __name__ == "__main__": sys.exit(main())
