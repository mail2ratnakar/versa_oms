#!/usr/bin/env python3
"""Workflow registry checker (FR-WORKFLOW-REGISTRY-2026-0021).

Validates spec/WORKFLOW_REGISTRY.json against THIS repo (single source of truth: every module and
every e2e spec it references must really exist — no parallel truth), and DERIVES each workflow's
completion status (built / partial / covered-by-deps / planned) from tests/e2e. Writes
reports/WORKFLOW_STATUS.md and names the next chain to build. Exit 1 if the registry references a
module or test that doesn't exist (drift). Run from the repo root."""
import json, sys
from pathlib import Path
from collections import deque
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

REG = Path("versa-oms/spec/WORKFLOW_REGISTRY.json")
MODULES = Path("versa-oms/spec/modules")
E2E = Path("versa-oms/app/tests/e2e")
OUT = Path("versa-oms/reports/WORKFLOW_STATUS.md")
ICON = {"built": "[x] built", "covered-by-deps": "[x] via-deps", "partial": "[~] partial", "planned": "[ ] planned"}


def main():
    reg = json.loads(REG.read_text(encoding="utf-8"))
    wfs = reg["workflows"]
    ids = {w["workflow_id"] for w in wfs}
    known_modules = {p.name for p in MODULES.iterdir() if p.is_dir()}

    # 1) Single-source guard: every referenced module / e2e spec / dependency must exist.
    errors = []
    for w in wfs:
        for m in w["modules_touched"]:
            if m not in known_modules:
                errors.append(f"{w['workflow_id']}: unknown module '{m}' (no spec/modules/{m})")
        for s in w.get("e2e_specs", []):
            if not (E2E / s).exists():
                errors.append(f"{w['workflow_id']}: e2e spec not found: tests/e2e/{s}")
        for d in w.get("depends_on", []):
            if d not in ids:
                errors.append(f"{w['workflow_id']}: depends_on unknown workflow '{d}'")

    # 2) Derive status from the repo (not hand-maintained).
    status = {}
    for w in wfs:
        specs = w.get("e2e_specs", [])
        present = [s for s in specs if (E2E / s).exists()]
        status[w["workflow_id"]] = "planned" if not specs else ("built" if len(present) == len(specs) else "partial")
    byid = {w["workflow_id"]: w for w in wfs}
    # Only an explicit AGGREGATE workflow (e.g. the full happy path) can be "covered" by its built deps.
    # A leaf workflow with no e2e is honestly "planned" — deps being built does NOT make it done.
    for w in wfs:
        if w.get("aggregate") and status[w["workflow_id"]] == "planned" and w.get("depends_on") and all(status.get(d) in ("built", "covered-by-deps") for d in w["depends_on"]):
            status[w["workflow_id"]] = "covered-by-deps"

    # 3) Dependency execution order (tie-break by priority).
    indeg = {i: 0 for i in byid}
    g = {i: [] for i in byid}
    for w in wfs:
        for d in w.get("depends_on", []):
            if d in byid:
                g[d].append(w["workflow_id"]); indeg[w["workflow_id"]] += 1
    q = deque(sorted([i for i, d in indeg.items() if d == 0], key=lambda i: byid[i]["priority"]))
    order = []
    while q:
        i = q.popleft(); order.append(i)
        for n in g[i]:
            indeg[n] -= 1
            if indeg[n] == 0: q.append(n)
        q = deque(sorted(q, key=lambda i: byid[i]["priority"]))
    for i in sorted(byid, key=lambda i: byid[i]["priority"]):
        if i not in order: order.append(i)

    # 4) Report.
    lines = ["# Workflow Status (derived by `_validation/check_workflows.py`)", "",
             "The dictionary of end-to-end business chains. **Code ONE workflow end-to-end — through every completion gate (ARCH_RUNTIME_CHECKLIST §16 + P0.10 UI) — before starting the next**, picking by the dependency order below. Status is DERIVED from `tests/e2e` (not hand-edited).", "",
             "| # | Workflow | Status | Modules | e2e (present/total) | Depends on |",
             "|---|---|---|---|---|---|"]
    for n, i in enumerate(order, 1):
        w = byid[i]; specs = w.get("e2e_specs", []); present = [s for s in specs if (E2E / s).exists()]
        lines.append(f"| {n} | `{i}` {w['name']} | {ICON[status[i]]} | {len(w['modules_touched'])} | {len(present)}/{len(specs)} | {', '.join(w.get('depends_on', [])) or '—'} |")
    built = sum(1 for s in status.values() if s in ("built", "covered-by-deps"))
    nxt = next((f"`{i}` {byid[i]['name']}" for i in order if status[i] in ("planned", "partial")), "all chains built")
    lines += ["", f"**{built}/{len(wfs)} workflows built (or covered by built deps).** Next chain to build: {nxt}.", ""]
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"workflow status -> {OUT}  ({built}/{len(wfs)} built; next: {nxt})")
    if errors:
        print("WORKFLOW REGISTRY DRIFT (registry references something that doesn't exist):")
        for e in errors:
            print("  " + e)
        return 1
    print("OK - registry references valid (modules + e2e specs all exist).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
