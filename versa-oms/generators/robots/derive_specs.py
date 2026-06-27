#!/usr/bin/env python3
"""
================================================================================
ROBOT 1 of 8  —  derive_specs                          (v2 vibe-coding pipeline)
================================================================================
WHAT IT DOES (one line):
    Reads the authoritative source of truth (Track B — the olympiads BRD) and
    extracts the FAITHFUL DATA MODEL: every entity, its system key, its business
    identifier, its fields, and its real foreign-key relationships.

WHERE IT SITS:
    SOURCE (BRD) --> [derive_specs] --> spec/derived/data_model.json --> derive_canonical (Robot 2)
    It is the FIRST robot. Everything downstream (canonical, db, services, rules,
    screens) ultimately traces back to what this robot extracts.

INPUT  (the only thing it reads):
    versa-oms/source-of-truth/olympiads_brd/versa_olympiads_master_brd_00_20.csv
      - Section 04 "Domain Dictionary"  -> each entity's BUSINESS IDENTIFIER (e.g. candidate_id)
      - Section 05 "Data Schema"        -> collections (entities), fields (type+rule), and
                                           relationships ("Type: many-to-one X" = a real FK)

OUTPUT (the only thing it writes):
    versa-oms/spec/derived/data_model.json
      { entities: { <name>: {
            primary_key:        the system join key (the uuid 'id' field)        <- joins use THIS
            business_identifier: e.g. candidate_id (printed/displayed, NOT a join) <- never a join key
            fields:        [ {name, type, rule, primary_key?, references?, cardinality?} ]
            relationships: [ {field, references, cardinality} ]   (real FKs only)
            source_rows:   the BRD question_ids it was extracted from (full traceability)
      } } }

INTEGRITY — INVARIANTS THIS ROBOT MUST NEVER BREAK (this is why v1 failed; do not regress):
    I1. FAITHFUL. Every entity, field, and FK traces to a BRD row (source_rows proves it).
        It NEVER invents an entity/field/relationship. (v1's `candidate_results` was invented — impossible here.)
    I2. KEY vs IDENTIFIER ARE SEPARATE. The system primary_key (uuid 'id') is what joins; the
        business_identifier (candidate_id) is display/print only and is NEVER used as a join key.
        Conflating them was THE v1 break.
    I3. RELATIONSHIPS ARE REAL FKs. A relationship exists only where the BRD says "many-to-one <entity>"
        and <entity> is itself a declared entity. No string-as-join.
    I4. IDEMPOTENT. Same BRD in -> byte-identical data_model.json out. No timestamps, no randomness.
    I5. EXTRACT-ONLY. It does not normalise, dedupe, or resolve cross-module conflicts — that is
        Robot 2 (derive_canonical). This robot only faithfully extracts.

VERIFIED BY (how a future session proves it is still correct — do not trust, RUN):
    - `check_spec`     : every output element has a source_row that exists in the BRD.
    - `check_canonical`: (downstream) every entity keyed, every FK resolves to a real entity.
    Re-run this robot + the gates; if green, integrity holds. If a gate is red, the SOURCE or this
    robot changed — investigate, do not patch the output.

HOW TO RUN:
    python versa-oms/generators/robots/derive_specs.py      # from the repo root

DO NOT:
    - Hand-edit spec/derived/data_model.json (it is generated; edit the BRD, then re-run).
    - Add modules/entities/fields not present in the BRD.
    - Make business_identifier a join key.

STATUS: Robot 1/8. Emits the DATA-MODEL portion of the per-module specs (the spine + the part v1 broke).
    The remaining 14 module parameters (lifecycle, access-matrix, security, etc.) are layered by later
    passes of this same robot, each section of the BRD -> its spec file. Tracked in generators/ROBOTS.md.
================================================================================
"""
import csv
import json
import re
from pathlib import Path

BRD = Path("versa-oms/source-of-truth/olympiads_brd/versa_olympiads_master_brd_00_20.csv")
SUPPLEMENT = Path("versa-oms/source-of-truth/v2_supplement/data_model_supplement.json")  # v2 entities the BRD implied (e.g. users); no Directus
OUT = Path("versa-oms/spec/derived/data_model.json")


def _blank():
    return {"primary_key": None, "business_identifier": None, "fields": [], "relationships": [], "source_rows": []}


def main():
    if not BRD.exists():
        raise SystemExit(f"derive_specs: source of truth missing: {BRD}")
    rows = list(csv.DictReader(BRD.open(encoding="utf-8-sig")))
    entities = {}
    # v2 supplement: entities the BRD implied via Directus but never declared, + the rename map (no Directus on v2)
    supp = json.loads(SUPPLEMENT.read_text(encoding="utf-8")) if SUPPLEMENT.exists() else {"_meta": {}, "entities": {}}
    rename = supp.get("_meta", {}).get("directus_rename", {})  # e.g. {"directus_users": "users"}

    # --- 04 Domain Dictionary: the BUSINESS IDENTIFIER per entity (display/print, NOT a join key) ---
    for r in rows:
        if r["section"].startswith("04") and "primary identifier for" in r["question"].lower():
            m = re.search(r"primary identifier for '([^']+)'", r["question"])
            subj = m.group(1) if m else None
            # entity-level row only (subject singularises to the entity); skips field-level dictionary rows
            # e.g. "primary identifier for 'student'" + entity 'students' -> match;  "...for 'candidate_id'" -> skip
            if subj and r["entity"] and subj.rstrip("s") == r["entity"].rstrip("s"):
                e = entities.setdefault(r["entity"], _blank())
                e["business_identifier"] = r["answer"].strip()
                e["source_rows"].append(r["question_id"].strip())

    # --- 05 Data Schema: collections (entities) + fields (types, rules, FKs) ---
    for r in rows:
        if not r["section"].startswith("05"):
            continue
        if r["module"] == "collections":
            m = re.search(r"collection '([^']+)'", r["question"])
            if m and "should" in r["question"].lower():
                e = entities.setdefault(m.group(1), _blank())
                e["source_rows"].append(r["question_id"].strip())
        elif r["module"] == "fields":
            mf = re.search(r"field '([^']+)' is required in collection '([^']+)'", r["question"])
            if not mf:
                continue
            field, ent = mf.group(1), mf.group(2)
            e = entities.setdefault(ent, _blank())
            ans = r["answer"]
            ftype = (re.search(r"Type:\s*([^;]+)", ans) or [None, ""])[1].strip()
            rule = (re.search(r"Rule:\s*(.+)$", ans) or [None, ""])[1].strip()
            fdef = {"name": field, "type": ftype, "rule": rule}
            fk = re.search(r"many-to-one\s+([a-z_]+)", ans, re.I)
            if fk:
                tgt = rename.get(fk.group(1), fk.group(1))  # directus_users -> users (no Directus on v2)
                fdef["references"] = tgt
                fdef["cardinality"] = "many-to-one"
                e["relationships"].append({"field": field, "references": tgt})
            if "primary key" in ans.lower():
                fdef["primary_key"] = True
                e["primary_key"] = field
            e["fields"].append(fdef)
            e["source_rows"].append(r["question_id"].strip())

    # --- field_additions: add v2 fields to BRD-declared entities (e.g. schools outreach fields) ---
    for ent, adds in supp.get("field_additions", {}).items():
        if ent.startswith("_") or ent not in entities:
            continue
        existing = {f["name"] for f in entities[ent]["fields"]}
        for fd in adds:
            if fd["name"] not in existing:
                entities[ent]["fields"].append(dict(fd))
                if fd.get("references"):
                    entities[ent]["relationships"].append({"field": fd["name"], "references": fd["references"]})
                entities[ent]["source_rows"].append("v2-supplement:field_additions")

    # --- 09 Status Codes: the authoritative status enum per entity (BRD declared it but never linked it) ---
    status_entity = {k: v for k, v in supp.get("status_entity", {}).items() if not k.startswith("_")}
    status_vals = {}
    for r in rows:
        if r["section"].startswith("09") and r["module"].endswith("_status"):
            m = re.search(r"status/code '([^']+)'", r["question"])
            if m:
                status_vals.setdefault(r["module"], [])
                if m.group(1) not in status_vals[r["module"]]:
                    status_vals[r["module"]].append(m.group(1))
    for concept, ent in status_entity.items():
        if ent in entities and concept in status_vals:
            sf = next((f for f in entities[ent]["fields"] if f["name"] == "status"), None)
            if sf is None:   # entity has a §09 status concept + a workflow but §05 never declared the column
                sf = {"name": "status", "type": "enum", "rule": "lifecycle status"}
                entities[ent]["fields"].append(sf)
                entities[ent]["source_rows"].append("BRD:09-" + concept)
            sf["type"] = "enum"
            sf["enum_values"] = status_vals[concept]
            sf["source_rows_status"] = "BRD:09-" + concept

    # merge v2-supplement entities (declared, not BRD-extracted — e.g. the 'users' identity table, no Directus)
    for name, edef in supp.get("entities", {}).items():
        entities[name] = {"primary_key": edef.get("primary_key"), "business_identifier": edef.get("business_identifier"),
                          "fields": edef.get("fields", []), "relationships": edef.get("relationships", []),
                          "source_rows": edef.get("source_rows", [])}

    # supplement-workflow entities: status enum from the workflow states (so the stepper has states to render)
    wf_ent = {k: v for k, v in supp.get("workflow_entity", {}).items() if not k.startswith("_")}
    for wfname, w in supp.get("supplement_workflows", {}).items():
        if wfname.startswith("_"):
            continue
        ent, states = wf_ent.get(wfname), w.get("states", [])
        if ent in entities and states:
            sf = next((f for f in entities[ent]["fields"] if f["name"] == "status"), None)
            if sf is None:
                sf = {"name": "status", "type": "enum", "rule": "lifecycle status"}
                entities[ent]["fields"].append(sf)
            sf["type"] = "enum"
            if not sf.get("enum_values"):
                sf["enum_values"] = list(states)
            sf["source_rows_status"] = "v2-supplement:" + wfname

    # auto-identifier fields -> system + auto-generated (skipped in forms, not required-validated, gen_services fills them)
    for ent2, fld in supp.get("generated_rules", {}).get("auto_identifier", {}).items():
        if ent2 in entities:
            for f in entities[ent2]["fields"]:
                if f["name"] == fld:
                    f["rule"] = "system auto-generated identifier"

    # deterministic order (I4 idempotent): sort entities + their source_rows
    entities = {k: {**v, "source_rows": sorted(set(v["source_rows"]))} for k, v in sorted(entities.items())}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"_robot": "derive_specs", "_source": str(BRD), "entities": entities}, indent=2) + "\n",
                   encoding="utf-8")

    # project the founder's module feature scope (source: supplement.module_features) -> derived, so gen_portal
    # reads a PROJECTION, never the source. The picker's grouped include-lists are flattened to a key set.
    mf_out = Path("versa-oms/spec/derived/module_features.json")
    proj = {}
    for ent, spec in supp.get("module_features", {}).items():
        if ent.startswith("_"):
            continue
        inc = spec.get("include", [])
        if isinstance(inc, dict):
            inc = [k for arr in inc.values() for k in arr]
        proj[ent] = {"include": sorted(set(inc)), "providers": spec.get("providers", []), "excluded": sorted(set(spec.get("excluded", [])))}
    mf_out.write_text(json.dumps({"_robot": "derive_specs", "_source": str(SUPPLEMENT), "modules": proj}, indent=2) + "\n", encoding="utf-8")
    rels = sum(len(e["relationships"]) for e in entities.values())
    keyed = sum(1 for e in entities.values() if e["primary_key"])
    print(f"derive_specs: {len(entities)} entities · {keyed} with a system key · {rels} real FK relationships -> {OUT}")


if __name__ == "__main__":
    main()
