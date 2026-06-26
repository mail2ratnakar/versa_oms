#!/usr/bin/env python3
"""Rule-catalog gate (P0.14 / spec/rules/RULE_TAXONOMY.md). The rule layer is DERIVED (reports/
rule_catalog.derived.json, from canonical/workflows) + a small founder-signed JUDGMENT
(spec/rules/judgment/*.judgment.json). This gate validates that model:
  - the derived catalog exists and every rule is well-formed (rule.schema.json required keys, valid type)
  - every judgment file is signed (_meta.signed_off) and its server_set fields exist in the canonical model
  - every entity a judgment enables has compiled enforcement (app/server/rules/<entity>.generated.ts)
Provenance (does each rule trace to a real source?) is a separate gate: check_rule_provenance.py. Run from root.
"""
import json, sys
from pathlib import Path

RULES_DIR = Path("versa-oms/spec/rules")
JUDGMENT_DIR = RULES_DIR / "judgment"
CATALOG = Path("versa-oms/reports/rule_catalog.derived.json")
ENFORCE = Path("versa-oms/app/server/rules")
CANON = json.loads(Path("versa-oms/implementation/CANONICAL_DATA_MODEL.json").read_text(encoding="utf-8"))["tables"]


def canon_has(table, col):
    return table in CANON and any(c["name"] == col for c in CANON[table].get("columns", []))


def main():
    schema = json.loads((RULES_DIR / "rule.schema.json").read_text(encoding="utf-8"))
    required, types = schema["required"], schema["properties"]["type"]["enum"]
    v = []

    if not CATALOG.exists():
        v.append((CATALOG.name, "derived catalog missing — run derive_rule_catalog.py"))
    else:
        catalog = json.loads(CATALOG.read_text(encoding="utf-8")).get("rules", [])
        for r in catalog:
            rid = r.get("id", "?")
            for k in required:
                if k not in r:
                    v.append((CATALOG.name, f"rule {rid} missing required '{k}'"))
            if r.get("type") not in types:
                v.append((CATALOG.name, f"rule {rid} invalid type {r.get('type')!r}"))
        # TRACEABILITY: every rule id must be unique, so an issue traces to exactly ONE rule.
        from collections import Counter
        for rid, c in Counter(r.get("id") for r in catalog).items():
            if c > 1:
                v.append((CATALOG.name, f"rule id '{rid}' is NOT unique (x{c}) — traceability needs unique ids (resolve the conflict)"))

    for jf in sorted(JUDGMENT_DIR.glob("*.judgment.json")) if JUDGMENT_DIR.exists() else []:
        j = json.loads(jf.read_text(encoding="utf-8"))
        if not j.get("_meta", {}).get("signed_off"):
            v.append((jf.name, "judgment not founder-signed (_meta.signed_off)"))
        for entity, actions in j.get("server_set", {}).items():
            for action, conf in actions.items():
                if not str(conf.get("source", "")).strip():
                    v.append((jf.name, f"{entity}.{action} server_set has no source"))
                for f in conf.get("fields", []):
                    if not canon_has(entity, f):
                        v.append((jf.name, f"{entity}.{action} server_set field '{f}' not in canonical {entity}"))
            if not (ENFORCE / f"{entity}.generated.ts").exists():
                v.append((jf.name, f"{entity} enabled by judgment but enforcement not compiled (run gen_rules.py)"))

    ELIG_DIR = RULES_DIR / "eligibility"
    for ef in sorted(ELIG_DIR.glob("*.eligibility.json")) if ELIG_DIR.exists() else []:
        e = json.loads(ef.read_text(encoding="utf-8"))
        if not e.get("_meta", {}).get("signed_off"):
            v.append((ef.name, "eligibility file not founder-signed (_meta.signed_off)"))
        for r in e.get("rules", []):
            if r.get("type") != "eligibility":
                v.append((ef.name, f"rule {r.get('id')} in an eligibility file is not type 'eligibility'"))
            ent = r.get("entity")
            if ent and not (ENFORCE / f"{ent}.generated.ts").exists():
                v.append((ef.name, f"{ent} eligibility declared but enforcement not compiled (run gen_rules.py)"))

    for f, why in v:
        print(f"RULES-FAIL  {f}  ·  {why}")
    print(f"\nRULE CATALOG: {len(v)} issue(s)  ->  {'PASS (catalog well-formed; judgment signed + compiled)' if not v else 'FAIL'}")
    return 1 if v else 0


if __name__ == "__main__":
    sys.exit(main())
