#!/usr/bin/env python3
"""Generate Postgres DDL from CANONICAL_DATA_MODEL.json.
Emits versa-oms/app/supabase/migrations/0001_schema.sql
Order: extensions -> CREATE TABLE (all) -> ADD FK constraints -> composite uniques -> indexes.
"""
import json, re
from pathlib import Path

MODEL = json.loads(Path("versa-oms/implementation/CANONICAL_DATA_MODEL.json").read_text(encoding="utf-8"))
OUT = Path("versa-oms/app/supabase/migrations/0001_schema.sql")
OUT.parent.mkdir(parents=True, exist_ok=True)

tables = MODEL["tables"]
COMMON = {c["name"]: c for c in MODEL["common_fields"]}

def ident(s): return '"' + str(s).replace('"','""') + '"'
def lit(v):
    if isinstance(v, bool): return "true" if v else "false"
    if isinstance(v,(int,float)): return str(v)
    return "'" + str(v).replace("'","''") + "'"

def col_sql(c, pk_name):
    parts = [ident(c["name"]), c["pg_type"]]
    is_pk = c.get("primary_key") or c["name"]==pk_name
    if is_pk:
        parts.append("PRIMARY KEY")
        if c["pg_type"]=="uuid": parts.append("DEFAULT gen_random_uuid()")
    else:
        if not c.get("nullable", True): parts.append("NOT NULL")
        if c.get("unique"): parts.append("UNIQUE")
        # default
        if c.get("name")=="created_at": parts.append("DEFAULT now()")
        elif c.get("default") is not None: parts.append("DEFAULT " + lit(c["default"]))
    # enum CHECK
    if c.get("enum_values"):
        vals = ", ".join(lit(v) for v in c["enum_values"])
        parts.append(f'CHECK ({ident(c["name"])} IN ({vals}))')
    return " ".join(parts)

def merged_columns(t):
    """table columns + ensure common fields present (table's own wins)."""
    have = {c["name"]: dict(c) for c in t["columns"]}
    pk = t.get("primary_key") or "id"
    for name, cf in COMMON.items():
        if name not in have:
            col = {"name":name, "pg_type":cf["pg_type"], "nullable":cf.get("nullable",True)}
            if cf.get("fk"): col["fk"]=cf["fk"]
            if name==pk: col["primary_key"]=True
            have[name]=col
    # ensure an id pk exists
    if pk not in have:
        have[pk]={"name":pk,"pg_type":"uuid","nullable":False,"primary_key":True}
    return list(have.values()), pk

lines = ["-- Versa OMS schema — generated from CANONICAL_DATA_MODEL.json",
         "-- Stack: Supabase (Postgres + RLS). No hard delete (archived_at).",
         'create extension if not exists "pgcrypto";',
         'create extension if not exists "citext";', ""]

fks = []        # (table, col, target)
uniques = []    # (table, [cols])
indexes = []    # (table, col)

for tname, t in tables.items():
    cols, pk = merged_columns(t)
    coldefs = [ "  " + col_sql(c, pk) for c in cols ]
    lines.append(f"create table if not exists {ident(tname)} (")
    lines.append(",\n".join(coldefs))
    lines.append(");")
    lines.append("")
    for c in cols:
        if c.get("fk"):
            target = c["fk"].split("(")[0]
            fks.append((tname, c["name"], target))
            indexes.append((tname, c["name"]))
    # composite unique business keys (only if all cols exist)
    colnames = {c["name"] for c in cols}
    ubk = t.get("unique_business_keys")
    if isinstance(ubk, list):
        for key in ubk:
            keycols = key if isinstance(key, list) else [key]
            if all(k in colnames for k in keycols) and keycols:
                uniques.append((tname, keycols))
    if "status" in colnames: indexes.append((tname,"status"))
    if "archived_at" in colnames: indexes.append((tname,"archived_at"))

lines.append("-- ---- foreign keys ----")
for i,(tname,col,target) in enumerate(fks):
    if target not in tables:  # safety; should be 0
        lines.append(f"-- SKIP fk {tname}.{col} -> {target} (target missing)"); continue
    cname = f"fk_{tname}_{col}"[:63]
    lines.append(f"alter table {ident(tname)} add constraint {ident(cname)} "
                 f"foreign key ({ident(col)}) references {ident(target)} (\"id\");")
lines.append("")

lines.append("-- ---- composite unique business keys ----")
seen=set()
for tname,keycols in uniques:
    cn=f"uq_{tname}_{'_'.join(keycols)}"[:63]
    if cn in seen: continue
    seen.add(cn)
    cols=", ".join(ident(k) for k in keycols)
    lines.append(f"alter table {ident(tname)} add constraint {ident(cn)} unique ({cols});")
lines.append("")

lines.append("-- ---- indexes ----")
seen=set()
for tname,col in indexes:
    iname=f"ix_{tname}_{col}"[:63]
    if iname in seen: continue
    seen.add(iname)
    lines.append(f"create index if not exists {ident(iname)} on {ident(tname)} ({ident(col)});")

OUT.write_text("\n".join(lines)+"\n", encoding="utf-8")
print(f"wrote {OUT}")
print(f"tables: {len(tables)}  fks: {len(fks)}  composite_uniques: {len(seen) if uniques else 0}  index_lines: {len(set(i for i in indexes))}")
print(f"sql size: {OUT.stat().st_size} bytes, lines: {len(lines)}")
