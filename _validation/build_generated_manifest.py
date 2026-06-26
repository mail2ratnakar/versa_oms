#!/usr/bin/env python3
"""Build reports/generated_manifest.json — the independent ground truth of which files the generators emit,
for the generation-governance census (P0.14 / check_handwritten_census.py). NOT circular: it determines
"generated" by actually running the generators, not by "everything not on the allowlist".

Method (requires a CLEAN git tree): delete the bulk-generated leaf trees (app routes/pages, server/modules
services), run every route/page/service generator, and record what comes back = GENERATED. Add the known
generated singletons (*.generated.ts, transition*/leadService/navLinks, DDL+RLS migrations from canonical).
Then `git checkout` restores the tree. The census reads the committed manifest (fast, non-mutating).

Re-run this whenever a generator's output set changes (like regenerating). Run from the repo root.
"""
import json, subprocess, sys
from pathlib import Path

ROOT = Path("versa-oms/app")
GENERATORS = ["gen_modules", "gen_core", "gen_school", "gen_ui", "gen_screens", "gen_actions", "gen_school_scope", "gen_masking", "gen_effects", "gen_guards", "gen_jobs", "gen_endpoints", "gen_rules"]
# Bulk-generated leaf trees safe to delete + regenerate (their generators recreate them; kernel stays put).
DELETE_GLOBS = ["app/**/route.ts", "app/**/page.tsx", "server/modules/**/*.ts"]
# Known generated files OUTSIDE the bulk trees (emitted by a generator or derived from the canonical model).
KNOWN_GENERATED = [
    "server/lib/transitionEffects.ts", "server/lib/transitionGuards.ts", "server/lib/transitionPreconditions.ts",
    "server/crm/leadService.ts", "components/navLinks.ts",
]


def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True)


def main():
    if git("status", "--porcelain", "--", str(ROOT)).stdout.strip():
        print("ABORT: working tree under versa-oms/app is dirty. Commit/stash first.", file=sys.stderr)
        return 2

    # snapshot + delete the bulk-generated leaves
    deleted = []
    for g in DELETE_GLOBS:
        deleted += [p for p in ROOT.glob(g) if p.is_file()]
    for p in deleted:
        p.unlink()

    # regenerate
    errors = []
    for gen in GENERATORS:
        r = subprocess.run([sys.executable, f"_validation/{gen}.py"], capture_output=True, text=True)
        if r.returncode != 0:
            errors.append(f"{gen}: {r.stderr.strip()[:200]}")

    # what came back = generated (relative to versa-oms/app)
    regenerated = set()
    for g in DELETE_GLOBS:
        for p in ROOT.glob(g):
            if p.is_file():
                regenerated.add(p.relative_to(ROOT).as_posix())

    # known generated singletons + every *.generated.ts + DDL/RLS migrations (derived from the canonical model)
    generated = set(regenerated)
    for k in KNOWN_GENERATED:
        if (ROOT / k).exists():
            generated.add(k)
    for p in ROOT.glob("server/**/*.generated.ts"):
        generated.add(p.relative_to(ROOT).as_posix())
    for p in list(ROOT.glob("supabase/migrations/*.sql")) + list(ROOT.glob("migrations/*.sql")):
        txt = p.read_text(encoding="utf-8", errors="ignore")[:200]
        if "generated from" in txt or "GENERATED" in txt:
            generated.add(p.relative_to(ROOT).as_posix())

    # restore the tree no matter what
    git("checkout", "--", str(ROOT))

    if errors:
        print("ABORT: a generator failed (manifest would under-count). Tree restored.\n  " + "\n  ".join(errors), file=sys.stderr)
        return 3

    out = Path("versa-oms/reports/generated_manifest.json")
    out.write_text(json.dumps({"_meta": {"built_by": "build_generated_manifest.py", "root": "versa-oms/app"},
                               "generated": sorted(generated)}, indent=1) + "\n", encoding="utf-8")
    print(f"generated_manifest.json: {len(generated)} generated files ({len(regenerated)} from bulk regen, tree restored)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
