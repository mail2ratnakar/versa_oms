#!/usr/bin/env python3
"""GATE check_design — screens use the design system (violet default + design.css) + no raw payload inputs."""
import sys
from pathlib import Path
def main():
    S = Path("versa-oms/spec/derived/screens"); fails = []
    for f in S.glob("*.html"):
        t = f.read_text(encoding="utf-8")
        if 'data-theme="violet"' not in t: fails.append(f"{f.name}: not violet default")
        if 'design.css' not in t: fails.append(f"{f.name}: not linked to design system")
        if 'name="payload"' in t or 'textarea name="json"' in t.lower(): fails.append(f"{f.name}: raw payload input")
    if fails: print("check_design: FAIL"); [print("  -", x) for x in fails]; return 1
    print(f"check_design: PASS — {len(list(S.glob('*.html')))} screens on design system (violet), no raw CRUD"); return 0
if __name__ == "__main__": sys.exit(main())
