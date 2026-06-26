#!/usr/bin/env python3
"""GATE check_journey — every journey proof (app/*_proof.ts) runs end-to-end. Exit 0 = all pass."""
import subprocess, sys
from pathlib import Path
def main():
    proofs = sorted(Path("versa-oms/app").glob("*_proof.ts"))
    if not proofs: print("check_journey: FAIL — no journey proofs"); return 1
    ok = True
    for p in proofs:
        r = subprocess.run(f"npx tsx app/{p.name}", cwd="versa-oms", shell=True, capture_output=True, text=True)
        print(f"  {'PASS' if r.returncode==0 else 'FAIL'}  {p.name}")
        if r.returncode != 0: ok = False; print((r.stdout or '')[-250:])
    print(f"check_journey: {'PASS' if ok else 'FAIL'} — {len(proofs)} journey(s)")
    return 0 if ok else 1
if __name__ == "__main__": sys.exit(main())
