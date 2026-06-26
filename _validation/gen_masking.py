#!/usr/bin/env python3
"""Generate config/masking.generated.json (the masking kernel's runtime config) FROM the rule catalog's
masking policy rules (unified). The catalog derives those rules from config/masking.json (the authored
policy); this regenerates the kernel's config from the catalog. Field rules are emitted IN ORDER (the kernel
matches exact-then-substring). Run after derive_rule_catalog. Run from the repo root.
"""
import json
from pathlib import Path

CAT = Path("versa-oms/reports/rule_catalog.derived.json")
OUT = Path("versa-oms/app/config/masking.generated.json")


def main():
    masking = [r for r in json.loads(CAT.read_text(encoding="utf-8"))["rules"] if r["type"] == "masking"]
    default_policy = next((r["then"]["default_policy"] for r in masking if "default_policy" in r["then"]), None)
    field_rules = sorted((r for r in masking if "field_pattern" in r["when"]), key=lambda r: r["when"]["order"])
    rules = [{"field_pattern": r["when"]["field_pattern"], "classification": r["then"]["classification"],
              "default_mask": r["then"]["default_mask"], "unmask_roles": r["then"]["unmask_roles"]} for r in field_rules]
    OUT.write_text(json.dumps({"default_policy": default_policy, "rules": rules}, indent=2) + "\n", encoding="utf-8")
    print(f"config/masking.generated.json: {len(rules)} field rules from the catalog")


if __name__ == "__main__":
    main()
