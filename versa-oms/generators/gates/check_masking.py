#!/usr/bin/env python3
"""GATE check_masking — every sensitive/restricted/private field (BRD classification) has a masking rule.
The leak dual: a classified field with NO masking rule is a data leak. RUN: python .../check_masking.py"""
import csv, json, re, sys
from pathlib import Path
def main():
    cat = json.loads(Path("versa-oms/spec/derived/rule_catalog.json").read_text(encoding="utf-8"))
    masked = {(m["entity"], m["field"]) for m in cat["rules"].get("masking", [])}
    rows = list(csv.DictReader(open("versa-oms/source-of-truth/olympiads_brd/versa_olympiads_master_brd_00_20.csv", encoding="utf-8-sig")))
    leaks = []
    for r in rows:
        if r["section"].startswith("05") and r["module"]=="fields" and r["security_level"].strip() in ("sensitive","restricted","private"):
            mf = re.search(r"field '([^']+)' is required in collection '([^']+)'", r["question"])
            if mf and (mf.group(2), mf.group(1)) not in masked:
                leaks.append(f"{mf.group(2)}.{mf.group(1)} ({r['security_level'].strip()})")
    if leaks: print(f"check_masking: FAIL — {len(leaks)} classified fields with NO masking rule (leak):", leaks[:6]); return 1
    print(f"check_masking: PASS — {len(masked)} classified fields all carry a masking rule (no leak)"); return 0
if __name__ == "__main__": sys.exit(main())
