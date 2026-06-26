#!/usr/bin/env python3
"""GATE check_journey — the journeys run end-to-end. Today: J1 (acquire school). Exit 0 = pass."""
import subprocess, sys
def main():
    r = subprocess.run("npx tsx app/j1_proof.ts", cwd="versa-oms", shell=True, capture_output=True, text=True)
    if r.returncode != 0:
        print("check_journey: FAIL — J1 did not pass"); print((r.stdout or "")[-300:]); print((r.stderr or "")[-200:]); return 1
    print("check_journey: PASS — J1 runs end-to-end (create/validate/list/lifecycle)"); return 0
if __name__ == "__main__": sys.exit(main())
