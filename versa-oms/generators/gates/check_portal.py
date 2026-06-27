#!/usr/bin/env python3
"""GATE check_portal — every FROZEN journey (school SJ + staff OJ) has a portal screen on the design system."""
import json, sys
from pathlib import Path
PORTALS = [("versa-oms/spec/school_journeys.json", "versa-oms/spec/derived/portal", True),
           ("versa-oms/spec/staff_journeys.json", "versa-oms/spec/derived/staff", False)]
def main():
    fails, total = [], 0
    for spec_path, dirp, scoped in PORTALS:
        spec = json.loads(Path(spec_path).read_text(encoding="utf-8")); P = Path(dirp)
        for j in spec["journeys"]:
            total += 1
            f = P / (j["id"] + ".html")
            if not f.exists(): fails.append(j["id"] + ": no screen"); continue
            t = f.read_text(encoding="utf-8")
            if 'data-theme="violet"' not in t: fails.append(j["id"] + ": not violet")
            if '<use href="#' not in t: fails.append(j["id"] + ": no design icons")
            if scoped and j["scope"] == "school" and j["shape"] != "register" and "schoolId()" not in t:
                fails.append(j["id"] + ": school-scoped not filtered to schoolId()")
    if fails: print("check_portal: FAIL"); [print("  -", x) for x in fails]; return 1
    print("check_portal: PASS - " + str(total) + " journey screens across 2 portals (school SJ + staff OJ)"); return 0
if __name__ == "__main__": sys.exit(main())
