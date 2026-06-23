#!/usr/bin/env python3
"""Build ONE canonical Postgres-oriented data model from all 30 module schemas.
Read-only: writes versa-oms/implementation/CANONICAL_DATA_MODEL.json (+ .md).
Does NOT modify any per-module schema.json. Rules:
  - shared tables: olympiad/core module owns the entity; others reference via FK
  - normalize Directus-ish types -> Postgres types
  - many-to-one:X -> uuid FK to X(id); directus_users -> staff_users (auth identity)
"""
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path("versa-oms/spec/modules")
OUT = Path("versa-oms/implementation")

COMPANY = {"company_dashboard","staff_users","roles_permissions","school_crm",
 "school_onboarding_ops","student_roster_ops","finance_ops","exam_slot_ops",
 "exam_material_ops","courier_ops","evaluation_ops","results_ops","certificate_ops",
 "notification_ops","support_tickets","task_work_queue","reports_exports",
 "admin_settings","security_audit_console"}
OLYMPIADS = {"schools","students","payments","results","certificates","courier",
 "exam_slots","exam_materials","omr_imports","notifications","audit"}

# ---- type normalization ----
SCALAR = {
 "string":"text","text":"text","uuid":"uuid","integer":"integer","int":"integer",
 "bigint":"bigint","decimal":"numeric","float":"double precision","boolean":"boolean",
 "bool":"boolean","date":"date","time":"time","datetime":"timestamptz",
 "timestamp":"timestamptz","json":"jsonb","jsonb":"jsonb","email":"citext","file":"uuid"}

FK_REMAP={"directus_users":"staff_profiles","directus_roles":"portal_roles"}
def norm_type(t):
    t=str(t).strip(); raw=t
    # FK: support both "many-to-one:X" (modules) and "many-to-one X" (core)
    if t.startswith("many-to-one"):
        target=t.split(":",1)[1].strip() if ":" in t else t.split(None,1)[1].strip()
        target=FK_REMAP.get(target,target)
        return {"pg":"uuid","fk":target,"kind":"fk"}
    if t=="enum": return {"pg":"text","kind":"enum"}
    if t=="file": return {"pg":"uuid","kind":"file","note":"storage object ref; private"}
    if t in SCALAR: return {"pg":SCALAR[t],"kind":"scalar"}
    # codex prose e.g. "string unique" -> base type + unique flag
    parts=t.split()
    base=parts[0]; uniq="unique" in parts[1:]
    out={"pg":SCALAR.get(base,"text"),"kind":"scalar"}
    if uniq: out["unique_from_type"]=True
    if base not in SCALAR: out["raw"]=raw
    return out

def track(mid):
    if mid=="core": return "core"
    return "olympiads" if mid in OLYMPIADS else "company"

# ---- read CORE schema (authoritative base; 13 entities) ----
core_raw = json.loads((Path("versa-oms/spec/core/schema.json")).read_text(encoding="utf-8"))
CORE = {}  # name -> collection (dedupe; file repeats them)
for c in core_raw.get("collections",[]):
    CORE[c.get("collection")] = c
CORE_TABLES = set(CORE)

# clean-type lookup from olympiad module schemas, to graft onto rough core fields
clean_types = defaultdict(dict)  # table -> {field: type}
for md in sorted(ROOT.iterdir()):
    if not md.is_dir() or md.name not in OLYMPIADS: continue
    p=md/"schema.json"
    if not p.exists(): continue
    for c in json.loads(p.read_text(encoding="utf-8")).get("collections",[]):
        for f in c.get("fields",[]) or []:
            clean_types[c.get("collection")][f.get("name")] = f.get("type")

# ---- gather all table declarations (modules) ----
decls = defaultdict(list)  # table_name -> [(module, collection_dict)]
for md in sorted(ROOT.iterdir()):
    if not md.is_dir(): continue
    p = md/"schema.json"
    if not p.exists(): continue
    d = json.loads(p.read_text(encoding="utf-8"))
    for c in d.get("collections",[]):
        decls[c.get("collection")].append((md.name, c))
# register core tables as a declaration with owner 'core' (highest priority)
for tname, c in CORE.items():
    decls[tname].append(("core", c))

# ---- resolve owner for each table ----
def choose(decl_list):
    # core wins; else olympiad-track; else most fields
    core = [d for d in decl_list if d[0]=="core"]
    if core: return core[0]
    oly = [d for d in decl_list if track(d[0])=="olympiads"]
    pool = oly if oly else decl_list
    pool = sorted(pool, key=lambda d: -len(d[1].get("fields",[]) or []))
    return pool[0]

tables = {}
collisions = {}
for tname, dl in decls.items():
    owner_mod, coll = choose(dl)
    if len(dl) > 1:
        collisions[tname] = {"declared_in":[m for m,_ in dl],"chosen_owner":owner_mod,
                             "field_counts":{m:len(c.get('fields',[]) or []) for m,c in dl}}
    cols = []
    is_core = owner_mod=="core"
    for f in coll.get("fields",[]) or []:
        fname=f.get("name")
        ftype=f.get("type")
        # graft clean type onto rough core fields where a clean module type exists
        grafted=None
        if is_core:
            ct=clean_types.get(tname,{}).get(fname)
            if ct and (" " in str(ftype) or str(ftype) not in SCALAR and not str(ftype).startswith("many-to-one") and ftype not in ("enum","file")):
                grafted=ct; ftype=ct
        nt = norm_type(ftype)
        is_pk = (fname == (coll.get("primary_key") or "id"))
        col = {
          "name": fname,
          "pg_type": nt["pg"],
          "nullable": (False if is_pk else not bool(f.get("required"))),
          "kind": nt["kind"],
        }
        if is_pk: col["primary_key"]=True
        if nt.get("fk"): col["fk"] = f'{nt["fk"]}(id)'
        if f.get("type")=="enum" and f.get("allowed_values"): col["enum_values"]=f["allowed_values"]
        if f.get("unique") or nt.get("unique_from_type"): col["unique"]=True
        if f.get("default") is not None: col["default"]=f["default"]
        if f.get("pattern"): col["pattern"]=f["pattern"]
        masking=[k for k in ("sensitive","private","restricted") if f.get(k)]
        if masking: col["masking"]=masking
        # carry BRD traceability (graft decision)
        if f.get("security_level"): col["security_level"]=f["security_level"]
        if f.get("source_question_id"): col["source_question_id"]=f["source_question_id"]
        if grafted: col["type_grafted_from_module"]=grafted
        if nt.get("raw"): col["source_type_raw"]=nt["raw"]
        cols.append(col)
    tables[tname] = {
      "owner_module": owner_mod,
      "track": track(owner_mod),
      "description": coll.get("description"),
      "primary_key": coll.get("primary_key","id"),
      "status_field": coll.get("status_field"),
      "unique_business_keys": coll.get("unique_business_keys"),
      "append_only": coll.get("append_only",False),
      "columns": cols,
    }

# ---- validate FK targets ----
tnames = set(tables)
dangling = defaultdict(list)
for tname, t in tables.items():
    for c in t["columns"]:
        if c.get("fk"):
            target=c["fk"].split("(")[0]
            if target not in tnames:
                dangling[target].append(f'{tname}.{c["name"]}')

common_fields = [
 {"name":"id","pg_type":"uuid","nullable":False,"note":"PK default gen_random_uuid()"},
 {"name":"created_at","pg_type":"timestamptz","nullable":False,"default":"now()"},
 {"name":"updated_at","pg_type":"timestamptz","nullable":True},
 {"name":"created_by","pg_type":"uuid","nullable":True,"fk":"staff_profiles(id)"},
 {"name":"status","pg_type":"text","nullable":True,"note":"server-controlled, per lifecycle_states"},
 {"name":"archived_at","pg_type":"timestamptz","nullable":True,"note":"no hard delete"},
 {"name":"version","pg_type":"text","nullable":True},
]

model = {
 "project":"Versa OMS",
 "generated_by":"_validation/build_canonical_model.py",
 "stack":"Next.js + Supabase (Postgres + RLS)",
 "rules":{"shared_tables":"olympiad/core owns entity; others FK to it",
          "no_hard_delete":True,"status_server_controlled":True,
          "directus_users->staff_users":True},
 "table_count":len(tables),
 "common_fields":common_fields,
 "tables":tables,
 "shared_table_resolutions":collisions,
 "dangling_fk_targets":{k:v for k,v in sorted(dangling.items())},
}
OUT.mkdir(parents=True, exist_ok=True)
(OUT/"CANONICAL_DATA_MODEL.json").write_text(json.dumps(model,indent=2),encoding="utf-8")

# ---- markdown summary ----
lines=["# Canonical Data Model (all 30 modules)\n",
 f"- Tables: **{len(tables)}**  ·  Stack: Next.js + Supabase (Postgres + RLS)",
 f"- Shared-table resolutions: {len(collisions)}  ·  Dangling FK targets: {len(dangling)}\n",
 "## Shared tables (declared in >1 module — core owner chosen)"]
for t,info in sorted(collisions.items()):
    lines.append(f"- `{t}` — owner **{info['chosen_owner']}** (declared in: {', '.join(info['declared_in'])})")
lines.append("\n## Dangling FK targets (referenced but no table defines them)")
if dangling:
    for tgt,refs in sorted(dangling.items()):
        lines.append(f"- `{tgt}` ← {len(refs)} ref(s): {', '.join(refs[:6])}{' …' if len(refs)>6 else ''}")
else:
    lines.append("- none")
lines.append("\n## Tables by module")
bymod=defaultdict(list)
for t,info in tables.items(): bymod[info["owner_module"]].append(t)
for m in sorted(bymod):
    lines.append(f"\n### {m} ({track(m)}) — {len(bymod[m])} tables")
    for t in sorted(bymod[m]): lines.append(f"- `{t}` ({len(tables[t]['columns'])} cols)")
(OUT/"CANONICAL_DATA_MODEL.md").write_text("\n".join(lines),encoding="utf-8")

print("tables:",len(tables))
print("shared-table resolutions:",len(collisions))
for t,i in sorted(collisions.items()): print(f"   {t}: owner={i['chosen_owner']} (in {i['declared_in']})")
print("dangling FK targets:",len(dangling))
for tgt,refs in sorted(dangling.items()): print(f"   {tgt}: {len(refs)} refs e.g. {refs[:3]}")
