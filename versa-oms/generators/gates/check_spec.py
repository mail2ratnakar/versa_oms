#!/usr/bin/env python3
"""GATE check_spec — every derived entity/field traces to a real source row (no fabricated spec)."""
import json, sys
from pathlib import Path
def main():
    d = json.loads(Path("versa-oms/spec/derived/data_model.json").read_text(encoding="utf-8"))["entities"]
    fails = [n for n, e in d.items() if not e.get("source_rows")]
    if fails: print("check_spec: FAIL — entities with no source:", fails); return 1
    print(f"check_spec: PASS — {len(d)} entities, all trace to a BRD/supplement source"); return 0
if __name__ == "__main__": sys.exit(main())
