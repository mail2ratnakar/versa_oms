#!/usr/bin/env python3
"""GATE check_catalog — rules well-formed, traced to a source, ids unique."""
import json, sys
from pathlib import Path
def main():
    d = json.loads(Path("versa-oms/spec/derived/rule_catalog.json").read_text(encoding="utf-8"))
    rules = d["rules"]["lifecycle"] + d["rules"]["validation"]
    fails, ids = [], set()
    for r in rules:
        if not r.get("source"): fails.append(f"no source: {r.get('id')}")
        if r["id"] in ids: fails.append(f"duplicate id: {r['id']}")
        ids.add(r["id"])
    if fails: print("check_catalog: FAIL"); [print("  -", f) for f in fails]; return 1
    print(f"check_catalog: PASS — {len(rules)} rules, all traced, ids unique"); return 0
if __name__ == "__main__": sys.exit(main())
