#!/usr/bin/env python3
"""Generate 0003_rls.sql: enable Row Level Security on every table.
Posture: deny-by-default. No policies are granted to anon/authenticated roles, so
direct PostgREST access returns nothing; ALL data access flows through server
routes that authorize the actor (guards) and then use the service-role client
(which bypasses RLS by design). Fine-grained authenticated/school policies can be
layered later when client-side direct reads are introduced."""
import json
from pathlib import Path

MODEL = json.loads(Path("versa-oms/implementation/CANONICAL_DATA_MODEL.json").read_text(encoding="utf-8"))["tables"]
OUT = Path("versa-oms/app/supabase/migrations/0003_rls.sql")

tables = sorted(MODEL.keys()) + ["idempotency_keys"]
lines = [
 "-- Versa OMS RLS: enable row level security on all tables (deny-by-default).",
 "-- Server routes authorize the actor then use the service-role client (bypasses RLS).",
 "-- No anon/authenticated policies are granted here on purpose.",
 "",
]
for t in tables:
    lines.append(f'alter table "{t}" enable row level security;')
    lines.append(f'alter table "{t}" force row level security;')
OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"wrote {OUT}  ({len(tables)} tables, RLS enabled + forced)")
