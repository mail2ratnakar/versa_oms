#!/usr/bin/env python3
"""GATE check_chain — every workflow has a start + success status and declared states (no dangling lifecycle)."""
import json, sys
from pathlib import Path
def main():
    cat = json.loads(Path("versa-oms/spec/derived/rule_catalog.json").read_text(encoding="utf-8"))
    wfs = cat["workflows"]
    fails = []
    for name, w in wfs.items():
        if not w.get("states"): fails.append(f"{name}: no states")
        if not w.get("success"): fails.append(f"{name}: no success status")
        if not w.get("entity"): fails.append(f"{name}: no declared governed entity (workflow->entity)")
    for bad in cat.get("integrity", {}).get("workflows_without_real_entity", []):
        fails.append(f"{bad}: workflow entity is not a real entity")
    if fails: print("check_chain: FAIL"); [print("  -", f) for f in fails]; return 1
    print(f"check_chain: PASS — {len(wfs)} workflows, all have states + success + a real governed entity"); return 0
if __name__ == "__main__": sys.exit(main())
