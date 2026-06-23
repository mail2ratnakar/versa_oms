#!/usr/bin/env python3
"""Generate staff module pages from declarative SCREEN SPECS.

spec/screens/<module>.screen.json  ->  app/app/staff/<route>/page.tsx

The page is pure config passed to the centralized <ModuleTable> engine. This is
the spec-driven replacement for hand-written pages: edit the screen spec, never
the generated page. Any module that has a screen spec is owned by this generator
(and skipped by gen_ui)."""
import json, re, sys
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SCREENS = Path("versa-oms/spec/screens")
APP = Path("versa-oms/app/app/staff")
ROUTE_RE = re.compile(r"^[a-z0-9_-]+(/[a-z0-9_-]+)*$")  # no traversal, no absolute paths

# camelCase prop order for <ModuleTable> (snake keys in the spec map to these).
PROP_ORDER = ["title", "eyebrow", "endpoint", "moduleId", "columns", "statusKey",
              "createFields", "actions", "rowSelect", "detailPanel", "customActions", "importConfig"]

def camel(s: str) -> str:
    head, *tail = s.split("_")
    return head + "".join(p[:1].upper() + p[1:] for p in tail)

def deep_camel(o):
    if isinstance(o, dict):
        return {camel(k): deep_camel(v) for k, v in o.items()}
    if isinstance(o, list):
        return [deep_camel(x) for x in o]
    return o

def emit(screen: dict) -> None:
    route = screen.get("route", "")
    if not ROUTE_RE.match(route):
        raise ValueError(f"Invalid/unsafe route in screen spec: {route!r} (must match {ROUTE_RE.pattern})")
    cfg = deep_camel(screen)
    props = []
    for k in PROP_ORDER:
        if cfg.get(k) is not None:
            props.append(f"      {k}={{{json.dumps(cfg[k], ensure_ascii=False)}}}")
    tsx = (
        f'// GENERATED from spec/screens/{screen["module_id"]}.screen.json by _validation/gen_screens.py — DO NOT EDIT.\n'
        f'// To change this page, edit the screen spec and re-run: python _validation/gen_screens.py\n'
        'import { ModuleTable } from "@/components/ModuleTable";\n\n'
        'export default function Page() {\n  return (\n    <ModuleTable\n'
        + "\n".join(props) +
        "\n    />\n  );\n}\n"
    )
    out = APP / screen["route"] / "page.tsx"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(tsx, encoding="utf-8")
    print("generated", out)

def screen_modules() -> set:
    return {p.name.replace(".screen.json", "") for p in SCREENS.glob("*.screen.json")}

if __name__ == "__main__":
    specs = sorted(SCREENS.glob("*.screen.json"))
    if not specs:
        print("no screen specs found"); sys.exit(0)
    for f in specs:
        emit(json.load(open(f, encoding="utf-8")))
    print(f"done: {len(specs)} page(s) from screen specs")
