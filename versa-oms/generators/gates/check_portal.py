#!/usr/bin/env python3
"""GATE check_portal — every FROZEN SJ (school_journeys.json) has a school-portal screen on the design system."""
import json, sys
from pathlib import Path
def main():
    spec = json.loads(Path("versa-oms/spec/school_journeys.json").read_text(encoding="utf-8"))
    P = Path("versa-oms/spec/derived/portal"); fails = []
    for j in spec["journeys"]:
        f = P / (j["id"] + ".html")
        if not f.exists(): fails.append(j["id"] + ": no screen"); continue
        t = f.read_text(encoding="utf-8")
        if 'data-theme="violet"' not in t: fails.append(j["id"] + ": not violet")
        if "Your journey" not in t: fails.append(j["id"] + ": no SJ nav")
        if "<use href=\"#" not in t: fails.append(j["id"] + ": no design icons")
        if j["scope"] == "school" and j["shape"] != "register" and "schoolId()" not in t:
            fails.append(j["id"] + ": school-scoped screen not filtered to schoolId()")
    if fails: print("check_portal: FAIL"); [print("  -", x) for x in fails]; return 1
    print("check_portal: PASS - " + str(len(spec["journeys"])) + " SJ screens (violet, scoped, icons)"); return 0
if __name__ == "__main__": sys.exit(main())
