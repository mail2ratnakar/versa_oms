"""Shared derivation of read-only detail panels (parent -> child sub-collections) from the canonical model.
Used by gen_modules.py (to emit GET sub-routes) and gen_ui.py (to emit ModuleTable detailPanels).
A child qualifies when it is owned by the SAME module as the parent and has an FK to the parent's table.
The 'core' megamodule is skipped (its tables are peer domains, not sub-collections of each other)."""
import re

_EXCL = re.compile(r"^id$|_id$|^normalized_|_by$|_hash$|idempotency|^version$|archived_at")

def _titleize(s):
    return s.replace("-", " ").replace("_", " ").replace(" at", "").strip().title()

def _subpath(parent, child):
    pp, cp = parent.split("_"), child.split("_")
    i = 0
    while i < len(pp) and i < len(cp) and pp[i] == cp[i]:
        i += 1
    rest = cp[i:] or cp[-1:]
    return "-".join(rest)

def _list_columns(model, child, fk_col):
    cols = model.get(child, {}).get("columns", [])
    status = model.get(child, {}).get("status_field")
    out = []
    for c in cols:
        n = c["name"]
        if n == fk_col or _EXCL.search(n): continue
        if c.get("kind") == "file": continue                       # private file refs not surfaced
        if "private" in (c.get("masking") or []): continue
        out.append(n)
    # status first, then the rest; cap 4
    ordered = ([status] if status and status in out else []) + [c for c in out if c != status]
    return ordered[:4] or ([status] if status else [])

# Write-enabled panels (add + review a child). Keyed by child table. Read-only by default; opt-in here per child.
# File BYTES are deferred (storage not wired) — this registers the document + supports review.
WRITE_PANELS = {
    "school_onboarding_documents": {
        "module": "school_onboarding_ops",
        "actorColumn": "uploaded_by",
        "defaults": {"review_status": "uploaded"},
        "addRequired": ["document_type"],
        "addAllowed": ["document_type", "review_note"],
        "addFields": [
            {"key": "document_type", "label": "Document type", "type": "select", "required": True,
             "options": ["authorization_letter", "school_id_proof", "coordinator_id_proof_optional", "other"]},
            {"key": "review_note", "label": "Note", "type": "textarea"},
        ],
        "review": {
            "editable": ["review_status", "review_note"],
            "reviewerColumn": "reviewed_by", "reviewedAtColumn": "reviewed_at",
            "editFields": [
                {"key": "review_status", "label": "Decision", "type": "select", "required": True,
                 "options": ["under_review", "accepted", "rejected"]},
                {"key": "review_note", "label": "Review note", "type": "textarea"},
            ],
        },
    },
}

def derive_panels(model, parent_table, max_panels=4):
    meta = model.get(parent_table, {})
    owner = meta.get("owner_module")
    if not owner or owner == "core":
        return []
    panels = []
    seen = set()
    for child, cmeta in model.items():
        if child == parent_table or not isinstance(cmeta, dict): continue
        if cmeta.get("owner_module") != owner: continue
        fk_col = None
        for col in cmeta.get("columns", []):
            if (col.get("fk") or "").startswith(parent_table + "("):
                fk_col = col["name"]; break
        if not fk_col: continue
        sp = _subpath(parent_table, child)
        if sp in seen: continue
        seen.add(sp)
        cols = _list_columns(model, child, fk_col)
        if not cols: continue
        panel = {"key": sp, "label": _titleize(sp), "subPath": sp, "table": child, "fk": fk_col, "listColumns": cols}
        if child in WRITE_PANELS:
            panel["write"] = WRITE_PANELS[child]
        panels.append(panel)
    return panels[:max_panels]
