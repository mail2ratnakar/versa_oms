#!/usr/bin/env python3
"""Accessibility gate (FR-A11Y-2026-0047 / design-system ACCESSIBILITY_RULES.md). Catches the clear,
statically-detectable violations: icon-only buttons without an aria-label, images without alt text, and
inputs/selects/textareas that have neither an id (to pair with a <label htmlFor>) nor an aria-label.
Goal: 0. Run from the repo root: python _validation/check_a11y.py
"""
import re, sys
from pathlib import Path

ROOT = Path("versa-oms/app")
SYMBOLS = set("×✕✓→←⚠🔒✗·")
FILES = sorted(list((ROOT / "app").rglob("page.tsx")) + list((ROOT / "components").glob("*.tsx")))


def main():
    v = []
    for f in FILES:
        rel = str(f.relative_to(ROOT)).replace("\\", "/")
        txt = f.read_text(encoding="utf-8")
        # icon-only buttons must have an aria-label
        for m in re.finditer(r"<button(?P<attrs>[^>]*)>(?P<inner>[^<>{]{1,3})</button>", txt):
            inner = m.group("inner").strip()
            if inner and all(ch in SYMBOLS for ch in inner) and "aria-label" not in m.group("attrs"):
                v.append((rel, f"icon-only button '{inner}' without aria-label"))
        # images need alt text
        for m in re.finditer(r"<img(?P<attrs>[^>]*?)/?>", txt):
            if "alt=" not in m.group("attrs"):
                v.append((rel, "<img> without alt"))
        # standalone controls need an id (label pairing) or an aria-label — unless wrapped in <Field>/<label>.
        for m in re.finditer(r"<(input|select|textarea)\b", txt):
            kind = m.group(1)
            window = txt[m.start():m.start() + 500]
            # the tag's attributes end at the self-close '/>' (input/select) or the opening '>' (textarea).
            end = window.find("/>")
            if end == -1:
                end = window.find("</")
            tag = window if end == -1 else window[:end]
            if ("aria-label" in tag) or re.search(r"\bid=", tag) or ('type="hidden"' in tag):
                continue
            tail = txt[max(0, m.start() - 200):m.start()].rsplit("</Field>", 1)[-1].rsplit("</label>", 1)[-1]
            if re.search(r"<(Field|label)\b", tail):
                continue  # wrapped in a Field/label -> associated
            v.append((rel, f"<{kind}> without id/aria-label and not in a Field/label"))

    for p, why in v:
        print(f"A11Y-DEBT  {p}  ·  {why}")
    print(f"\nA11Y: {len(v)} issue(s)  ->  {'PASS (0 a11y debt)' if not v else 'FAIL'}")
    return 1 if v else 0


if __name__ == "__main__":
    sys.exit(main())
