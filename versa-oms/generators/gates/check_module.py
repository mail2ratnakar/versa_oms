#!/usr/bin/env python3
"""GATE check_module — every entity has its complete unit: service + rules + route + screen."""
import json, sys
from pathlib import Path
def main():
    ents = json.loads(Path("versa-oms/spec/derived/canonical.json").read_text(encoding="utf-8"))["entities"]
    D = Path("versa-oms/spec/derived"); fails = []
    for e in ents:
        for kind, p in [("service", D/"services"/f"{e}.service.ts"), ("rules", D/"rules"/f"{e}.rules.ts"),
                        ("route", D/"routes/api"/e/"route.ts"), ("screen", D/"screens"/f"{e}.html")]:
            if not p.exists(): fails.append(f"{e}: missing {kind}")
    if fails: print(f"check_module: FAIL — {len(fails)} incomplete:"); [print("  -",f) for f in fails[:8]]; return 1
    print(f"check_module: PASS — {len(ents)} entities, each with service+rules+route+screen"); return 0
if __name__ == "__main__": sys.exit(main())
