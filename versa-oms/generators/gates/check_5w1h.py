#!/usr/bin/env python3
"""GATE check_5w1h — a feature isn't done until Who/What/Where/When/Why/How are ALL answered (from source).

The interrogation made enforceable: reads spec/derived/w5h.json (derive_5w1h) and fails if any feature leaves an
interrogative unanswered. This is the structural-completeness gate the research names — nothing is silently omitted.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
W = ROOT / "spec" / "derived" / "w5h.json"


def main():
    if not W.exists():
        print("check_5w1h: FAIL — w5h.json missing (run derive_5w1h)")
        return 1
    rows = json.loads(W.read_text(encoding="utf-8")).get("journeys", [])
    bad = [r for r in rows if r.get("missing")]
    for r in bad:
        print(f"  FAIL {r['journey']}: unanswered {r['missing']}")
    if bad:
        print(f"check_5w1h: FAIL — {len(bad)} feature(s) not fully specified (Who/What/Where/When/Why/How)")
        return 1
    print(f"check_5w1h: PASS — all {len(rows)} features answer Who/What/Where/When/Why/How")
    return 0


if __name__ == "__main__":
    sys.exit(main())
