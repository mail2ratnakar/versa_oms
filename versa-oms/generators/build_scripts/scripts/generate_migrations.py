#!/usr/bin/env python3
"""
generate_migrations.py

Purpose
-------
Generate safe, additive PostgreSQL migration drafts from DATABASE_SCHEMA_REGISTRY.json
and module schema.json files.

This creates draft SQL only. Human review is required before applying to staging/prod.

Usage
-----
python scripts/generate_migrations.py --root . --module staff_users
python scripts/generate_migrations.py --root . --all
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

def snake(name: str) -> str:
    name = re.sub(r"[^a-zA-Z0-9_]+", "_", name)
    name = re.sub(r"_+", "_", name).strip("_").lower()
    if not name:
        raise ValueError("empty identifier")
    return name

def load_json(path: Path, default: Any = None) -> Any:
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)

def map_type(field: Dict[str, Any]) -> str:
    raw = str(field.get("type", "text")).lower()
    if raw in ["uuid", "many-to-one:directus_users"] or raw.startswith("many-to-one"):
        return "uuid"
    if raw in ["string", "enum", "text"]:
        return "text"
    if raw in ["integer", "int"]:
        return "integer"
    if raw in ["boolean", "bool"]:
        return "boolean"
    if raw in ["datetime", "timestamp"]:
        return "timestamptz"
    if raw == "date":
        return "date"
    if raw in ["json", "jsonb"]:
        return "jsonb"
    if raw == "file":
        return "uuid"
    return "text"

def column_sql(field: Dict[str, Any]) -> str:
    name = snake(field.get("name", "unnamed"))
    typ = map_type(field)
    parts = [f'  "{name}" {typ}']
    if field.get("required") and name != "id":
        parts.append("NOT NULL")
    if "default" in field:
        default = field["default"]
        if isinstance(default, bool):
            parts.append(f"DEFAULT {'true' if default else 'false'}")
        elif isinstance(default, int):
            parts.append(f"DEFAULT {default}")
        elif isinstance(default, str):
            parts.append("DEFAULT " + "'" + default.replace("'", "''") + "'")
    return " ".join(parts)

def table_sql(collection: Dict[str, Any]) -> str:
    table = snake(collection.get("collection", "unnamed_collection"))
    fields = collection.get("fields", []) or []
    field_names = {snake(f.get("name", "")) for f in fields if f.get("name")}
    columns = []
    if "id" not in field_names:
        columns.append('  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid()')
    for field in fields:
        if snake(field.get("name", "")) == "id":
            columns.append('  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid()')
        else:
            columns.append(column_sql(field))
    if "created_at" not in field_names:
        columns.append('  "created_at" timestamptz NOT NULL DEFAULT now()')
    if "updated_at" not in field_names and not collection.get("append_only"):
        columns.append('  "updated_at" timestamptz NOT NULL DEFAULT now()')
    if "archived_at" not in field_names and not collection.get("append_only"):
        columns.append('  "archived_at" timestamptz')
    body = ",\n".join(columns)
    sql = [f'CREATE TABLE IF NOT EXISTS "{table}" (', body, ");", ""]
    sql.append(f'CREATE INDEX IF NOT EXISTS "idx_{table}_created_at" ON "{table}" ("created_at");')
    if "status" in field_names:
        sql.append(f'CREATE INDEX IF NOT EXISTS "idx_{table}_status" ON "{table}" ("status");')
    elif collection.get("status_field"):
        sf = snake(collection["status_field"])
        sql.append(f'CREATE INDEX IF NOT EXISTS "idx_{table}_{sf}" ON "{table}" ("{sf}");')
    return "\n".join(sql)

def schema_collections(root: Path, module_id: str) -> List[Dict[str, Any]]:
    schema = load_json(root / "spec" / "modules" / module_id / "schema.json", {}) or {}
    cols = schema.get("collections", []) if isinstance(schema, dict) else []
    return [c for c in cols if isinstance(c, dict)]

def discover_modules(root: Path) -> List[str]:
    spec_root = root / "spec" / "modules"
    if spec_root.exists():
        return [p.name for p in sorted(spec_root.iterdir()) if p.is_dir()]
    registry = load_json(root / "DATABASE_SCHEMA_REGISTRY.json", {}) or load_json(root / "build" / "DATABASE_SCHEMA_REGISTRY.json", {}) or {}
    return [m.get("module_id") for m in registry.get("modules", []) if m.get("module_id")]

def generate(root: Path, module_id: str, out_dir: Path) -> Path:
    collections = schema_collections(root, module_id)
    if not collections:
        registry = load_json(root / "DATABASE_SCHEMA_REGISTRY.json", {}) or load_json(root / "build" / "DATABASE_SCHEMA_REGISTRY.json", {}) or {}
        for mod in registry.get("modules", []):
            if mod.get("module_id") == module_id:
                collections = [{"collection": c["collection"], "fields": []} for c in mod.get("collections", []) if isinstance(c, dict)]
    order = "9999"
    build_order = load_json(root / "BUILD_ORDER.json", {}) or load_json(root / "build" / "BUILD_ORDER.json", {}) or {}
    for mod in build_order.get("module_build_order", []):
        if mod.get("module_id") == module_id:
            order = str(mod.get("order", "9999")).zfill(4)
    out = out_dir / f"{order}_{module_id}.sql"
    lines = [
        f"-- Migration draft for {module_id}",
        "-- Generated by scripts/generate_migrations.py",
        "-- Review before applying to staging or production.",
        "-- Policy: additive only; hard delete forbidden.",
        "CREATE EXTENSION IF NOT EXISTS pgcrypto;",
        "",
    ]
    for collection in collections:
        lines.append(table_sql(collection))
        lines.append("")
    out.write_text("\n".join(lines).strip() + "\n", encoding="utf-8")
    return out

def main() -> int:
    parser = argparse.ArgumentParser(description="Generate PostgreSQL migration drafts from specs.")
    parser.add_argument("--root", default=".")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--module")
    group.add_argument("--all", action="store_true")
    parser.add_argument("--out", default="migrations/generated")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    out_dir = root / args.out
    out_dir.mkdir(parents=True, exist_ok=True)
    modules = [args.module] if args.module else discover_modules(root)
    created = [str(generate(root, m, out_dir)) for m in modules]
    print(json.dumps({"status": "MIGRATIONS_GENERATED", "count": len(created), "files": created}, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
