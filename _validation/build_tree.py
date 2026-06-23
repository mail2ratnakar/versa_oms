#!/usr/bin/env python3
"""Build a single clean working tree from the 46 extracted packs.
Non-destructive: reads _staging, writes versa-oms/. Picks one canonical source
per module, drops redundant manifests/reports, records provenance."""
import json, os, shutil, sys
from pathlib import Path

STAGING = Path("_staging")
OUT = Path("versa-oms")
PROJ = Path(".")  # for loose top-level source files

EXCLUDE_NAMES = {"PACKAGE_MANIFEST.csv", "PACKAGE_MANIFEST.json", "PACK_SUMMARY.json"}
EXCLUDE_DIRS = {"__pycache__", "reports"}
EXCLUDE_SUFFIX = {".pyc"}

provenance = []

def copytree_clean(src: Path, dst: Path, drop_reports=True, tag=""):
    for dp, dirs, files in os.walk(src):
        dirs[:] = [d for d in dirs if d not in (EXCLUDE_DIRS if drop_reports else {"__pycache__"})]
        rel = Path(dp).relative_to(src)
        for fn in files:
            if fn in EXCLUDE_NAMES or Path(fn).suffix in EXCLUDE_SUFFIX:
                continue
            target = dst / rel / fn
            target.parent.mkdir(parents=True, exist_ok=True)
            # avoid README collisions when merging two packs into one folder
            if target.exists() and fn.upper().startswith("README"):
                target = target.with_name(f"{tag}__{fn}")
            shutil.copy2(Path(dp) / fn, target)
            provenance.append({"to": str(target.relative_to(OUT)), "from": str((Path(dp)/fn).relative_to(STAGING))})

def copy_pack(pack, dest, tag=None):
    copytree_clean(STAGING / pack, OUT / dest, tag=tag or pack.split("_")[1] if "_" in pack else pack)

if OUT.exists():
    shutil.rmtree(OUT)

# ---- whole-pack -> section folder ----
PACK_MAP = {
    "versa_production_build_control_pack": "build",
    "versa_actual_business_feature_implementation_pack": "build",
    "versa_production_implementation_starter_pack": "implementation",
    "versa_api_contract_bundle": "api-contract",
    "versa_full_individual_adr_pack": "adrs",
    "versa_threat_model_pack": "threat-models",
    "versa_design_system_implementation_pack": "design-system",
    "versa_seed_mock_data_pack": "seed",
    "versa_worker_queue_implementation_pack": "workers",
    "versa_observability_implementation_pack": "observability",
    "versa_deployment_cicd_implementation_pack": "deployment",
    "versa_spec_playbook_generator_v1": "generators/spec_playbook",
    "versa_executable_build_scripts_pack": "generators/build_scripts",
}
for pack, dest in PACK_MAP.items():
    copy_pack(pack, dest, tag=pack.replace("versa_","").replace("_pack",""))

# ---- the Next.js skeleton app ----
copytree_clean(STAGING/"versa_repo_scaffold_working_app_skeleton_pack/versa-olympiads-app", OUT/"app", tag="app")
# business-feature repo overlay kept separate to avoid clobbering the skeleton
bo = STAGING/"versa_actual_business_feature_implementation_pack/repo_overlay"
if bo.exists():
    copytree_clean(bo, OUT/"overlays/business_feature", tag="overlay")

# ---- olympiads core/security/tests/runbooks/changes (only in codex full pack) ----
codex_spec = STAGING/"versa_olympiads_codex_claude_full_spec_pack/generated_spec_pack/spec"
for sub in ["core","security","tests","runbooks","changes"]:
    if (codex_spec/sub).exists():
        copytree_clean(codex_spec/sub, OUT/"spec"/sub, tag="codex")

# ---- 30 module specs: pick canonical source ----
COMPANY = ["company_dashboard","staff_users","roles_permissions","school_crm",
    "school_onboarding_ops","student_roster_ops","finance_ops","exam_slot_ops",
    "exam_material_ops","courier_ops","evaluation_ops","results_ops","certificate_ops",
    "notification_ops","support_tickets","task_work_queue","reports_exports",
    "admin_settings","security_audit_console"]
OLYMPIADS = ["schools","students","payments","results","certificates","courier",
    "exam_slots","exam_materials","omr_imports","notifications","audit"]

def find_module_src(mid, prefer):
    """Return list of module dirs containing module.json for this id."""
    hits=[]
    for dp,_,fns in os.walk(STAGING):
        if "module.json" in fns and Path(dp).name==mid and "templates" not in dp:
            hits.append(Path(dp))
    hits.sort(key=lambda h: (prefer not in str(h)))  # prefer match first
    return hits

mod_report={}
for mid in COMPANY:
    srcs=find_module_src(mid, "company_portal")
    if not srcs: mod_report[mid]="MISSING"; continue
    primary=srcs[0]
    copytree_clean(primary, OUT/"spec/modules"/mid, tag="company")
    mod_report[mid]={"track":"company","primary":str(primary.relative_to(STAGING)),"alts":[str(s.relative_to(STAGING)) for s in srcs[1:]]}

for mid in OLYMPIADS:
    srcs=find_module_src(mid, "module_spec_pack")  # prefer individual pack (richest)
    if not srcs: mod_report[mid]="MISSING"; continue
    primary=srcs[0]
    copytree_clean(primary, OUT/"spec/modules"/mid, tag="olympiads")
    # union: pull files present in other sources (e.g. codex documents.json/notifications.json) without overwrite
    existing=set(p.name for p in (OUT/"spec/modules"/mid).iterdir())
    pulled=[]
    for alt in srcs[1:]:
        for f in alt.iterdir():
            if f.is_file() and f.name not in existing:
                shutil.copy2(f, OUT/"spec/modules"/mid/f.name); existing.add(f.name); pulled.append(f.name)
                provenance.append({"to": f"spec/modules/{mid}/{f.name}","from":str(f.relative_to(STAGING)),"note":"union-pull"})
    mod_report[mid]={"track":"olympiads","primary":str(primary.relative_to(STAGING)),"alts":[str(s.relative_to(STAGING)) for s in srcs[1:]],"union_pulled":pulled}

# ---- source-of-truth (questionnaires, BRD, master CSVs) ----
copytree_clean(STAGING/"versa_company_portal_source_of_truth_pack", OUT/"source-of-truth/company_portal", tag="cp_sot")
sa=STAGING/"versa_olympiads_codex_claude_full_spec_pack/source_artifacts"
if sa.exists(): copytree_clean(sa, OUT/"source-of-truth/olympiads_brd", tag="brd")
# loose top-level project files
for f in PROJ.iterdir():
    if f.is_file() and f.suffix.lower() in {".csv",".md",".json"} and "manifest" not in f.name.lower() and f.name!="README(1).md":
        if any(k in f.name.lower() for k in ["brd","questionnaire","registry","artifact_generation","master","source_of_truth"]):
            (OUT/"source-of-truth/loose").mkdir(parents=True,exist_ok=True)
            shutil.copy2(f, OUT/"source-of-truth/loose"/f.name)

# ---- provenance + module report ----
(OUT/"reports").mkdir(parents=True, exist_ok=True)
(OUT/"reports/PROVENANCE.json").write_text(json.dumps(provenance,indent=1),encoding="utf-8")
(OUT/"reports/MODULE_SOURCES.json").write_text(json.dumps(mod_report,indent=1),encoding="utf-8")

# ---- summary ----
total=sum(1 for _ in OUT.rglob("*") if _.is_file())
top={p.name:sum(1 for _ in p.rglob('*') if _.is_file()) for p in sorted(OUT.iterdir()) if p.is_dir()}
print("CLEAN TREE built at", OUT)
print("total files:", total)
print("provenance entries:", len(provenance))
for k,v in top.items(): print(f"  {k}/: {v} files")
miss=[m for m,v in mod_report.items() if v=="MISSING"]
print("modules built:", sum(1 for v in mod_report.values() if v!="MISSING"), "missing:", miss)
