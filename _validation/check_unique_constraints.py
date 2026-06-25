#!/usr/bin/env python3
"""Guardrail for the generated-DDL UNIQUE-constraint bug (FR-SCHEMA-UNIQUES-2026-0007).

The DDL generator created single-column UNIQUE constraints on FK columns (`*_id`) and version
columns (`*_version`) that must NOT be globally unique — each silently breaks a one-to-many or
per-entity versioning (candidate_results/0022, eval responses+scores, notifications, settings,
reports, materials/0023). This scans ALL migrations, computes the NET active unique constraints,
and FAILS if any non-allowlisted single-column unique on a FK/version column remains. Run after
adding a migration; a new bad unique is a tracked regression, never silently shipped.
"""
import re, sys
from pathlib import Path
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

MIG = Path("versa-oms/app/supabase/migrations")

# One-to-one / lookup uniques that are legitimately single-column.
INTENTIONAL = {
    ("staff_profiles", "user_id"),
    ("portal_roles", "role_id"),
    ("portal_roles", "directus_role_id"),
    ("exam_slot_bookings", "participation_id"),  # one active booking per participation (flagged for review)
}

ADD_RE = re.compile(r'alter table "(\w+)" add constraint "(\w+)" unique \(([^)]+)\)', re.I)
DROP_RE = re.compile(r'alter table "(\w+)" drop constraint(?: if exists)? "(\w+)"', re.I)


def main():
    active = {}  # constraint_name -> (table, [cols])
    for f in sorted(MIG.glob("*.sql")):
        txt = f.read_text(encoding="utf-8")
        for m in ADD_RE.finditer(txt):
            table, name, cols = m.group(1), m.group(2), [c.strip().strip('"') for c in m.group(3).split(",")]
            active[name] = (table, cols)
        for m in DROP_RE.finditer(txt):
            active.pop(m.group(2), None)

    bad = []
    for name, (table, cols) in active.items():
        if len(cols) != 1:
            continue
        col = cols[0]
        if (table, col) in INTENTIONAL:
            continue
        if col.endswith("_id") or col.endswith("_version"):
            bad.append((table, col, name))

    if bad:
        print("BAD single-column UNIQUE constraints on FK/version columns (one-to-many / versioning broken):")
        for table, col, name in sorted(bad):
            print(f"  {table}.{col}  ({name})")
        print("\nFix: drop the single-column unique + add the correct natural-key composite (see migration 0023).")
        return 1
    print(f"OK — no bad single-column UNIQUE constraints (scanned {len(active)} active uniques; "
          f"{len(INTENTIONAL)} intentional single-column allowlisted).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
