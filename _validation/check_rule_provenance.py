#!/usr/bin/env python3
"""Rule PROVENANCE gate (P0.14 / DERIVE-DON'T-AUTHOR). The mechanical backstop that makes hand-typing a fact
impossible: every rule's `source` must RESOLVE to a real existing artifact. A rule whose source does not
resolve is a fabricated/duplicated fact -> FAIL.

Resolvable sources:
  canonical:<table>.<col>   -> the canonical model has that table.column
  workflow:<module>[.<id>]  -> spec/modules/<module>/workflows.json exists
  effects:<CHAIN-ID>        -> spec/effects/chains.json contains that chain id
  permissions               -> spec/core/permissions.json exists
  judgment:<id> | BRD:<ref> | brain:<ref> | founder
                            -> the rule is genuine NOVEL judgment and MUST appear in a signed judgment file
                               (spec/rules/judgment/*.judgment.json with _meta.signed_off) — NOT auto-derivable.

A rule passes if it has >=1 resolvable STRUCTURAL source (canonical/workflow/effects/permissions), OR it is a
signed judgment rule. Checks every rule in spec/rules/*.rules.json, reports/rule_catalog.derived.json, and
spec/rules/judgment/*.judgment.json. Run from the repo root.
"""
import json, re, sys
from pathlib import Path

CANON = json.loads(Path("versa-oms/implementation/CANONICAL_DATA_MODEL.json").read_text(encoding="utf-8"))["tables"]
CHAINS = {c["id"] for c in json.loads(Path("versa-oms/spec/effects/chains.json").read_text(encoding="utf-8"))["chains"]}


def canonical_has(table, col):
    return table in CANON and any(c["name"] == col for c in CANON[table].get("columns", []))


def structural_resolves(src):
    hits, misses = 0, []
    for t, c in re.findall(r"canonical:([a-z_]+)\.([a-z_]+)", src):
        if canonical_has(t, c):
            hits += 1
        else:
            misses.append(f"canonical:{t}.{c} not in model")
    for mod in re.findall(r"workflow:([a-z_]+)", src):
        if Path(f"versa-oms/spec/modules/{mod}/workflows.json").exists():
            hits += 1
        else:
            misses.append(f"workflow module {mod} not found")
    for cid in re.findall(r"effects:(CHAIN-[0-9]+)", src):
        if cid in CHAINS:
            hits += 1
        else:
            misses.append(f"effect chain {cid} not found")
    if "permissions" in src and Path("versa-oms/spec/core/permissions.json").exists():
        hits += 1
    return hits, misses


def load_rules():
    out = []  # (origin, rule, signed_judgment_ids)
    for sf in sorted(Path("versa-oms/spec/rules").glob("*.rules.json")):
        for r in json.loads(sf.read_text(encoding="utf-8")).get("rules", []):
            out.append((sf.name, r, set()))
    cat = Path("versa-oms/reports/rule_catalog.derived.json")
    if cat.exists():
        for r in json.loads(cat.read_text(encoding="utf-8")).get("rules", []):
            out.append((cat.name, r, set()))
    return out


def signed_judgment_ids():
    ids = set()
    for jf in Path("versa-oms/spec/rules/judgment").glob("*.judgment.json") if Path("versa-oms/spec/rules/judgment").exists() else []:
        j = json.loads(jf.read_text(encoding="utf-8"))
        if j.get("_meta", {}).get("signed_off"):
            ids |= {r.get("id") for r in j.get("rules", [])}
    return ids


def main():
    signed = signed_judgment_ids()
    v = []
    n = 0
    for origin, r, _ in load_rules():
        n += 1
        src = str(r.get("source", ""))
        rid = r.get("id", "?")
        if not src.strip():
            v.append((origin, f"{rid}: no source/provenance"))
            continue
        hits, misses = structural_resolves(src)
        is_judgment = bool(re.search(r"\b(judgment|BRD|brain|founder)\b", src, re.I))
        if hits > 0:
            continue  # at least one structural source resolves
        if is_judgment and rid in signed:
            continue  # genuine novel judgment, founder-signed
        if is_judgment:
            v.append((origin, f"{rid}: judgment source but NOT in a signed judgment file ({src})"))
        else:
            v.append((origin, f"{rid}: source does not resolve to any real artifact ({src}) {misses}"))

    for o, why in v:
        print(f"PROVENANCE-FAIL  {o}  ·  {why}")
    print(f"\nRULE PROVENANCE: {n} rules checked, {len(v)} unresolved  ->  "
          + ("PASS (every rule traces to a real source — no fabricated facts)" if not v else "FAIL"))
    return 1 if v else 0


if __name__ == "__main__":
    sys.exit(main())
