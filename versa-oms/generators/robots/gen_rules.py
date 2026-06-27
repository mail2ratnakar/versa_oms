#!/usr/bin/env python3
"""
================================================================================
ROBOT 7 of 8  —  gen_rules                             (v2 vibe-coding pipeline)
================================================================================
WHAT IT DOES (one line):
    Compiles the rule catalog + canonical into the validate<E>(input) functions
    that the services (Robot 5) already call — the rule CATALOG becomes executable
    enforcement, one source, no business logic re-typed by hand.

WHERE IT SITS:
    canonical + rule_catalog --> [gen_rules] --> spec/derived/rules/<entity>.rules.ts
                                                 ^ this is exactly what gen_services imports
INPUT:   versa-oms/spec/derived/canonical.json     (required fields, enum_values)
         versa-oms/spec/derived/rule_catalog.json  (validation rules + workflow states for status)
OUTPUT:  versa-oms/spec/derived/rules/<entity>.rules.ts   (export function validate<E>(): FieldError[])

WHAT IT COMPILES (machine-enforceable, faithful):
    - REQUIRED fields  -> presence/non-empty check        (from canonical field rule "required")
    - ENUM fields      -> value must be in enum_values     (from canonical, e.g. users.role)
    - STATUS field     -> value must be a declared workflow state (from the catalog)
    The richer named catalog rules (duplicate-check, format, cross-record) that need the DB or judgment
    are listed as references in the file header — they compile in later passes / as authored rules, never
    silently dropped.

INTEGRITY — INVARIANTS:
    I1. DERIVED-ONLY + TRACEABLE. Every check comes from canonical or the catalog; sources noted.
    I2. MATCHES SERVICES. A validate<E> exists for every entity (gen_services imports it) -> tsc resolves.
    I3. PURE. Validators are pure functions of the input. Cross-record checks (uniqueness) are NOT here —
        they need the db and are a different rule type; do not fake them as pure checks.
    I4. IDEMPOTENT.

VERIFIED BY: check_catalog (every catalog rule is compiled or referenced) + tsc + check_journey.
HOW TO RUN:  python versa-oms/generators/robots/gen_rules.py
DO NOT: hand-edit; add a check with no source; pretend a DB-dependent rule is a pure validator.
STATUS: Robot 7/8. Compiles required + enum + status validation. Format/uniqueness/cross-record layer later.
================================================================================
"""
import json
import re
from pathlib import Path

CANON = Path("versa-oms/spec/derived/canonical.json")
CATALOG = Path("versa-oms/spec/derived/rule_catalog.json")
OUTDIR = Path("versa-oms/spec/derived/rules")


def pascal(s):
    return "".join(p.capitalize() for p in s.split("_"))


def entity_for_workflow(wf, entities):
    wfl = wf.lower()
    for e in sorted(entities, key=len, reverse=True):
        if e.rstrip("s") in wfl:
            return e
    return None


def main():
    entities = json.loads(CANON.read_text(encoding="utf-8"))["entities"]
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    # entity -> its workflow states (handoff states are valid too), keyed by the DECLARED entity
    ent_states = {}
    for wf, w in catalog["workflows"].items():
        e = w.get("entity")
        if e and w.get("states"):
            ent_states.setdefault(e, set()).update(w["states"])
    # entity -> named catalog validation rules (for the header reference)
    ent_named = {}
    for v in catalog["rules"]["validation"]:
        ent_named.setdefault(v["entity"], []).append(v)

    OUTDIR.mkdir(parents=True, exist_ok=True)
    for name in sorted(entities):
        e = entities[name]
        P = pascal(name)
        checks = []
        for f in e["fields"]:
            fn = f["name"]
            if fn in ("id", "created_at", "updated_at"):
                continue
            rule = (f.get("rule") or "").lower()
            if "required" in rule:
                checks.append(f'  if (!String(input.{fn} ?? "").trim()) errors.push({{ field: "{fn}", message: "{fn} is required" }});')
            if fn == "status":
                # status must be a real §09 status code (enum) OR a workflow handoff state
                allowed = sorted(set(f.get("enum_values") or []) | ent_states.get(name, set()))
                if allowed:
                    vals = ", ".join(f'"{v}"' for v in allowed)
                    checks.append(f'  if (input.status !== undefined && ![{vals}].includes(String(input.status))) errors.push({{ field: "status", message: "status is not a valid status code" }});')
            elif f["type"] == "enum" and f.get("enum_values"):
                vals = ", ".join(f'"{v}"' for v in f["enum_values"])
                checks.append(f'  if (input.{fn} !== undefined && ![{vals}].includes(String(input.{fn}))) errors.push({{ field: "{fn}", message: "{fn} is not a valid value" }});')
        named = ent_named.get(name, [])
        refs = "".join(f'//   - {v["name"]}: {v["rule"][:78]} (src {v["source"]})\n' for v in named)
        ts = [f'// GENERATED by gen_rules (Robot 7) from canonical + rule_catalog — DO NOT EDIT.']
        if refs:
            ts.append(f'// Named BRD validation rules for {name} (richer rules — DB/format/cross-record — layer in later):')
            ts.append(refs.rstrip("\n"))
        ts += ['export type FieldError = { field: string; message: string };', '',
               f'export function validate{P}(input: Record<string, unknown>): FieldError[] {{',
               '  const errors: FieldError[] = [];',
               *checks,
               '  return errors;', '}', '']
        (OUTDIR / f"{name}.rules.ts").write_text("\n".join(ts), encoding="utf-8")

    total_checks = "compiled per entity"
    print(f"gen_rules: {len(entities)} validators (validate<E>) compiled -> {OUTDIR}/ "
          f"({sum(1 for n in entities if n in ent_states)} with status-state enforcement)")


if __name__ == "__main__":
    main()
