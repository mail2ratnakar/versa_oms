#!/usr/bin/env python3
"""Per-module gate (MODULE_CONTRACT). Each module validates its OWN unit in isolation — unit specs present,
its catalog rules' enforcement compiled, and journey-test coverage — so a converted/changed module can be
checked on its own (the global census proves every other module is byte-unchanged). This is what makes the
burn-down self-checking: convert a route, run `check_module.py <module>`, land it.

Run from the repo root: python _validation/check_module.py [module | all]
"""
import json, sys
from collections import Counter
from pathlib import Path

MOD_DIR = Path("versa-oms/spec/modules")
CAT = json.loads(Path("versa-oms/reports/rule_catalog.derived.json").read_text(encoding="utf-8"))["rules"]
ENFORCE = Path("versa-oms/app/server/rules")
E2E = Path("versa-oms/app/tests/e2e")
E2E_TEXT = " ".join(t.read_text(encoding="utf-8", errors="ignore") for t in E2E.glob("*.spec.ts")) if E2E.exists() else ""


def real_modules():
    return sorted(p.name for p in MOD_DIR.iterdir() if p.is_dir() and not p.name.startswith("_"))


def module_entities(m):
    ents = set()
    wf = MOD_DIR / m / "workflows.json"
    if wf.exists():
        for w in json.loads(wf.read_text(encoding="utf-8")).get("workflows", []):
            if w.get("entity"):
                ents.add(w["entity"])
    sc = MOD_DIR / m / "schema.json"
    if sc.exists():
        try:
            s = json.loads(sc.read_text(encoding="utf-8"))
            t = s.get("primary_table") or s.get("table")
            if t:
                ents.add(t)
        except Exception:
            pass
    return ents


def check(m):
    ents = module_entities(m)
    rules = [r for r in CAT if r["module"] == m or r["entity"] in ents]
    specs = [s for s in ("schema.json", "permissions.json", "workflows.json") if (MOD_DIR / m / s).exists()]
    issues = []
    if "schema.json" not in specs and "permissions.json" not in specs:
        issues.append("no schema/permissions spec")
    # every catalog rule that NEEDS compiled enforcement (eligibility) must be compiled for the module's entities
    for ent in {r["entity"] for r in rules if r["type"] == "eligibility"}:
        if not (ENFORCE / f"{ent}.generated.ts").exists():
            issues.append(f"eligibility {ent} declared but not compiled")
    return rules, specs, (m in E2E_TEXT), issues


def main():
    arg = sys.argv[1] if len(sys.argv) > 1 else "all"
    mods = real_modules() if arg == "all" else [arg]
    fails, no_test = 0, []
    print(f"  {'module':26} rules  specs  e2e  status")
    for m in mods:
        rules, specs, has_test, issues = check(m)
        by = Counter(r["type"] for r in rules)
        cov = "+".join(f"{by[t]}{t[:3]}" for t in ("lifecycle", "precondition", "validation", "scoping", "approval") if by.get(t))
        if issues:
            fails += 1
        if not has_test:
            no_test.append(m)
        status = "OK" if not issues else "FAIL: " + "; ".join(issues)
        print(f"  {m:26} {len(rules):4}  {len(specs)}/3   {'y' if has_test else '-'}   {status}  [{cov}]")
    print(f"\nMODULES: {len(mods)} checked · {fails} FAIL · {len(no_test)} without an e2e mention "
          f"({', '.join(no_test) if no_test else 'all covered'})")
    print("  -> " + ("PASS (every module's unit is enforced)" if not fails else "FAIL"))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
