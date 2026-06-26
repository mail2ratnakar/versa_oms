#!/usr/bin/env python3
"""Generation-governance COMPLETENESS gate (P0.14 / spec/GENERATION_GOVERNANCE.md). Every file in the governed
surface must be in EXACTLY ONE of four buckets:
  GENERATED        — in reports/generated_manifest.json (built by build_generated_manifest.py from the generators)
  FROZEN-KERNEL    — in spec/handwritten_allowlist.json -> frozen_kernel (irreducible primitives, founder-signed)
  FROZEN-DEBT      — in spec/handwritten_allowlist.json -> frozen_debt (deliberately hand-written, working, NOT
                     central — a go-live decision; CRs governed by the FROZEN-DEBT rule in CLAUDE.md, NOT pending)
  ALLOWLISTED-DEBT — in spec/handwritten_allowlist.json -> allowlisted_debt (TEMPORARY, pending burn-down; reason + batch)
A governed file in NONE of the four is an ungoverned hand-written file -> FAIL (convert it, or get it signed
onto the allowlist). This is what makes "no hand-written code" structural instead of remembered.

Run from the repo root: python _validation/check_handwritten_census.py
"""
import json, sys
from pathlib import Path

ROOT = Path("versa-oms/app")
GOVERNED = ["app/**/*.ts", "app/**/*.tsx", "server/**/*.ts", "components/**/*.ts", "components/**/*.tsx",
            "supabase/migrations/*.sql", "migrations/*.sql", "lib/**/*.ts", "middleware.ts"]


def load(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def main():
    manifest = load("versa-oms/reports/generated_manifest.json")
    generated = set(manifest["generated"])
    allow = load("versa-oms/spec/handwritten_allowlist.json")
    frozen = set(allow["frozen_kernel"])
    frozen_debt = set(allow.get("frozen_debt", {}))   # deliberately hand-written, working, not central (go-live)
    debt = set(allow["allowlisted_debt"])
    held = frozen | frozen_debt | debt

    governed = set()
    for pat in GOVERNED:
        governed |= {p.relative_to(ROOT).as_posix() for p in ROOT.glob(pat) if p.is_file()}

    ungoverned = sorted(f for f in governed if f not in generated and f not in held)
    overlap = sorted((generated & held))                             # a file claimed by two buckets
    stale = sorted(held - governed)                                  # allowlist entry whose file is gone

    for f in ungoverned:
        print(f"CENSUS-FAIL  {f}  ·  ungoverned hand-written file — generate it, or sign it onto spec/handwritten_allowlist.json")
    for f in overlap:
        print(f"CENSUS-FAIL  {f}  ·  in BOTH the generated manifest and the allowlist — remove the allowlist entry")
    for f in stale:
        print(f"CENSUS-WARN  {f}  ·  allowlist entry for a file that no longer exists — drop it")

    fails = len(ungoverned) + len(overlap)
    print(f"\nGENERATION CENSUS: {len(governed)} governed = {len(generated & governed)} GENERATED + "
          f"{len(frozen & governed)} FROZEN-KERNEL + {len(frozen_debt & governed)} FROZEN-DEBT + "
          f"{len(debt & governed)} ALLOWLISTED-DEBT  | {fails} ungoverned/overlap, {len(stale)} stale")
    print("  -> " + ("PASS (every governed file is in exactly one bucket)" if fails == 0 else "FAIL (ungoverned hand-written files exist)"))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
