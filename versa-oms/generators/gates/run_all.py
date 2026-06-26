#!/usr/bin/env python3
"""Run all v2 gates — the single 'is v2 sound?' command. Exit 0 = all green."""
import subprocess, sys
GATES = ["check_canonical","check_spec","check_catalog","check_chain","check_security","check_design",
         "check_generated","check_intent","check_census","check_module","check_journey","check_masking","check_dependencies"]
def main():
    print("=== v2 GATES ==="); npass = 0
    for g in GATES:
        r = subprocess.run([sys.executable, f"versa-oms/generators/gates/{g}.py"], capture_output=True, text=True)
        print(("  PASS  " if r.returncode==0 else "  FAIL  ") + (r.stdout.strip().splitlines() or [""])[-1])
        npass += r.returncode==0
    print(f"\n{npass}/{len(GATES)} gates green.")
    return 0 if npass==len(GATES) else 1
if __name__ == "__main__": sys.exit(main())
