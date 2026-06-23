#!/usr/bin/env python3
"""Validation pass: map module specs across packs, detect track conflicts,
data-quality issues, and intent-doc file coverage."""
import json, os, re, sys
from collections import defaultdict
from pathlib import Path

ROOT = Path("_staging")

# ---- 1. Locate every module spec dir (has module.json) ----
module_dirs = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    if "module.json" in filenames and os.path.basename(dirpath) not in ("templates",):
        module_dirs.append(Path(dirpath))

# group by module id (folder name), record which pack each came from
module_locations = defaultdict(list)
for d in module_dirs:
    mid = d.name
    rel = d.relative_to(ROOT)
    pack = rel.parts[0]
    module_locations[mid].append(str(rel))

# ---- 2. Classify tracks ----
COMPANY = {"company_dashboard","staff_users","roles_permissions","school_crm",
    "school_onboarding_ops","student_roster_ops","finance_ops","exam_slot_ops",
    "exam_material_ops","courier_ops","evaluation_ops","results_ops","certificate_ops",
    "notification_ops","support_tickets","task_work_queue","reports_exports",
    "admin_settings","security_audit_console"}
OLYMPIADS = {"schools","students","payments","results","certificates","courier",
    "exam_slots","exam_materials","omr_imports","notifications","audit"}

found = set(module_locations)
# overlap pairs (same concept, different name across tracks)
OVERLAP = {
    "exam_slot_ops <-> exam_slots": ("exam_slot_ops","exam_slots"),
    "exam_material_ops <-> exam_materials": ("exam_material_ops","exam_materials"),
    "courier_ops <-> courier": ("courier_ops","courier"),
    "results_ops <-> results": ("results_ops","results"),
    "certificate_ops <-> certificates": ("certificate_ops","certificates"),
    "notification_ops <-> notifications": ("notification_ops","notifications"),
    "evaluation_ops <-> omr_imports": ("evaluation_ops","omr_imports"),
    "security_audit_console <-> audit": ("security_audit_console","audit"),
    "school_crm/onboarding <-> schools": ("school_onboarding_ops","schools"),
    "student_roster_ops <-> students": ("student_roster_ops","students"),
    "finance_ops <-> payments": ("finance_ops","payments"),
}

# ---- 3. Data-quality scan on company-track schema.json (pick canonical copy) ----
def pick_canonical(mid):
    """Prefer source_of_truth pack, else individual module pack, else first."""
    locs = module_locations[mid]
    for l in locs:
        if "source_of_truth" in l: return l
    for l in locs:
        if "module_spec_pack" in l: return l
    return locs[0]

dq_issues = defaultdict(list)
def scan_schema(mid, rel):
    p = ROOT / rel / "schema.json"
    if not p.exists(): return
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:
        dq_issues[mid].append(f"schema.json unparseable: {e}")
        return
    collections = data.get("collections") or []
    for c in collections:
        cname = c.get("collection","?")
        for fld in c.get("fields",[]):
            name = fld.get("name")
            typ = str(fld.get("type",""))
            rule = str(fld.get("rule",""))
            req = fld.get("required")
            # PK not required
            if name == "id" and ("primary key" in rule.lower()) and req is False:
                dq_issues[mid].append(f"{cname}.id primary key but required=false")
            # prose / non-atomic types
            if " " in typ:
                dq_issues[mid].append(f"{cname}.{name} non-atomic type '{typ}'")
            # enum without options encoded as type
            if typ == "enum" and "," not in rule:
                dq_issues[mid].append(f"{cname}.{name} enum with no options in rule")

for mid in COMPANY:
    if mid in module_locations:
        scan_schema(mid, pick_canonical(mid))

# ---- 4. Intent-doc expected files coverage ----
INTENT_FILES = [
    "BUILD_PLAN.md","AUTOPILOT.md","IMPLEMENTATION_MANIFEST.json","BUILD_ORDER.json",
    "MASTER_DATA_MODEL.md","DATABASE_SCHEMA_REGISTRY.json","RLS_POLICY_MATRIX.json",
    "FIELD_MASKING_MATRIX.json","HIGH_RISK_ACTIONS.json","FEATURE_FLAGS.json",
    "openapi.json","ADR_INDEX.md","THREAT_MODEL_OVERVIEW.md","DESIGN_SYSTEM.md",
    "CI_CD_PIPELINE.md","JOB_REGISTRY.json","QUEUE_CONFIG.json","SECURITY_BASELINE.md",
    "PRIVACY_BASELINE.md","ROLLBACK_PLAN.md","MODULE_BUILD_TICKETS.json",
]
all_basenames = {}
for dirpath, _, filenames in os.walk(ROOT):
    if "__pycache__" in dirpath: continue
    for fn in filenames:
        all_basenames.setdefault(fn, []).append(str(Path(dirpath).relative_to(ROOT)))

intent_coverage = {}
for f in INTENT_FILES:
    locs = all_basenames.get(f, [])
    intent_coverage[f] = {"found": bool(locs), "count": len(locs), "where": locs[:3]}

# ---- 5. Module pack redundancy (how many packs ship each module) ----
redundancy = {mid: len(locs) for mid, locs in sorted(module_locations.items()) if len(locs) > 1}

out = {
    "module_ids_found": sorted(found),
    "company_track_present": sorted(found & COMPANY),
    "company_track_missing": sorted(COMPANY - found),
    "olympiads_track_present": sorted(found & OLYMPIADS),
    "olympiads_track_missing": sorted(OLYMPIADS - found),
    "overlap_pairs_both_present": {
        k: list(v) for k, v in OVERLAP.items() if v[0] in found and v[1] in found
    },
    "module_pack_redundancy": redundancy,
    "data_quality_issues": {k: v for k, v in dq_issues.items()},
    "data_quality_issue_count": sum(len(v) for v in dq_issues.values()),
    "intent_doc_file_coverage": intent_coverage,
    "intent_files_missing": [f for f, v in intent_coverage.items() if not v["found"]],
}
os.makedirs("_validation/out", exist_ok=True)
Path("_validation/out/validation.json").write_text(json.dumps(out, indent=2), encoding="utf-8")
# print summary
print("MODULES FOUND:", len(found))
print("company present:", len(out["company_track_present"]), "missing:", out["company_track_missing"])
print("olympiads present:", len(out["olympiads_track_present"]), "missing:", out["olympiads_track_missing"])
print("OVERLAP pairs both present:", len(out["overlap_pairs_both_present"]))
for k in out["overlap_pairs_both_present"]: print("   -", k)
print("DATA-QUALITY issues total:", out["data_quality_issue_count"])
print("INTENT files MISSING:", out["intent_files_missing"])
print("module redundancy (packs shipping same module):")
for mid, n in sorted(redundancy.items(), key=lambda x:-x[1])[:25]:
    print(f"   {mid}: {n} copies")
