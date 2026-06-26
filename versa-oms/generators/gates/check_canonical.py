#!/usr/bin/env python3
"""
================================================================================
GATE ⭐ —  check_canonical                             (v2 vibe-coding pipeline)
================================================================================
THE gate. Its absence is the single reason v1 had to be deleted. It reads the
canonical (Robot 2's output) and FAILS the build if the data model is not whole:

  C1. KEYED.        Every entity has a primary_key.
  C2. FKs RESOLVE.  integrity.all_fks_resolve == true (no FK points at a non-entity).
  C3. NO CYCLES.    integrity.has_cycle == false (an unbuildable model).
  C4. NO ORPHANS.   integrity.orphans == [] (no disconnected island — the candidate_results pattern).
  C5. CONNECTED.    Every non-root entity is reachable from a root via FKs.
  C6. SOURCED.      Every entity has source_rows (it traces to the BRD/supplement — nothing off-spec).

If any check fails the build STOPS. This is what makes "no fake ids / no broken links / no off-spec
entity" structural instead of remembered.

INPUT:  versa-oms/spec/derived/canonical.json
RUN:    python versa-oms/generators/gates/check_canonical.py     (exit 0 = green, 1 = fail)
================================================================================
"""
import json
import sys
from pathlib import Path

CANON = Path("versa-oms/spec/derived/canonical.json")


def main():
    if not CANON.exists():
        print("check_canonical: FAIL — canonical.json missing (run derive_canonical)")
        return 1
    d = json.loads(CANON.read_text(encoding="utf-8"))
    ents, integ = d["entities"], d["integrity"]
    fails = []

    for n, e in ents.items():
        if not e.get("primary_key"):
            fails.append(f"C1 unkeyed entity: {n}")
        if not e.get("source_rows"):
            fails.append(f"C6 off-spec entity (no source): {n}")
    if not integ["all_fks_resolve"]:
        fails.append(f"C2 unresolved FKs: {integ['unresolved_fks']}")
    if integ["has_cycle"]:
        fails.append(f"C3 cycle: {integ['cycle_members']}")
    if integ["orphans"]:
        fails.append(f"C4 orphan islands: {integ['orphans']}")

    # C5 connectivity: every entity reachable from a root via the FK (references) graph
    roots = set(integ["roots"])
    reachable, frontier = set(roots), list(roots)
    # walk inbound: from roots, follow referenced_by
    while frontier:
        cur = frontier.pop()
        for n, e in ents.items():
            if cur in e.get("references", []) and n not in reachable:
                reachable.add(n)
                frontier.append(n)
    unreachable = sorted(set(ents) - reachable)
    if unreachable:
        fails.append(f"C5 unreachable from any root: {unreachable}")

    if fails:
        print("check_canonical: FAIL")
        for f in fails:
            print("  -", f)
        return 1
    print(f"check_canonical: PASS — {len(ents)} entities · all keyed · FKs resolve · no cycles/orphans · "
          f"connected · all sourced")
    return 0


if __name__ == "__main__":
    sys.exit(main())
