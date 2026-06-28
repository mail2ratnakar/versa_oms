#!/usr/bin/env python3
"""GATE check_privacy — India DPDP Act 2023 (incl. children's-data provisions), declared in source + verified.

HARD: every PII-classified field exists in canonical (no stale classification) · every children-data entity has a
consent field present (DPDP verifiable guardian consent) · data-principal right 'erasure' + data localization declared.
REPORT: the children-data entities + the DEFERRED enforcement work (consent-gate, erasure endpoint, retention sweep).
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SEC = ROOT / "source-of-truth" / "v2_supplement" / "security.json"
DM = ROOT / "spec" / "derived" / "data_model.json"


def main():
    priv = json.loads(SEC.read_text(encoding="utf-8")).get("privacy", {})
    entities = json.loads(DM.read_text(encoding="utf-8")).get("entities", {})
    fails = []

    if not priv:
        print("check_privacy: FAIL — no privacy policy declared in security.json (DPDP)")
        return 1

    cls = priv.get("classification", {})
    for ent, c in cls.items():
        e = entities.get(ent)
        if not e:
            fails.append(f"classification for unknown entity '{ent}'")
            continue
        names = {f["name"] for f in e.get("fields", [])}
        for pii in c.get("pii", []):
            if pii not in names:
                fails.append(f"{ent}: classified PII field '{pii}' not in canonical (stale classification)")
        if c.get("is_children_data"):
            cf = c.get("consent_field")
            if not cf or cf not in names:
                fails.append(f"{ent} is children-data but no consent field present (DPDP guardian consent): {cf}")

    if "erasure" not in priv.get("data_principal_rights", []):
        fails.append("data-principal right 'erasure' (right to be forgotten) not declared")
    if not priv.get("data_localization"):
        fails.append("data localization not declared (DPDP)")

    children = [e for e, c in cls.items() if c.get("is_children_data")]
    print(f"  children-data entities: {children or 'none'} — DPDP minors' protections apply (verifiable guardian consent)")
    print(f"  deferred enforcement: {len(priv.get('deferred_enforcement', []))} items (consent-gate, erasure, withdrawal, retention sweep)")

    for f in fails:
        print(f"  FAIL {f}")
    if fails:
        print(f"check_privacy: FAIL — {len(fails)} issue(s)")
        return 1
    print("check_privacy: PASS — PII classified (no stale), children-data consent modeled, rights + localization declared")
    return 0


if __name__ == "__main__":
    sys.exit(main())
