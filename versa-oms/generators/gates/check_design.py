#!/usr/bin/env python3
"""GATE check_design — screens use the design system (violet + design.css), no raw CRUD, AND are COMPLETE:
every lifecycle entity's screen wires EVERY transition action button (no half-baked screens)."""
import json, sys
from pathlib import Path
def ent_for_wf(wf, ents):
    for e in sorted(ents, key=len, reverse=True):
        if e.rstrip("s") in wf.lower(): return e
    return None
def main():
    S = Path("versa-oms/spec/derived/screens")
    cat = json.loads(Path("versa-oms/spec/derived/rule_catalog.json").read_text(encoding="utf-8"))
    ents = json.loads(Path("versa-oms/spec/derived/canonical.json").read_text(encoding="utf-8"))["entities"]
    ent_trans = {n: [] for n in ents}
    for t in cat["rules"]["lifecycle"]:
        e = ent_for_wf(t["workflow"], ents)
        if e: ent_trans[e].append(t["action"])
    fails = []
    for f in S.glob("*.html"):
        t = f.read_text(encoding="utf-8"); name = f.stem
        if 'data-theme="violet"' not in t: fails.append(f"{f.name}: not violet")
        if 'design.css' not in t: fails.append(f"{f.name}: not on design system")
        if 'name="payload"' in t or 'name="json"' in t: fails.append(f"{f.name}: raw payload input")
        for action in ent_trans.get(name, []):
            if action not in t: fails.append(f"{f.name}: missing lifecycle action '{action}' (HALF-BAKED screen)")
    if fails: print("check_design: FAIL"); [print("  -", x) for x in fails[:10]]; return 1
    nlife = sum(1 for n in ent_trans if ent_trans[n])
    print(f"check_design: PASS — {len(list(S.glob('*.html')))} screens (violet, no-raw-CRUD), {nlife} with COMPLETE lifecycle actions"); return 0
if __name__ == "__main__": sys.exit(main())
