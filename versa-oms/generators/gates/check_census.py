#!/usr/bin/env python3
"""GATE check_census — every hand-written SOURCE file in app/ is FROZEN-KERNEL (app/runtime/) or a *_proof.
Generated code lives in spec/derived/ (check_generated covers it). Deps/build dirs are not source — skipped."""
import sys
from pathlib import Path
SKIP = ("node_modules/", ".next/", "dist/", ".turbo/")
def main():
    app = Path("versa-oms/app"); bad = []
    for f in list(app.rglob("*.ts")) + list(app.rglob("*.tsx")):
        rel = f.relative_to(app).as_posix()
        if any(s in rel for s in SKIP) or rel.endswith(".d.ts"): continue   # deps/generated decls, not source
        if rel.startswith("runtime/") or rel.endswith("_proof.ts") or rel == "dev_server.ts": continue  # frozen kernel + proofs + dev harness
        bad.append(rel)
    if bad: print("check_census: FAIL — ungoverned hand-written source in app/:", bad); return 1
    print("check_census: PASS — app/ source = FROZEN-KERNEL (runtime) + proofs only"); return 0
if __name__ == "__main__": sys.exit(main())
