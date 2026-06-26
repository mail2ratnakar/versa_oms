#!/usr/bin/env python3
"""Derive the CENTRAL candidate rule catalog from the existing sources (canonical model, workflows, effect
chains, masking) — the central rule repository, for FOUNDER REVIEW before freezing. READ-ONLY.

Writes reports/rule_catalog.derived.json (machine) + reports/RULE_CATALOG.md (review). This catalog is the
source that DRIVES gen_rules: the compiler is extended to compile exactly the rule types the frozen catalog
contains. Order: derive (this) -> founder freezes -> extend compiler -> burn down. Run from the repo root.
"""
import json, re
from pathlib import Path
from collections import defaultdict, Counter

CANON = json.loads(Path("versa-oms/implementation/CANONICAL_DATA_MODEL.json").read_text(encoding="utf-8"))["tables"]
CHAINS = json.loads(Path("versa-oms/spec/effects/chains.json").read_text(encoding="utf-8"))["chains"]
WF_FILES = sorted(Path("versa-oms/spec/modules").glob("*/workflows.json"))

# columns the server sets (never user-validated input)
SERVER_SET = re.compile(r"^id$|_code$|_hash$|^prev_hash|^event_hash|_by$|_at$|^status$|_status$|idempotency|"
                        r"_snapshot$|_payload$|^normalized_|_id_hash$|content_hash|value_hash|version_hash|^fingerprint")


def server_set(c):
    return bool(c.get("primary_key") or (c.get("pattern") and c["name"].endswith("_code")) or SERVER_SET.search(c["name"]))


def cols(table):
    return CANON.get(table, {}).get("columns", [])


rules = []


def add(module, action, rtype, rid, when, then, source, entity=None, id_key=None, severity="error"):
    # id_key prefixes the id. Validation/masking/scoping are ENTITY-scoped (a fact about the table); workflow
    # rules (lifecycle/precondition/approval) are MODULE-scoped, because two modules can define the same
    # transition on a shared entity and each must be a distinct, traceable rule (the two-spec-track case).
    ent = entity or module
    rules.append({"id": f"{id_key or ent}.{action}.{rid}", "module": module, "entity": ent, "action": action,
                  "type": rtype, "when": when, "then": then, "source": source, "severity": severity})


def derive_validation(module, table):
    for c in cols(table):
        n = c["name"]
        if server_set(c):
            continue
        if c.get("nullable") is False and "default" not in c:
            add(module, "create", "validation", f"{n}_required", {"field": n, "condition": "required_nonempty"},
                {"error": {"field": n, "code": "VALIDATION_FAILED", "message": f"A {n.replace('_', ' ')} is required."}},
                f"canonical:{table}.{n} (NOT NULL)", entity=table)
        if c.get("kind") == "enum":
            add(module, "create", "validation", f"{n}_enum", {"field": n, "condition": "enum", "params": {"values": c.get("enum_values", [])}},
                {"error": {"field": n, "code": "VALIDATION_FAILED", "message": f"Invalid {n.replace('_', ' ')}."}},
                f"canonical:{table}.{n} (enum {c.get('enum_values')})", entity=table)
        if c.get("pattern") and not n.endswith("_code"):
            add(module, "create", "validation", f"{n}_format", {"field": n, "condition": "pattern", "params": {"pattern": c["pattern"]}},
                {"error": {"field": n, "code": "VALIDATION_FAILED", "message": f"Invalid {n.replace('_', ' ')} format."}},
                f"canonical:{table}.{n} (pattern)", entity=table)


def derive_masking(module, table):
    for c in cols(table):
        if c.get("masking"):
            add(module, "read", "masking", f"{c['name']}_masked", {"field": c["name"]}, {"mask": c["masking"]},
                f"canonical:{table}.{c['name']} (masking {c['masking']})", entity=table)


def derive_scoping(module, table):
    if any(c["name"] == "school_id" for c in cols(table)):
        add(module, "*", "scoping", "school_isolation", {"actor": "school", "dimension": "school_id"},
            {"filter": "row.school_id == actor.school_id"}, f"canonical:{table}.school_id + permissions.school_isolation", entity=table)


def derive_workflow(module, wf):
    ent = wf.get("entity")
    wid = f"{module}.{wf.get('workflow_id') or module}"  # module.workflow = the precise, unique anchor (two-spec-track: the same workflow_id can exist in two modules)
    for t in wf.get("transitions", []):
        tr = t["transition"]
        add(module, tr, "lifecycle", f"{tr}_transition", {"from": t.get("from", []), "action": tr},
            {"to": t.get("to")}, f"workflow:{module}.{wid}", entity=ent, id_key=wid)
        for g in t.get("guards", []):
            add(module, tr, "precondition", f"{tr}_guard_{g}", {"action": tr, "guard": g}, {"block_if_not": g},
                f"workflow:{module}.{wid}.guards", entity=ent, id_key=wid)
        blob = (t.get("actor", "") + " " + " ".join(t.get("guards", []))).lower()
        if t.get("dual_approval") or any(k in blob for k in ("approv", "dual", "checker")):
            add(module, tr, "approval", f"{tr}_dual_approval", {"action": tr},
                {"require": "2 distinct approvers, no self-approve"}, f"workflow:{module}.{wid} (approval)", entity=ent, id_key=wid)


def derive_effects(module):
    for ch in CHAINS:
        if ch.get("trigger", {}).get("module") == module:
            # carry the FULL chain so gen_effects can compile transitionEffects.ts FROM the catalog (unified)
            add(module, ch["trigger"].get("action", "*"), "effect", ch["id"].lower().replace("-", "_"),
                {"trigger": ch["trigger"]}, {"chain_name": ch.get("name"), "chain": ch}, f"effects:{ch['id']}", entity=ch.get("source_table"))


for wff in WF_FILES:
    wf = json.loads(wff.read_text(encoding="utf-8"))
    module = wf["module_id"]
    tables = set()
    for w in wf.get("workflows", []):
        derive_workflow(module, w)
        if w.get("entity"):
            tables.add(w["entity"])
    for table in sorted(tables):  # sorted -> deterministic output (a set iterates in nondeterministic order)
        derive_validation(module, table)
        derive_masking(module, table)
        derive_scoping(module, table)
    derive_effects(module)

# Dedupe identical rules (the same entity is referenced by multiple modules' workflows -> the same rule is
# derived more than once). Every rule id must be UNIQUE so an issue can be traced to exactly one rule.
_seen, _deduped = set(), []
for _r in rules:
    _sig = (_r["id"], _r["type"], json.dumps(_r["when"], sort_keys=True), json.dumps(_r["then"], sort_keys=True))
    if _sig in _seen:
        continue
    _seen.add(_sig)
    _deduped.append(_r)
rules[:] = _deduped

Path("versa-oms/reports/rule_catalog.derived.json").write_text(
    json.dumps({"_meta": {"derived": True, "review": "freeze into spec/rules/<module>.rules.json after founder review", "count": len(rules)}, "rules": rules}, indent=1) + "\n", encoding="utf-8")

TYPES = ["validation", "scoping", "precondition", "lifecycle", "approval", "effect", "masking", "eligibility"]
by_mod = defaultdict(lambda: defaultdict(list))
for r in rules:
    by_mod[r["module"]][r["type"]].append(r)

L = ["# Rule Catalog — DERIVED candidate rules (FOR FOUNDER REVIEW before freezing)", "",
     f"Read-only derivation from canonical + workflows + effect chains + masking. **{len(rules)} candidate rules "
     f"across {len(by_mod)} modules.** Review/adjust, then freeze into `spec/rules/<module>.rules.json`; the "
     f"compiler (`gen_rules.py`) is then extended to compile exactly these types.", "",
     "> NOTE: `eligibility` is 0 — it is genuine business judgment not encoded in any existing source, so it "
     "must be **authored by hand** with you. `approval` is heuristic (guards mentioning approve/dual) — confirm. "
     "`validation` required-fields come from NOT-NULL columns; confirm which are truly user-input vs server-set.", "",
     "## Summary — rules per module × type", "",
     "| module | " + " | ".join(TYPES) + " | total |", "|" + "---|" * (len(TYPES) + 2)]
for mod in sorted(by_mod):
    counts = [str(len(by_mod[mod].get(t, []))) for t in TYPES]
    L.append(f"| {mod} | " + " | ".join(counts) + f" | {sum(len(v) for v in by_mod[mod].values())} |")
L.append(f"| **TOTAL** | " + " | ".join(str(sum(len(by_mod[m].get(t, [])) for m in by_mod)) for t in TYPES) + f" | **{len(rules)}** |")
for mod in sorted(by_mod):
    L.append(f"\n## {mod}")
    for t in TYPES:
        rs = by_mod[mod].get(t, [])
        if not rs:
            continue
        L.append(f"\n### {t} ({len(rs)})")
        for r in rs:
            L.append(f"- `{r['id']}` — when `{json.dumps(r['when'])}` then `{json.dumps(r['then'])}`  _source: {r['source']}_")
Path("versa-oms/reports/RULE_CATALOG.md").write_text("\n".join(L) + "\n", encoding="utf-8")
print(f"derived {len(rules)} candidate rules across {len(by_mod)} modules -> reports/RULE_CATALOG.md + rule_catalog.derived.json")
print("by type:", dict(Counter(r["type"] for r in rules)))
