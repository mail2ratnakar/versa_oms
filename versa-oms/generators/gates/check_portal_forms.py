#!/usr/bin/env python3
"""GATE check_portal_forms — PORTAL forms never expose computed/system fields (or raw payloads) as inputs.

Closes the dual gap that let the Import page ship as raw CRUD: check_design only scans the entity screens
(spec/derived/screens), so portal manage/import screens (gen_portal) had NO form-hygiene gate. This is it.
"""
import json
import re
import sys
from pathlib import Path


def main():
    canon = json.loads(Path("versa-oms/spec/derived/canonical.json").read_text(encoding="utf-8"))["entities"]
    surfaces = [("versa-oms/spec/staff_journeys.json", "versa-oms/spec/derived/staff"),
                ("versa-oms/spec/school_journeys.json", "versa-oms/spec/derived/portal")]
    fails, n = [], 0
    for spec_path, screen_dir in surfaces:
        spec = json.loads(Path(spec_path).read_text(encoding="utf-8"))
        for j in spec["journeys"]:
            ent = j.get("entity")
            if not ent or ent not in canon:
                continue
            html = Path(screen_dir) / f'{j["id"]}.html'
            if not html.exists():
                continue
            t = html.read_text(encoding="utf-8")
            n += 1
            if 'name="payload"' in t or 'name="json"' in t:
                fails.append(f'{j["id"]} ({ent}): raw payload input')
            for f in canon[ent]["fields"]:
                if "system" in f.get("rule", "") and re.search(rf'<(?:input|select|textarea)[^>]*name="{re.escape(f["name"])}"', t):
                    fails.append(f'{j["id"]} ({ent}): computed/system field "{f["name"]}" exposed as a form input')
    if fails:
        print("check_portal_forms: FAIL\n  " + "\n  ".join(fails))
        return 1
    print(f"check_portal_forms: PASS — {n} portal forms, no computed/system field (or raw payload) exposed as input")
    return 0


if __name__ == "__main__":
    sys.exit(main())
