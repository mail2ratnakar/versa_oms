#!/usr/bin/env python3
"""GATE check_dependencies — the build order is a valid topological sort of the FK dependency graph:
every entity comes AFTER every entity it depends on (references). gen_db relies on this to apply cleanly."""
import json, sys
from pathlib import Path
def main():
    c = json.loads(Path("versa-oms/spec/derived/canonical.json").read_text(encoding="utf-8"))
    order, ents = c["build_order"], c["entities"]
    pos = {n: i for i, n in enumerate(order)}; bad = []
    if sorted(order) != sorted(ents): bad.append("build_order != entity set")
    for n in order:
        for dep in ents[n]["references"]:
            if pos.get(dep, 10**9) >= pos[n]:
                bad.append(f"{n} is built before its dependency {dep}")
    if bad: print("check_dependencies: FAIL"); [print("  -", b) for b in bad[:8]]; return 1
    print(f"check_dependencies: PASS — build order is a valid topo-sort ({len(order)} entities, deps-first)"); return 0
if __name__ == "__main__": sys.exit(main())
