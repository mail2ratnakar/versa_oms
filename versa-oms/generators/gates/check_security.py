#!/usr/bin/env python3
"""GATE check_security — no innerHTML/dangerouslySetInnerHTML with data in generated UI (XSS class).
The dual of the commit-review XSS finding: this fault can never regenerate. RUN: python .../check_security.py"""
import re, sys
from pathlib import Path
SCREENS = Path("versa-oms/spec/derived/screens")
def main():
    bad = []
    for f in SCREENS.glob("*.html"):
        t = f.read_text(encoding="utf-8")
        for m in re.finditer(r"\.innerHTML\s*=|dangerouslySetInnerHTML", t):
            # allow innerHTML='' (clear) — flag innerHTML with a variable/expression
            seg = t[m.start():m.start()+40]
            if not re.search(r"\.innerHTML\s*=\s*['\"]\s*['\"]", seg):
                bad.append(f"{f.name}: {seg.strip()[:40]}")
    if bad:
        print("check_security: FAIL — innerHTML/dangerouslySetInnerHTML with data (XSS):")
        [print("  -", b) for b in bad]; return 1
    print(f"check_security: PASS — {len(list(SCREENS.glob('*.html')))} screens, no innerHTML-with-data")
    return 0
if __name__ == "__main__": sys.exit(main())
