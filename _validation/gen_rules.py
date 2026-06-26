#!/usr/bin/env python3
"""Rule-catalog COMPILER (gen_rules). Compiles per-entity enforcement from the DERIVED catalog
(reports/rule_catalog.derived.json) — NOT from hand-authored code. Two kinds today:
  - validation: derived from canonical MINUS a founder-signed judgment (spec/rules/judgment/*.judgment.json
    server_set). Emits validate<Entity>_<action>(body) -> FieldError[].
  - eligibility: founder-AUTHORED (spec/rules/eligibility/*.eligibility.json, no source can derive it),
    carried into the catalog. Emits isEligible<Entity>_<action>(row) -> { eligible, reason }.
Both write app/server/rules/<entity>.generated.ts. So the rule layer is DERIVED + a small founder-signed
JUDGMENT, never hand-typed (DERIVE-DON'T-AUTHOR, P0.14). Run from the repo root.
"""
import json, sys
from pathlib import Path

CATALOG = Path("versa-oms/reports/rule_catalog.derived.json")
JUDGMENT_DIR = Path("versa-oms/spec/rules/judgment")
OUT = Path("versa-oms/app/server/rules")


def pascal(s):
    return "".join(p.capitalize() for p in s.split("_"))


def violated_expr(field, condition, params):
    f = json.dumps(field)
    if condition == "required_nonempty":
        return f'!String(body[{f}] ?? "").trim()'
    if condition == "enum":
        return f'body[{f}] !== undefined && body[{f}] !== null && !{json.dumps(params.get("values", []))}.includes(String(body[{f}]))'
    raise SystemExit(f"gen_rules: unsupported validation condition {condition!r}")


def cond_expr(c):  # an eligibility condition -> a TS boolean that is TRUE when satisfied
    f = json.dumps(c["field"])
    op, v = c["op"], c.get("value")
    if op == "equals":
        return f'String(row[{f}] ?? "") === {json.dumps(str(v))}'
    if op == "not_equals":
        return f'String(row[{f}] ?? "") !== {json.dumps(str(v))}'
    if op == "is_true":
        return f'(row[{f}] === true || String(row[{f}]) === "true")'
    if op == "not_empty":
        return f'String(row[{f}] ?? "").trim() !== ""'
    if op == "in":
        return f'{json.dumps([str(x) for x in (v or [])])}.includes(String(row[{f}] ?? ""))'
    if op == "gte":
        return f'Number(row[{f}] ?? 0) >= {json.dumps(v)}'
    if op == "gt":
        return f'Number(row[{f}] ?? 0) > {json.dumps(v)}'
    raise SystemExit(f"gen_rules: unsupported eligibility op {op!r}")


def validator_fn(entity, action, rules):
    L = [f"export function validate{pascal(entity)}_{action}(body: Record<string, unknown>): FieldError[] {{",
         "  const errors: FieldError[] = [];"]
    for r in rules:
        w, err = r["when"], r["then"]["error"]
        L.append(f"  if ({violated_expr(w['field'], w['condition'], w.get('params', {}))}) "
                 f"errors.push({{ field: {json.dumps(err['field'])}, message: {json.dumps(err['message'])} }}); // {r['id']}")
    L += ["  return errors;", "}"]
    return "\n".join(L)


def eligibility_fn(entity, action, rule):
    conds = " && ".join(cond_expr(c) for c in rule["when"].get("all", []))
    reason = json.dumps(rule["then"].get("else_reason", "Not eligible."))
    return "\n".join([
        f"export function isEligible{pascal(entity)}_{action}(row: Record<string, unknown>): EligibilityResult {{  // {rule['id']}",
        f"  if (!({conds})) return {{ eligible: false, reason: {reason} }};",
        "  return { eligible: true };",
        "}"])


def main():
    if not CATALOG.exists():
        raise SystemExit("gen_rules: run derive_rule_catalog.py first (no derived catalog)")
    OUT.mkdir(parents=True, exist_ok=True)
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))["rules"]
    by_ea = {}
    for r in catalog:
        if r["type"] == "validation":
            by_ea.setdefault((r["entity"], r["action"]), []).append(r)

    files = {}  # entity -> {"needs_field_error", "needs_eligibility", "fns": [...]}

    # validation (from the catalog, minus the founder-signed server_set judgment)
    for jf in sorted(JUDGMENT_DIR.glob("*.judgment.json")):
        j = json.loads(jf.read_text(encoding="utf-8"))
        for entity, actions in j.get("server_set", {}).items():
            for action, conf in actions.items():
                excluded = set(conf.get("fields", []))
                seen, emitted = set(), []
                for r in by_ea.get((entity, action), []):
                    key = (r["when"]["field"], r["when"]["condition"])
                    if r["when"]["field"] in excluded or key in seen:
                        continue
                    seen.add(key); emitted.append(r)
                if emitted:
                    f = files.setdefault(entity, {"field_error": False, "eligibility": False, "fns": []})
                    f["field_error"] = True
                    f["fns"].append(validator_fn(entity, action, emitted))

    # eligibility (founder-authored, carried into the catalog)
    for r in catalog:
        if r["type"] == "eligibility":
            f = files.setdefault(r["entity"], {"field_error": False, "eligibility": False, "fns": []})
            f["eligibility"] = True
            f["fns"].append(eligibility_fn(r["entity"], r["action"], r))

    for entity, f in files.items():
        head = ["// GENERATED by gen_rules.py from the rule catalog — DO NOT EDIT. Edit canonical/judgment/eligibility + regenerate."]
        if f["field_error"]:
            head.append("export type FieldError = { field: string; message: string };")
        if f["eligibility"]:
            head.append("export type EligibilityResult = { eligible: boolean; reason?: string };")
        head.append("")
        (OUT / f"{entity}.generated.ts").write_text("\n".join(head + f["fns"]) + "\n", encoding="utf-8")
    print(f"rules compiled: {len(files)} entity enforcement file(s)")


if __name__ == "__main__":
    main()
