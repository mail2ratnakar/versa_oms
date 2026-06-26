#!/usr/bin/env python3
"""
================================================================================
ROBOT 3 of 8  —  derive_catalog                        (v2 vibe-coding pipeline)
================================================================================
WHAT IT DOES (one line):
    Extracts the RULE CATALOG from the BRD — the declarative list of every rule
    the system enforces — each rule traced to the exact BRD row it came from.

WHERE IT SITS:
    BRD + canonical --> [derive_catalog] --> spec/derived/rule_catalog.json --> gen_rules (Robot 7 compiles it)
    The catalog is the SINGLE SOURCE OF TRUTH for rules: inspectable, gated
    (check_catalog), and traced — BEFORE it is ever turned into code.

INPUT:
    versa-oms/source-of-truth/olympiads_brd/versa_olympiads_master_brd_00_20.csv
      - Section 07 "Workflows"        -> LIFECYCLE: states + transitions ("action:from->to")
      - Section 10 "Validation Rules" -> VALIDATION: named field/record rules per entity
    versa-oms/spec/derived/canonical.json  (to confirm a rule's entity is a real entity)

OUTPUT:
    versa-oms/spec/derived/rule_catalog.json
      { rules: {
          lifecycle:  [ {id, workflow, action, from, to, source} ],
          validation: [ {id, entity, name, rule, source} ] },
        workflows: { <wf>: {states[], start, success, failure} },
        summary: {...} }

INTEGRITY — INVARIANTS:
    I1. EXTRACT-ONLY from the BRD. No invented rules. (No "business logic in the LLM's head".)
    I2. TRACEABLE. Every rule has a `source` = the BRD question_id it came from.
    I3. REAL TARGETS. A validation rule's entity must be a declared canonical entity; a lifecycle
        transition's from/to must be among that workflow's declared states.
    I4. IDEMPOTENT. Same BRD -> byte-identical catalog. Rule ids are unique + deterministic.
    I5. DECLARATIVE-ONLY. It does NOT compile rules into code — that is gen_rules (Robot 7). This
        robot only produces the inspectable catalog.

VERIFIED BY: check_catalog (every rule well-formed + traces to a real source; ids unique).
HOW TO RUN:  python versa-oms/generators/robots/derive_catalog.py
DO NOT: hand-edit rule_catalog.json; add a rule with no BRD source; put a rule's logic only in code.
STATUS: Robot 3/8. Extracts LIFECYCLE + VALIDATION today (the two clearly-sourced types). The other rule
    types (scope, effect, masking, approval, eligibility, precondition) layer in from their BRD sections
    (03, 06, 16, 17, ...) — tracked in generators/ROBOTS.md.
================================================================================
"""
import csv
import json
import re
from pathlib import Path

BRD = Path("versa-oms/source-of-truth/olympiads_brd/versa_olympiads_master_brd_00_20.csv")
CANON = Path("versa-oms/spec/derived/canonical.json")
OUT = Path("versa-oms/spec/derived/rule_catalog.json")


def main():
    rows = list(csv.DictReader(BRD.open(encoding="utf-8-sig")))
    entities = set(json.loads(CANON.read_text(encoding="utf-8"))["entities"]) if CANON.exists() else set()
    supp = json.loads(Path("versa-oms/source-of-truth/v2_supplement/data_model_supplement.json").read_text(encoding="utf-8"))
    wf_entity = {k: v for k, v in supp.get("workflow_entity", {}).items() if not k.startswith("_")}
    stateless = set(supp.get("workflow_entity", {}).get("_stateless_actions", []))  # public actions, not entity lifecycles

    workflows = {}   # wf -> {states, start, success, failure}
    lifecycle = []   # transitions
    validation = []
    masking = []     # field-level classification: sensitive/restricted/private -> must be masked

    for r in rows:
        sec, q, ans, qid = r["section"], r["question"], r["answer"], r["question_id"].strip()
        wf = r["workflow"].strip()
        # --- 07 Workflows: states + transitions ---
        if sec.startswith("07"):
            mwf = re.search(r"workflow '([^']+)'", q)
            wfname = wf or (mwf.group(1) if mwf else "")
            if not wfname:
                continue
            w = workflows.setdefault(wfname, {"states": [], "start": None, "success": None, "failure": None})
            ql = q.lower()
            if "statuses exist" in ql:
                w["states"] = [s.strip() for s in re.split(r"[,/]", ans) if s.strip()]
            elif "what starts" in ql:
                w["start"] = ans.strip()
            elif "success status" in ql:
                w["success"] = ans.strip()
            elif "failure" in ql or "exception status" in ql:
                w["failure"] = ans.strip()
            elif "transition is allowed" in ql:
                m = re.match(r"\s*([a-z0-9_]+)\s*:\s*([a-z0-9_]+)\s*->\s*([a-z0-9_]+)", ans, re.I)
                if m and wfname not in stateless:   # stateless actions (e.g. cert verify) are not entity lifecycles
                    lifecycle.append({"id": f"lifecycle.{wfname}.{m.group(1)}", "workflow": wfname,
                                      "action": m.group(1), "from": m.group(2), "to": m.group(3),
                                      "entity": wf_entity.get(wfname), "source": qid})
        # --- 10 Validation Rules ---
        elif sec.startswith("10"):
            mv = re.search(r"validation rule '([^']+)'", q)
            if mv and r["entity"].strip():
                validation.append({"id": f"validation.{r['entity'].strip()}.{mv.group(1)}",
                                   "entity": r["entity"].strip(), "name": mv.group(1),
                                   "rule": ans.strip(), "source": qid})
        # --- 05 Data Schema: field classification -> masking dimension ---
        elif sec.startswith("05") and r["module"] == "fields" and r["security_level"].strip() in ("sensitive", "restricted", "private"):
            mf = re.search(r"field '([^']+)' is required in collection '([^']+)'", q)
            if mf:
                masking.append({"id": f"masking.{mf.group(2)}.{mf.group(1)}", "entity": mf.group(2),
                                "field": mf.group(1), "classification": r["security_level"].strip(), "source": qid})

    # I3: a transition's from/to must be among its workflow's declared states (report violations, don't drop)
    bad_transitions = [t for t in lifecycle if workflows.get(t["workflow"], {}).get("states")
                       and (t["from"] not in workflows[t["workflow"]]["states"]
                            or t["to"] not in workflows[t["workflow"]]["states"])]
    bad_validation = [v for v in validation if entities and v["entity"] not in entities]

    lifecycle.sort(key=lambda x: x["id"])
    validation.sort(key=lambda x: x["id"])
    masking.sort(key=lambda x: x["id"])
    for k in workflows:
        workflows[k]["entity"] = wf_entity.get(k)   # declared governed entity (source fact, not a guess)
    bad_workflow_entity = [k for k in workflows if not wf_entity.get(k) or (entities and wf_entity.get(k) not in entities)]
    OUT.write_text(json.dumps({
        "_robot": "derive_catalog", "_source": str(BRD),
        "rules": {"lifecycle": lifecycle, "validation": validation, "masking": masking},
        "workflows": {k: workflows[k] for k in sorted(workflows)},
        "integrity": {"transitions_with_undeclared_state": bad_transitions,
                      "validation_on_unknown_entity": bad_validation,
                      "workflows_without_real_entity": bad_workflow_entity},
        "summary": {"workflows": len(workflows), "lifecycle_transitions": len(lifecycle),
                    "validation_rules": len(validation), "masking_rules": len(masking)},
    }, indent=2) + "\n", encoding="utf-8")
    print(f"derive_catalog: {len(workflows)} workflows · {len(lifecycle)} transitions · {len(validation)} validation "
          f"· {len(masking)} masking · bad_transitions={len(bad_transitions)} -> {OUT}")


if __name__ == "__main__":
    main()
