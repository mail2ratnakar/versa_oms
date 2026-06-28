#!/usr/bin/env python3
"""gen_manifest — the REPRODUCIBILITY RECEIPT (determinism guarantee).

Emits spec/derived/BUILD_MANIFEST.json = pinned versions (generators/VERSIONS.json) + content hashes of the
SOURCE (the only authored truth), the ROBOTS (the projection logic), and the GENERATED output. Deterministic by
construction (sorted files, sha256, no clock/random) so the same inputs always produce the same manifest — which
check_generated drift-gates. Answer to "which inputs produced this build?": this file. Run LAST in the pipeline.

This closes the research-named gap: a projection pipeline without a recorded, gated fingerprint can't prove
reproducibility. Same source + same robot/template versions => byte-identical output, verifiably.
"""
import json
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "spec" / "derived" / "BUILD_MANIFEST.json"


def files_hash(files):
    h = hashlib.sha256()
    for p in sorted(set(files), key=lambda x: x.relative_to(ROOT).as_posix()):
        if p.is_file():
            h.update(p.relative_to(ROOT).as_posix().encode("utf-8"))
            h.update(b"\0")
            h.update(p.read_bytes())
    return h.hexdigest()


def main():
    versions = json.loads((ROOT / "generators" / "VERSIONS.json").read_text(encoding="utf-8"))

    source_files = (list((ROOT / "source-of-truth").rglob("*.csv"))
                    + list((ROOT / "source-of-truth").rglob("*.json"))
                    + list((ROOT / "spec").glob("*.json")))                 # hand-authored specs (journeys, demo_data, shell)
    robot_files = list((ROOT / "generators" / "robots").glob("*.py")) + [ROOT / "generators" / "VERSIONS.json"]
    gen_files = [p for p in (ROOT / "spec" / "derived").rglob("*")
                 if p.is_file() and p.name != "BUILD_MANIFEST.json"]        # exclude self

    manifest = {
        "_doc": "Reproducibility receipt — same source_sha256 + robots_sha256 + versions => byte-identical generated_sha256. Drift-gated by check_generated. No timestamp on purpose (deterministic).",
        "pipeline_version": versions["pipeline"],
        "template": versions["template"],
        "versions": versions["robots"],
        "source_sha256": files_hash(source_files),
        "robots_sha256": files_hash(robot_files),
        "generated_sha256": files_hash(gen_files),
        "counts": {"source_files": len(source_files), "robot_files": len(robot_files), "generated_files": len(gen_files)},
    }
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"gen_manifest: pipeline {manifest['pipeline_version']} · source {manifest['source_sha256'][:12]} · "
          f"robots {manifest['robots_sha256'][:12]} · generated {manifest['generated_sha256'][:12]}")


if __name__ == "__main__":
    main()
