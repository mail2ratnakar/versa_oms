#!/usr/bin/env python3
"""End-to-end traceability audit:
questions/BRD -> specs -> canonical model -> DDL -> generators -> built services/routes/UI.
Reports a coverage matrix + any gaps. Read-only."""
import json, re
from pathlib import Path

ROOT = Path("versa-oms")
APP = ROOT/"app"
SPEC = ROOT/"spec/modules"
MODEL = json.loads((ROOT/"implementation/CANONICAL_DATA_MODEL.json").read_text(encoding="utf-8"))["tables"]
DDL = (APP/"supabase/migrations/0001_schema.sql").read_text(encoding="utf-8")
DDL_TABLES = set(re.findall(r'create table if not exists "([^"]+)"', DDL))

ROUTE = {
 "company_dashboard":"staff/dashboard","staff_users":"staff/admin/users","roles_permissions":"staff/admin/roles",
 "school_crm":"staff/schools/crm","school_onboarding_ops":"staff/schools/onboarding","student_roster_ops":"staff/students/rosters",
 "finance_ops":"staff/finance","exam_slot_ops":"staff/exams/slots","exam_material_ops":"staff/exams/materials",
 "courier_ops":"staff/courier","evaluation_ops":"staff/evaluation","results_ops":"staff/results",
 "certificate_ops":"staff/certificates","notification_ops":"staff/notifications","support_tickets":"staff/support",
 "task_work_queue":"staff/tasks","reports_exports":"staff/reports","admin_settings":"staff/admin/settings",
 "security_audit_console":"staff/security-audit",
}
# school module -> (table, api/page route, underlying spec module that defines the entity)
SCHOOL = {
 "school_students":("students","school/students","students"),
 "school_payments":("payments","school/payments","payments"),
 "school_results":("candidate_results","school/results","results"),
 "school_certificates":("certificates","school/certificates","certificates"),
 "school_materials":("exam_material_packages","school/materials","exam_materials"),
 "school_slots":("school_exam_slot_assignments","school/exam-slots","exam_slots"),
}

# staff CRUD over olympiad-core entities: core_mid -> (table, route, underlying spec module)
CORE = {
 "core_schools":("schools","staff/core/schools","schools"),
 "core_students":("students","staff/core/students","students"),
 "core_participations":("participations","staff/core/participations","schools"),
 "core_payments":("payments","staff/core/payments","payments"),
 "core_exam_slots":("exam_slots","staff/core/exam-slots","exam_slots"),
 "core_exam_materials":("exam_materials","staff/core/exam-materials","exam_materials"),
 "core_courier":("courier_batches","staff/core/courier-batches","courier"),
 "core_omr":("omr_imports","staff/core/omr","omr_imports"),
 "core_results":("results","staff/core/results","results"),
 "core_certificates":("certificates","staff/core/certificates","certificates"),
}

def primary_table(mid):
    sc=json.loads((SPEC/mid/"schema.json").read_text(encoding="utf-8"))
    cs=sc.get("collections",[]); return cs[0].get("collection") if cs else None

def has_transitions(mid, table):
    p=SPEC/mid/"lifecycle_states.json"
    if not p.exists(): return False
    lc=json.loads(p.read_text(encoding="utf-8"))
    STAT={"approved","published","released","confirmed","locked","revoked","rejected","withheld","reissued",
          "approved_for_results","paid","reversed","refunded","cancelled","archived","suspended","blocked",
          "scheduled","dispatched","delivered","received","validated","generated","submitted","submitted_for_lock","closed","in_transit"}
    ents={e.get("entity"):e for e in lc.get("entities",[])}
    for c in (table, table[:-1] if table.endswith("s") else table):
        if c in ents:
            return bool(set(ents[c].get("statuses",[])) & STAT)
    vals=list(ents.values())
    return bool(set(vals[0].get("statuses",[]) if vals else []) & STAT)

def exists(p): return (APP/p).exists()

rows=[]; gaps=[]
def check(mid, kind, table, api_route, page_route, needs_action, spec_module=None):
    sm = spec_module or mid
    spec_ok = (SPEC/sm).is_dir() and (SPEC/sm/"schema.json").exists() and (SPEC/sm/"permissions.json").exists()
    in_model = table in MODEL
    in_ddl = table in DDL_TABLES
    svc = exists(f"server/modules/{mid}/service.ts")
    svc_txt = (APP/f"server/modules/{mid}/service.ts").read_text(encoding="utf-8") if svc else ""
    policy = ('policy:' in svc_txt) or ('"policy"' in svc_txt) or ('policy: {' in svc_txt)
    table_wired = f'table: "{table}"' in svc_txt
    coll = exists(f"app/api/{api_route}/route.ts")
    item = exists(f"app/api/{api_route}/[id]/route.ts") if kind=="staff" else True
    action = exists(f"app/api/{api_route}/[id]/actions/[action]/route.ts")
    action_ok = (action == needs_action) if kind=="staff" else True
    page = exists(f"app/{page_route}/page.tsx")
    ok = all([spec_ok,in_model,in_ddl,svc,policy,table_wired,coll,item,page,action_ok])
    row={"module":mid,"kind":kind,"table":table,"spec":spec_ok,"model":in_model,"ddl":in_ddl,
         "service":svc,"policy":policy,"table_wired":table_wired,"coll_route":coll,"item_route":item,
         "action_route":action,"needs_action":needs_action,"page":page,"OK":ok}
    rows.append(row)
    if not ok:
        miss=[k for k in ("spec","model","ddl","service","policy","table_wired","coll_route","item_route","page") if not row[k]]
        if not action_ok: miss.append(f"action_route(expected={needs_action},got={action})")
        gaps.append((mid, miss))

for mid, api_route in ROUTE.items():
    table = primary_table(mid)
    page_route = "staff/dashboard" if mid=="company_dashboard" else api_route
    check(mid, "staff", table, api_route, page_route, has_transitions(mid, table))

for mid,(table,api_route,spec_module) in SCHOOL.items():
    check(mid, "school", table, api_route, api_route, False, spec_module=spec_module)

for mid,(table,api_route,spec_module) in CORE.items():
    check(mid, "staff", table, api_route, api_route, has_transitions(spec_module, table), spec_module=spec_module)

# ---- model + DDL global coverage ----
model_tables = set(MODEL)
ddl_missing = sorted(model_tables - DDL_TABLES)
fk_targets = set()
for t in MODEL.values():
    for c in t["columns"]:
        if c.get("fk"): fk_targets.add(c["fk"].split("(")[0])
dangling = sorted(fk_targets - model_tables)

# ---- questions/BRD traceability ----
brd = ROOT/"source-of-truth"
brd_files = [p.name for p in brd.rglob("*") if p.is_file()] if brd.exists() else []
traced_cols = sum(1 for t in MODEL.values() for c in t["columns"] if c.get("source_question_id"))

# ---- generators present ----
gens = {g: (Path("_validation")/g).exists() for g in
        ["build_canonical_model.py","generate_ddl.py","gen_modules.py","gen_school.py","gen_ui.py","gen_rls.py","gen_core.py","gen_jobs.py"]}

# ---- worker-job framework present ----
jobs_framework = {f: (APP/f).exists() for f in
        ["server/jobs/runner.ts","server/jobs/handlers.ts","server/jobs/triggers.ts",
         "server/jobs/types.ts","server/jobs/registry.generated.ts"]}

summary = {
 "modules_checked": len(rows),
 "modules_ok": sum(1 for r in rows if r["OK"]),
 "modules_with_gaps": len(gaps),
 "canonical_tables": len(model_tables),
 "ddl_tables": len(DDL_TABLES),
 "model_tables_missing_from_ddl": ddl_missing,
 "dangling_fk_targets": dangling,
 "brd_source_files": len(brd_files),
 "columns_traced_to_questions": traced_cols,
 "generators_present": gens,
 "jobs_framework_present": jobs_framework,
 "job_types_registered": (APP/"server/jobs/registry.generated.ts").read_text(encoding="utf-8").count('"jobType":') if (APP/"server/jobs/registry.generated.ts").exists() else 0,
}
out={"summary":summary,"gaps":[{"module":m,"missing":g} for m,g in gaps],"matrix":rows}
(ROOT/"reports/TRACEABILITY_AUDIT.json").write_text(json.dumps(out,indent=2),encoding="utf-8")

print("== TRACEABILITY AUDIT ==")
for k,v in summary.items():
    if isinstance(v,(list,dict)) and not v: v="(none)" if isinstance(v,list) else v
    print(f"  {k}: {v}")
print("\nGAPS:")
if gaps:
    for m,g in gaps: print(f"  {m}: missing {g}")
else:
    print("  none — every module traces spec->model->ddl->service->route->ui")
print("\nRESULT:", "PASS" if not gaps and not ddl_missing and not dangling else "REVIEW")
