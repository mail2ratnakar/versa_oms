#!/usr/bin/env python3
"""Proactive schema-drift auditor — catch the recurring bug classes BEFORE a workflow trips on them.

(1) CONDITIONAL NOT-NULL: columns that are NOT-NULL-no-default but are only populated by a
    specific action/state (reasons, evidence files, actor columns, optional attachments). These
    block inserts of records that legitimately don't have them yet (a draft payment has no
    evidence; a system-created batch has no actor). Emits ONE consolidating migration to review.
(2) CANONICAL vs DB DRIFT: columns the canonical model declares that the live DB lacks (e.g.
    certificates.verification_url) or vice-versa. Pipe DB columns in:
      psql ... -t -A -c "select table_name||'|'||column_name from information_schema.columns where table_schema='public'" | python _validation/check_schema_drift.py --dbcols -

Run before building any workflow whose entity you haven't built yet."""
import json, sys, re
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

CANON = json.load(open("versa-oms/implementation/CANONICAL_DATA_MODEL.json", encoding="utf-8"))["tables"]
# High-confidence "conditional" patterns: set only by a specific transition, never on create.
COND = [
    (re.compile(r"_reason$"), "reason — set only by the action that needs it"),
    (re.compile(r"_note$|_notes$"), "note — conditional commentary"),
    (re.compile(r"evidence"), "evidence — present only when evidence is attached"),
    (re.compile(r"_by$"), "actor — system/automated actions have no actor"),
    (re.compile(r"_file$"), "file ref — optional attachment"),
]

def conditional_not_nulls():
    hits = {}
    for t, d in CANON.items():
        for c in d.get("columns", []):
            if c.get("nullable") or c.get("default") is not None:
                continue
            n = c["name"]
            if n in ("id", "created_by"):  # created_by handled globally; id is pk
                pass
            for rx, why in COND:
                if rx.search(n):
                    hits.setdefault(t, []).append((n, c.get("pg_type"), why))
                    break
    return hits

def timestamp_no_default():
    """created_at/updated_at that are NOT-NULL but have no default — every create on the
    table fails (the kernel doesn't set timestamps). They should DEFAULT now()."""
    hits = []
    for t, d in CANON.items():
        for c in d.get("columns", []):
            if c["name"] in ("created_at", "updated_at") and not c.get("nullable") and c.get("default") is None:
                hits.append((t, c["name"]))
    return hits

def main():
    ts = timestamp_no_default()
    print(f"== TIMESTAMP no-default (should DEFAULT now()): {len(ts)} columns ==")
    tsmig = ["-- timestamps default now() (kernel create does not set them)."]
    for t, n in ts:
        tsmig.append(f'alter table "{t}" alter column "{n}" set default now();')
    if ts:
        print("\n".join("  " + l for l in tsmig[1:][:6]) + ("\n  ..." if len(ts) > 6 else ""))

    hits = conditional_not_nulls()
    total = sum(len(v) for v in hits.values())
    print(f"== CONDITIONAL NOT-NULL candidates: {total} columns across {len(hits)} tables ==")
    mig = ["-- 0018 consolidating: conditional fields made nullable (proactive drift sweep).",
           "-- Review each line; a field that is genuinely always-required on create should be removed."]
    for t in sorted(hits):
        for n, pg, why in hits[t]:
            print(f"  {t}.{n} ({pg}) — {why}")
            mig.append(f'alter table "{t}" alter column "{n}" drop not null;')
    print("\n== suggested migration (review before applying) ==")
    print("\n".join(mig))

    if "--dbcols" in sys.argv:
        src = sys.stdin.read().splitlines()
        dbcols = set()
        for line in src:
            if "|" in line:
                tbl, col = line.split("|", 1)
                dbcols.add((tbl.strip(), col.strip()))
        dbtables = {t for t, _ in dbcols}
        print("\n== CANONICAL vs DB column drift ==")
        miss_db = []
        for t, d in CANON.items():
            if t not in dbtables:
                continue  # table not in DB (view-only / not migrated) — skip column-level
            for c in d.get("columns", []):
                if (t, c["name"]) not in dbcols:
                    miss_db.append(f"  canonical-only (NOT in DB): {t}.{c['name']}")
        for line in sorted(miss_db):
            print(line)
        print(f"  ({len(miss_db)} canonical columns absent from the live DB)")

if __name__ == "__main__":
    main()
