#!/usr/bin/env python3
"""Static validation of the generated DDL: real Postgres grammar parse +
duplicate table/constraint/index name checks (things that would fail on apply)."""
import re
from collections import Counter
from pathlib import Path
import pglast

sql = Path("versa-oms/app/supabase/migrations/0001_schema.sql").read_text(encoding="utf-8")

# 1) grammar
try:
    stmts = pglast.parse_sql(sql)
    print(f"[ok] real-Postgres-grammar parse: {len(stmts)} statements")
except Exception as e:
    print("[FAIL] parse:", e); raise SystemExit(1)

# 2) duplicate identifiers
tables = re.findall(r'create table if not exists "([^"]+)"', sql)
constraints = re.findall(r'add constraint "([^"]+)"', sql)
indexes = re.findall(r'create index if not exists "([^"]+)"', sql)

def dups(name, items):
    d = {k:v for k,v in Counter(items).items() if v>1}
    print(f"[{'FAIL' if d else 'ok'}] {name}: {len(items)} total, {len(d)} duplicated" + (f" -> {list(d)[:5]}" if d else ""))
    return d

bad = False
bad |= bool(dups("tables", tables))
bad |= bool(dups("constraints", constraints))
bad |= bool(dups("indexes", indexes))

# 3) identifier length (pg truncates >63 -> collision risk)
toolong = [n for n in constraints+indexes if len(n)>63]
print(f"[{'WARN' if toolong else 'ok'}] identifiers >63 chars: {len(toolong)}")

print("RESULT:", "FAIL" if bad else "PASS")
raise SystemExit(1 if bad else 0)
