#!/usr/bin/env python3
"""Rule-catalog gate (foundation, P0.14 / spec/rules/RULE_TAXONOMY.md). Validates every module's rules:
  - each rule conforms to rule.schema.json (required keys, valid type, module match)
  - a module that declares `validation` rules has compiled enforcement (server/rules/<module>.generated.ts)
so the declarative rule layer stays well-formed and actually compiled. Run from the repo root.
"""
import json, sys
from pathlib import Path

RULES_DIR = Path("versa-oms/spec/rules")
ENFORCE_DIR = Path("versa-oms/app/server/rules")


def main():
    schema = json.loads((RULES_DIR / "rule.schema.json").read_text(encoding="utf-8"))
    required = schema["required"]
    types = schema["properties"]["type"]["enum"]
    v = []
    for sf in sorted(RULES_DIR.glob("*.rules.json")):
        spec = json.loads(sf.read_text(encoding="utf-8"))
        mod = spec.get("_meta", {}).get("module")
        rules = spec.get("rules", [])
        if not mod:
            v.append((sf.name, "missing _meta.module"))
        for r in rules:
            rid = r.get("id", "?")
            for k in required:
                if k not in r:
                    v.append((sf.name, f"rule {rid} missing required '{k}'"))
            if r.get("type") not in types:
                v.append((sf.name, f"rule {rid} has invalid type {r.get('type')!r}"))
            if mod and r.get("module") != mod:
                v.append((sf.name, f"rule {rid} module '{r.get('module')}' != file module '{mod}'"))
            if not str(r.get("source", "")).strip():
                v.append((sf.name, f"rule {rid} has no source/provenance"))
        if mod and any(r.get("type") == "validation" and r.get("enabled", True) for r in rules):
            if not (ENFORCE_DIR / f"{mod}.generated.ts").exists():
                v.append((sf.name, f"{mod} declares validation rules but enforcement not compiled (run gen_rules.py)"))

    for f, why in v:
        print(f"RULES-FAIL  {f}  ·  {why}")
    print(f"\nRULES CATALOG: {len(v)} issue(s)  ->  {'PASS (rules well-formed + compiled)' if not v else 'FAIL'}")
    return 1 if v else 0


if __name__ == "__main__":
    sys.exit(main())
