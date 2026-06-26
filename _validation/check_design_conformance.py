#!/usr/bin/env python3
"""Design-conformance gate (FR-DESIGN-SYSTEM-2026-0043 / P-design). Every screen must compose the Versa
design system (design-system/DESIGN_SYSTEM.md), not bare HTML or the legacy "Finverse glass":
  - a real page renders <ModuleTable (which renders PageHeader) OR imports PageHeader from @/components/design
  - no page uses legacy glass-/finverse- classes
  - a custom page with a raw <table> should render statuses via <StatusBadge>
Goal: 0 violations. Run from the repo root: python _validation/check_design_conformance.py
"""
import re, sys
from pathlib import Path

PAGES = Path("versa-oms/app/app")


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

    for p, why in v:
        print(f"DESIGN-DEBT  {p}  ·  {why}")
    print(f"\nDESIGN_CONFORMANCE: {len(v)} violation(s)  ->  {'PASS (0 design debt)' if not v else 'FAIL'}")
    return 1 if v else 0


if __name__ == "__main__":
    sys.exit(main())
