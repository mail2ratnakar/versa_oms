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
HRA = json.loads(Path("versa-oms/implementation/HIGH_RISK_ACTIONS.json").read_text(encoding="utf-8"))
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


def derive_masking_policy():
    """Field-masking POLICY from config/masking.json (authored) -> masking rules, in order (the kernel matches
    exact-then-substring, so order matters). gen_masking compiles config/masking.generated.json from these +
    the default_policy rule. This is the masking ENFORCEMENT (not the canonical sensitivity classification)."""
    cfg = json.loads(Path("versa-oms/app/config/masking.json").read_text(encoding="utf-8"))
    add("masking", "config", "masking", "default_policy", {}, {"default_policy": cfg["default_policy"]},
        "config:masking.json (authored policy)", entity="masking")
    for i, r in enumerate(cfg["rules"]):
        add("masking", "read", "masking", f"{r['field_pattern']}_policy",
            {"field_pattern": r["field_pattern"], "order": i},
            {"classification": r["classification"], "default_mask": r["default_mask"], "unmask_roles": r["unmask_roles"]},
            "config:masking.json (authored policy)", entity=r["field_pattern"])


def _ref_table(c):  # the table an FK column points at (canonical fk: "schools(id)" -> "schools")
    fk = c.get("fk", "")
    return fk.split("(")[0] if fk else None


def derive_scope_map():
    """The LEAK-CRITICAL school-scope strategy per FK-target table -> one scoping rule each, carrying the
    full strategy. direct (school_id) | path (ownership FK chain to a school-scoped table) | junction
    (hand-verified) | none. This is the single source for schoolScope.generated.ts (gen_school_scope reads it)."""
    JUNCTION = {"exam_slots": ("school_exam_slot_assignments", "exam_slot_id")}
    # FK columns we will NOT follow when discovering an ownership chain (incidental / staff / audit edges).
    INCIDENTAL = ("actor", "_by", "staff", "reviewer", "assigned", "approver", "owner", "created", "updated", "resolved")
    school_tables = {t for t in CANON if any(c["name"] == "school_id" for c in cols(t))}

    def own_edges(t):
        out = []
        for c in cols(t):
            r = _ref_table(c)
            if r and r in CANON and not any(k in c["name"] for k in INCIDENTAL):
                out.append((c["name"], r))
        return out

    def chain_to_school(t, max_hops=3):
        from collections import deque
        q, seen = deque([(t, [])]), {t}
        while q:
            cur, hops = q.popleft()
            if len(hops) >= max_hops:
                continue
            for col, par in own_edges(cur):
                nh = hops + [{"via": col, "parent": par}]
                if par in school_tables:
                    return nh
                if par not in seen:
                    seen.add(par); q.append((par, nh))
        return None

    targets = set()
    for t in CANON:
        for c in cols(t):
            r = _ref_table(c)
            if r and r in CANON:
                targets.add(r)
    for tbl in sorted(targets):
        if any(c["name"] == "school_id" for c in cols(tbl)):
            strat, src = {"kind": "direct"}, f"canonical:{tbl}.school_id"
        else:
            hops = chain_to_school(tbl)
            if hops:
                strat, src = {"kind": "path", "hops": hops}, f"canonical:{tbl}.{hops[0]['via']} (ownership chain to school)"
            elif tbl in JUNCTION and JUNCTION[tbl][0] in school_tables:
                j = JUNCTION[tbl]
                strat, src = {"kind": "junction", "junction": j[0], "fk": j[1]}, f"canonical:{j[0]}.{j[1]} (hand-verified junction)"
            else:
                strat, src = {"kind": "none"}, f"canonical:{tbl}.id (no school_id / no ownership chain — not school-scopable)"
        add(tbl, "scope", "scoping", "school_scope", {"actor": "school"}, {"strategy": strat}, src, entity=tbl)


def derive_workflow(module, wf):
    ent = wf.get("entity")
    wid = f"{module}.{wf.get('workflow_id') or module}"  # module.workflow = the precise, unique anchor (two-spec-track: the same workflow_id can exist in two modules)
    # The legal states of this workflow's state machine (so the lifecycle compiles fully from the catalog).
    add(module, "states", "lifecycle", "legal_states", {}, {"statuses": wf.get("statuses", [])},
        f"workflow:{wid}", entity=ent, id_key=wid)
    for t in wf.get("transitions", []):
        tr = t["transition"]
        add(module, tr, "lifecycle", f"{tr}_transition", {"from": t.get("from", []), "action": tr},
            {"to": t.get("to")}, f"workflow:{wid}", entity=ent, id_key=wid)
        for g in t.get("guards", []):
            add(module, tr, "precondition", f"{tr}_guard_{g}", {"action": tr, "guard": g}, {"block_if_not": g},
                f"workflow:{wid}.guards", entity=ent, id_key=wid)
    # approval rules are derived from HIGH_RISK_ACTIONS.json (the real signal), not a workflow-text heuristic —
    # see derive_approvals(), called once globally.


def derive_approvals():
    """Dual-approval (maker-checker) per module, from HIGH_RISK_ACTIONS.json (requires_dual_approval) — the
    ACTUAL enforcement signal that gen_modules compiles into each dual module's approve action. One rule per
    dual module (gen_modules' DUAL_MODULES is module-level)."""
    for mod in sorted({a["module"] for a in HRA.get("actions", []) if a.get("requires_dual_approval")}):
        add(mod, "approve", "approval", "dual_approval", {"action_class": "approve"},
            {"require": "2 distinct approvers, no self-approve (maker-checker)"},
            "HRA:requires_dual_approval", entity=mod, id_key=mod)


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
    derive_effects(module)

derive_scope_map()  # global (per FK-target table, not per module) — the leak-critical school-scope strategy
derive_approvals()  # global — dual-approval (maker-checker) modules from HIGH_RISK_ACTIONS.json
derive_masking_policy()  # global — field-masking policy from config/masking.json (the kernel's enforcement)

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
