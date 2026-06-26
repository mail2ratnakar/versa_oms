#!/usr/bin/env python3
"""
================================================================================
ROBOT 2 of 8  —  derive_canonical                      (v2 vibe-coding pipeline)
================================================================================
WHAT IT DOES (one line):
    Takes Robot 1's faithful data model and RESOLVES it into the build-ready
    canonical: every foreign key resolved to a real entity, the relationship
    graph made bidirectional, the dependency build-order computed, and the
    integrity of the whole graph reported (dangling FKs, cycles, orphan islands).

WHERE IT SITS:
    derive_specs --> spec/derived/data_model.json --> [derive_canonical] --> spec/derived/canonical.json
                                                                              --> gen_db / gen_services (Robots 4,5)
    check_canonical (the ⭐ gate) reads this robot's output and FAILS the build
    if any FK is unresolved, any entity is an orphan island, or any cycle exists.

INPUT  (the only thing it reads):
    versa-oms/spec/derived/data_model.json      (Robot 1's output — faithful entities + FKs)

OUTPUT (the only thing it writes):
    versa-oms/spec/derived/canonical.json
      { build_order: [ entities in dependency order — referenced entities first ],
        entities: { <name>: {
            primary_key, business_identifier, fields,
            references:    [ entities this one points to (outbound FKs) ],
            referenced_by: [ entities that point to this one (inbound) ],
            is_root,       source_rows } },
        integrity: { all_fks_resolve, unresolved_fks[], has_cycle, cycle_members[],
                     roots[], orphans[] } }

INTEGRITY — INVARIANTS THIS ROBOT MUST NEVER BREAK:
    I1. DERIVED-ONLY. Reads only data_model.json. Adds no entity, field, or FK. (No invention.)
    I2. RESOLVE, DON'T DROP. Every FK is checked against the declared entities. A FK whose target
        does NOT exist is RECORDED in integrity.unresolved_fks — never silently dropped. (A dropped
        broken link is how v1 hid disconnection; here it is surfaced for check_canonical to reject.)
    I3. BIDIRECTIONAL. Computes referenced_by (inbound) for every entity — so disconnection is visible.
    I4. BUILD ORDER + CYCLES. Topological order (an entity comes after everything it references);
        any entity left in a cycle is reported in integrity.cycle_members (an unbuildable model).
    I5. ORPHAN DETECTION + IDEMPOTENT. An entity with no inbound AND no outbound edge is an orphan
        island (the v1 `candidate_results` pattern) and is listed in integrity.orphans. Same input
        -> byte-identical output.

VERIFIED BY:
    check_canonical (downstream): asserts integrity.all_fks_resolve == true, has_cycle == false,
    orphans == []. Re-run this robot + that gate; green = the data model is build-ready.

HOW TO RUN:
    python versa-oms/generators/robots/derive_canonical.py      # from the repo root (after Robot 1)

DO NOT:
    - Hand-edit canonical.json. Fix the BRD or Robot 1, re-run both.
    - "Fix" an unresolved FK by deleting it — that hides a real model gap; fix the source.

STATUS: Robot 2/8. Resolves the data-model graph. (Type normalisation + standard system fields can be
    layered here later if the BRD underspecifies a type; today it stays faithful to Robot 1.)
================================================================================
"""
import json
from pathlib import Path

IN = Path("versa-oms/spec/derived/data_model.json")
OUT = Path("versa-oms/spec/derived/canonical.json")


def main():
    if not IN.exists():
        raise SystemExit("derive_canonical: run Robot 1 (derive_specs) first — missing data_model.json")
    dm = json.loads(IN.read_text(encoding="utf-8"))["entities"]
    names = set(dm)

    # outbound FKs, resolved against declared entities (I2)
    out_edges, unresolved = {n: set() for n in names}, []
    for n, e in dm.items():
        for rel in e["relationships"]:
            tgt = rel["references"]
            if tgt in names:
                out_edges[n].add(tgt)
            else:
                unresolved.append({"entity": n, "field": rel["field"], "references": tgt})

    # inbound (I3)
    in_edges = {n: set() for n in names}
    for n, tgts in out_edges.items():
        for t in tgts:
            in_edges[t].add(n)

    roots = sorted(n for n in names if not out_edges[n])

    # topological build order: an entity is ready when every entity it references is placed (I4)
    order, placed, remaining = [], set(), set(names)
    while remaining:
        ready = sorted(n for n in remaining if out_edges[n] <= placed)
        if not ready:
            break  # the rest are in a cycle
        order += ready
        placed |= set(ready)
        remaining -= set(ready)
    cycle = sorted(remaining)

    entities = {}
    for n in sorted(names):
        e = dm[n]
        entities[n] = {
            "primary_key": e["primary_key"],
            "business_identifier": e["business_identifier"],
            "fields": e["fields"],
            "references": sorted(out_edges[n]),
            "referenced_by": sorted(in_edges[n]),
            "is_root": n in roots,
            "source_rows": e["source_rows"],
        }

    integrity = {
        "all_fks_resolve": not unresolved,
        "unresolved_fks": unresolved,
        "has_cycle": bool(cycle),
        "cycle_members": cycle,
        "roots": roots,
        "orphans": sorted(n for n in names if not out_edges[n] and not in_edges[n]),  # disconnected islands (I5)
    }
    OUT.write_text(json.dumps({"_robot": "derive_canonical", "_source": str(IN),
                               "build_order": order, "entities": entities, "integrity": integrity}, indent=2) + "\n",
                   encoding="utf-8")
    print(f"derive_canonical: {len(names)} entities · all_fks_resolve={integrity['all_fks_resolve']} · "
          f"cycle={integrity['has_cycle']} · orphans={integrity['orphans']} · roots={roots}")
    if unresolved:
        print(f"  UNRESOLVED FKs (check_canonical WILL fail): {unresolved}")


if __name__ == "__main__":
    main()
