#!/usr/bin/env python3
"""Workflow-task field engine (FR-NO-RAW-CRUD-UI). Turns raw DB columns into BUSINESS controls so generated
screens are task-shaped, never table editors:
  - FK columns        -> a reference PICKER (dropdown of human labels via /api/staff/lookup/<table>)
  - enum columns      -> a labeled SELECT
  - payload/json/raw  -> HIDDEN from the generic form (routed to a workflow builder; never a raw text box)
  - actor/internal    -> HIDDEN (created_by, *_by, *_hash, ids, status)
  - date/number/bool  -> the right input type
  - everything else   -> a plain input with a HUMAN label
This is the single source the generators consume; the NO_RAW_CRUD_UI validator enforces its output.
"""
import re

# Never user-facing in a CREATE form or a column (internal / server-owned / technical).
HIDDEN_NAMES = {"id", "created_at", "updated_at", "created_by", "updated_by", "archived_at", "version", "user_id"}
HIDDEN_RE = re.compile(r"_by$|_hash$|^prev_hash|^event_hash|idempotency|^normalized_|_payload$|_snapshot$|payload|metadata|^raw_|_json$|^details$|fingerprint|_file$|_ref$|_id_hash$|^ip_address$|^user_agent$|^trace_id$|^request_id$|^session_id$|^external_reference$|_id_hash")
# Technical tokens that must never appear in a user label (the validator also checks these).
BANNED_LABEL_RE = re.compile(r"payload|json|metadata|\bhash\b|\braw\b|\buuid\b|\bid\b$|fingerprint|snapshot|idempotency", re.I)

ABBR_RE = re.compile(r"\b(Id|Url|Omr|Crm|Pdf|Sla|Qr|Pii|Ip|Csv|Awb|Sms|Kyc)\b")


def humanize(n: str) -> str:
    """'exam_cycle_id' -> 'Exam Cycle'; '*_code' -> drop the technical '_code'; keep acronyms upper."""
    base = n
    if base.endswith("_id"):
        base = base[:-3]
    elif base.endswith("_code"):
        base = base[:-5]
    elif base.endswith("_ref"):
        base = base[:-4]
    s = base.replace("_", " ").strip().title()
    return ABBR_RE.sub(lambda m: m.group(1).upper(), s) or n


def label_column(table: str, model: dict) -> str:
    """Best human label column for a reference dropdown (code/name/title), else 'id'."""
    cols = [c["name"] for c in model.get(table, {}).get("columns", [])]
    sing = table[:-1] if table.endswith("s") else table
    for cand in (f"{sing}_name", "name", "full_name", "school_name", "display_name", "title",
                 f"{sing}_code", "code", "label"):
        if cand in cols:
            return cand
    for c in cols:
        if c.endswith("_name") or c.endswith("_code"):
            return c
    return "id"


def _ref_table(col: dict) -> str | None:
    """The table an FK column points at, from canonical 'references'/'fk' (e.g. 'exam_cycles(id)')."""
    ref = col.get("references") or col.get("fk")
    if not ref:
        return None
    m = re.match(r"\s*([a-z_]+)\s*\(", str(ref))
    return m.group(1) if m else None


def classify_field(table: str, col: dict, model: dict, *, status_col: str | None,
                   computed: set, forced: list, own_code: str | None = None) -> dict | None:
    """Classify ONE column into a workflow control dict, or None to hide it. The control dict carries the
    type the ModuleTable component renders ('reference'|'select'|'date'|'number'|'checkbox'|'text').
    own_code = the table's OWN auto-generated code column (hidden); OTHER *_code are business selections."""
    n = col["name"]
    enum = col.get("enum_values")
    pg = (col.get("pg_type") or col.get("type") or "").lower()

    if n in forced:  # a trusted input the server needs (e.g. a count) — keep, typed.
        return {"key": n, "label": humanize(n), "type": _input_type(pg)}
    if n in computed or n in HIDDEN_NAMES or HIDDEN_RE.search(n):
        return None
    if own_code and n == own_code:        # the table's own server-generated business code — never typed
        return None
    if n == status_col or n.endswith("_status"):  # status is driven by WORKFLOW ACTIONS, never edited raw
        return None
    if n.endswith("_count"):
        return None

    ref = _ref_table(col)
    if ref:  # FK -> reference picker (human dropdown, not a raw uuid)
        return {"key": n, "label": humanize(n), "type": "reference", "refTable": ref}
    if enum:  # enum -> labeled select
        return {"key": n, "label": humanize(n), "type": "select",
                "options": [{"value": v, "label": humanize(v)} for v in enum]}
    if pg in ("boolean",) or n.startswith("is_") or n.startswith("has_"):
        return {"key": n, "label": humanize(n), "type": "checkbox"}
    if n.endswith("_at") or n.endswith("_date") or pg in ("date", "timestamp", "timestamptz", "timestamp with time zone"):
        return {"key": n, "label": humanize(n), "type": "date"}
    if pg in ("integer", "bigint", "numeric", "double precision", "real", "smallint"):
        return {"key": n, "label": humanize(n), "type": "number"}
    return {"key": n, "label": humanize(n), "type": "text"}


def _input_type(pg: str) -> str:
    if pg == "boolean":
        return "checkbox"
    if pg in ("integer", "bigint", "numeric", "double precision", "real", "smallint"):
        return "number"
    if pg in ("date", "timestamp", "timestamptz"):
        return "date"
    return "text"


def create_fields(table: str, model: dict, *, status_col: str | None, computed: set, forced: list, own_code: str | None = None, extra_hidden=frozenset()):
    """All workflow create controls for a table (FK pickers, selects, typed inputs); hidden ones dropped.
    extra_hidden = columns the caller knows are server-set in this context (e.g. school_id on a school page,
    which is the authenticated actor's scope — never a picker). Returns (fields, needs_builder)."""
    t = model.get(table, {})
    fields, needs_builder = [], False
    for col in t.get("columns", []):
        n = col["name"]
        if n in extra_hidden:
            continue
        required = (col.get("nullable") is False) and (col.get("default") is None)
        f = classify_field(table, col, model, status_col=status_col, computed=computed, forced=forced, own_code=own_code)
        if f is None:
            # A REQUIRED payload/json that we (correctly) refuse to render raw -> needs a builder.
            if required and re.search(r"payload|_json$|^details$", n) and n not in computed:
                needs_builder = True
            continue
        fields.append(f)
    return fields, needs_builder


def display_columns(table: str, model: dict, status_col: str | None, overrides: dict):
    """List columns that mean something to a business user: no uuids, no *_by, no hashes/payloads."""
    if table in overrides:
        cols = [{"key": n, "label": humanize(n)} for n in overrides[table]]
        if status_col:
            cols.append({"key": status_col, "label": "Status"})
        return cols
    t = model.get(table, {})
    cols = []
    for col in t.get("columns", []):
        n = col["name"]
        if n in HIDDEN_NAMES or HIDDEN_RE.search(n) or n == status_col or n.endswith("_count"):
            continue
        if _ref_table(col) and n.endswith("_id"):
            continue  # a raw FK uuid is meaningless in a table; the detail/picker shows the name
        cols.append({"key": n, "label": humanize(n)})
        if len(cols) >= 4:
            break
    if status_col:
        cols.append({"key": status_col, "label": "Status"})
    return cols
