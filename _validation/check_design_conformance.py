#!/usr/bin/env python3
"""Design-conformance gate (FR-DESIGN-SYSTEM-2026-0043 / P-design). Every screen must compose the Versa
design system (design-system/DESIGN_SYSTEM.md), not bare HTML or the legacy "Finverse glass":
  - a real page renders <ModuleTable (which renders PageHeader) OR imports PageHeader from @/components/design
  - no page uses legacy glass-/finverse- classes
  - a custom page with a raw <table> should render statuses via <StatusBadge>
Goal: 0 violations. Run from the repo root: python _validation/check_design_conformance.py
"""
import re, sys, json
from pathlib import Path

PAGES = Path("versa-oms/app/app")
INV = json.loads(Path("versa-oms/design-system/components/COMPONENT_INVENTORY.json").read_text(encoding="utf-8"))
# Required COMPONENT_INVENTORY components that are provided under an existing name.
EQUIV = {"AppShell": "PortalShell", "SidebarNav": "PortalShell", "DataTable": "ModuleTable", "Toast": "ToastViewport", "Modal": "Modal"}
_DESIGN_SRC = ""
for f in ("versa-oms/app/components/design.tsx", "versa-oms/app/components/design-interactive.tsx"):
    p = Path(f)
    if p.exists():
        _DESIGN_SRC += p.read_text(encoding="utf-8")


def missing_components():
    out = []
    for c in INV["components"]:
        if c.get("status") != "required":
            continue
        name = c["component"]
        target = EQUIV.get(name, name)
        if f"export function {target}" in _DESIGN_SRC or f"export const {target}" in _DESIGN_SRC:
            continue
        if name in EQUIV and (Path("versa-oms/app/components/" + EQUIV[name] + ".tsx").exists()):
            continue
        out.append(name)
    return out


def main():
    v = []
    for page in sorted(PAGES.rglob("page.tsx")):
        rel = str(page.relative_to(PAGES.parent)).replace("\\", "/")
        # Portal workflow screens only. The marketing landing (app/page) + public verification (app/verify)
        # follow separate marketing / PUBLIC_VERIFICATION_UI_RULES, not the staff/school portal layout.
        if not (rel.startswith("app/staff/") or rel.startswith("app/school/")):
            continue
        txt = page.read_text(encoding="utf-8")
        has_header = ("<ModuleTable" in txt) or ("<PageHeader" in txt) or ("<DashboardView" in txt) or ("<ModuleLanding" in txt)
        if not has_header and ("<h1" in txt or "module-view" in txt or "ds-page" in txt):
            v.append((rel, "bare page — no PageHeader/ModuleTable (compose the design system)"))
        if re.search(r"\bglass-|\bfinverse-", txt):
            v.append((rel, "uses legacy Finverse/glass classes (use the Versa tokens + .ds-* / design components)"))
        # a custom page that renders a status string in a table without StatusBadge
        if "PageHeader" in txt and "<table" in txt and "_status" in txt and "StatusBadge" not in txt:
            v.append((rel, "status shown as raw text in a table — use <StatusBadge>"))

    miss = missing_components()
    for m in miss:
        v.append(("design-system", f"required component '{m}' is not built/exported (COMPONENT_INVENTORY)"))

    for p, why in v:
        print(f"DESIGN-DEBT  {p}  ·  {why}")
    print(f"\nDESIGN_CONFORMANCE: {len(v)} violation(s)  ->  {'PASS (0 design debt; all required components available)' if not v else 'FAIL'}")
    return 1 if v else 0


if __name__ == "__main__":
    sys.exit(main())
