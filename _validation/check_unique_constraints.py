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

ADD_RE = re.compile(r'alter\s+table\s+"(\w+)"\s+add\s+constraint\s+"(\w+)"\s+unique\s*\(([^)]+)\)', re.I)
DROP_RE = re.compile(r'alter\s+table\s+"(\w+)"\s+drop\s+constraint(?:\s+if\s+exists)?\s+"(\w+)"', re.I)


def main():
    active = {}  # constraint_name -> (table, [cols])
    for f in sorted(MIG.glob("*.sql")):
        txt = f.read_text(encoding="utf-8")
        for m in ADD_RE.finditer(txt):
            table, name, cols = m.group(1), m.group(2), [c.strip().strip('"') for c in m.group(3).split(",")]
            active[name] = (table, cols)
        for m in DROP_RE.finditer(txt):
            active.pop(m.group(2), None)

    # Columns that participate in a COMPOSITE (multi-column) unique, per table — the composite is the
    # intended natural-key scope, so a separate single-column unique on the same column is wrong.
    composite_cols = {}  # table -> set(cols in any multi-column unique)
    for _name, (table, cols) in active.items():
        if len(cols) > 1:
            composite_cols.setdefault(table, set()).update(cols)

    bad = []
    for name, (table, cols) in active.items():
        if len(cols) != 1:
            continue
        col = cols[0]
        if (table, col) in INTENTIONAL:
            continue
        # FK/version columns must not be globally unique...
        if col.endswith("_id") or col.endswith("_version"):
            bad.append((table, col, name, "FK/version column"))
        # ...nor any column that is ALSO part of a composite unique (the composite is the real scope;
        # the single-column one shadows it — e.g. notification_recipients.recipient_key vs
        # (batch_id, recipient_key)). This catches natural-key cols (*_key) the suffix rule misses.
        elif col in composite_cols.get(table, set()):
            bad.append((table, col, name, "shadows the composite natural key"))

    if bad:
        print("BAD single-column UNIQUE constraints (one-to-many / versioning / scoped-key broken):")
        for table, col, name, why in sorted(bad):
            print(f"  {table}.{col}  ({name}) — {why}")
        print("\nFix: drop the single-column unique + keep/add the correct natural-key composite (see migration 0023/0027).")
        return 1
    print(f"OK — no bad single-column UNIQUE constraints (scanned {len(active)} active uniques; "
          f"{len(INTENTIONAL)} intentional single-column allowlisted).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
