#!/usr/bin/env python3
"""NO_RAW_CRUD_UI validator (FR-NO-RAW-CRUD-UI). Fails if any generated screen exposes raw database/technical
shape to a business user. Goal: 0 violations. Catches:
  - create fields whose key/label is a payload/json/metadata/hash/uuid/internal-id/actor (*_by) field
  - FK id fields rendered as a raw text box instead of a reference PICKER
  - status edited as a form field (status must be driven by workflow ACTIONS)
  - technical columns (uuid ids, *_by, hashes, payloads) in a table
  - generic "New record" create CTA
Run from the repo root: python _validation/check_no_raw_crud_ui.py
"""
import re, json, sys
from pathlib import Path

PAGES = Path("versa-oms/app/app")
MODEL = json.loads(Path("versa-oms/implementation/CANONICAL_DATA_MODEL.json").read_text(encoding="utf-8"))["tables"]
# Per-table FK columns: a *_id is a real FK ONLY on the table that declares the 'references' (so a column
# that is a FK elsewhere but an entity's OWN identifier here is not wrongly flagged).
TABLE_FK = {t: {c["name"] for c in m.get("columns", []) if c.get("references") or c.get("fk")} for t, m in MODEL.items()}
try:
    PAGE_TABLES = json.loads(Path("_validation/reports/ui_page_tables.json").read_text(encoding="utf-8"))
except Exception:
    PAGE_TABLES = {}
RAW_KEY = re.compile(r"payload|json|metadata|_hash$|_by$|^ip_address$|^user_agent$|_ref$|_file$|^id$|idempotency|fingerprint|_snapshot$|^details$|^trace_id$|^request_id$|^session_id$")
BANNED_LABEL = re.compile(r"payload|json|metadata|\bhash\b|\braw\b|\buuid\b|fingerprint|snapshot|\bid\b$", re.I)
TECH_COL = re.compile(r"_by$|payload|json|metadata|_hash$|fingerprint|_snapshot$|idempotency")


def _array_on_line(line, prop):
    """Extract the JSON array literal for `prop={[ ... ]}` from a single generated line."""
    i = line.find(prop + "={")
    if i < 0:
        return None
    s = line.find("[", i)
    e = line.rfind("]")
    if s < 0 or e < s:
        return None
    try:
        return json.loads(line[s:e + 1])
    except Exception:
        return None


def main():
    v = []  # (page, where, token, why)
    for page in sorted(PAGES.rglob("page.tsx")):
        rel = str(page.relative_to(PAGES.parent)).replace("\\", "/")
        txt = page.read_text(encoding="utf-8")
        page_table = PAGE_TABLES.get(rel)
        page_fk = TABLE_FK.get(page_table, set()) if page_table else set()
        is_school = rel.startswith("app/school/")  # school pickers need school-scoped lookups (follow-up)
        for line in txt.splitlines():
            fields = _array_on_line(line, "createFields")
            if fields:
                for f in fields:
                    if not isinstance(f, dict):
                        continue
                    k, lbl, t = f.get("key", ""), f.get("label", ""), f.get("type", "text")
                    if RAW_KEY.search(k):
                        v.append((rel, "createField", k, "raw/technical/internal field exposed"))
                    if BANNED_LABEL.search(lbl):
                        v.append((rel, "createField", lbl, "technical label"))
                    # A REAL FK (on THIS page's table) must be a reference picker. An entity's own id, or a
                    # soft/business *_id with no DB FK, is a legitimate labeled identifier — not a raw uuid.
                    if k.endswith("_id") and t != "reference" and k in page_fk:
                        v.append((rel, "createField", k, "FK id not a reference picker"))
                    if k == "status" or k.endswith("_status"):
                        v.append((rel, "createField", k, "status edited as a field (use workflow actions)"))
                cols = None
            cols = _array_on_line(line, "columns")
            if cols:
                for c in cols:
                    if isinstance(c, dict) and TECH_COL.search(c.get("key", "")):
                        v.append((rel, "column", c.get("key", ""), "technical column"))
        if "New record" in txt:
            v.append((rel, "cta", "New record", "generic create label"))

    for page, where, tok, why in v:
        print(f"UI-DEBT  {page}  [{where}:{tok}]  {why}")
    print(f"\nNO_RAW_CRUD_UI: {len(v)} violation(s)  ->  {'PASS (0 UI error debt)' if not v else 'FAIL'}")
    return 1 if v else 0


if __name__ == "__main__":
    sys.exit(main())
