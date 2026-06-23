#!/usr/bin/env python3
"""Inventory + duplicate detection across all extracted packs."""
import hashlib, json, os, sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("_staging")

def sha256(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

by_hash = defaultdict(list)   # hash -> [paths]
by_ext = defaultdict(int)
by_name = defaultdict(list)   # basename -> [paths]
total = 0
total_bytes = 0
skipped = 0

for dirpath, dirnames, filenames in os.walk(ROOT):
    if "__pycache__" in dirpath:
        continue
    for fn in filenames:
        p = Path(dirpath) / fn
        try:
            size = p.stat().st_size
        except OSError:
            skipped += 1
            continue
        total += 1
        total_bytes += size
        ext = p.suffix.lower() or "(none)"
        by_ext[ext] += 1
        by_name[fn].append(str(p))
        # only hash text-ish/spec files for dup detection (skip big binaries/xlsx noise)
        by_hash[sha256(p)].append(str(p.relative_to(ROOT)))

# duplicate content groups (identical bytes, 2+ copies)
dupe_groups = {h: paths for h, paths in by_hash.items() if len(paths) > 1}
wasted = 0
for h, paths in dupe_groups.items():
    # waste = (n-1) * size of one
    sample = ROOT / paths[0]
    try:
        wasted += (len(paths) - 1) * sample.stat().st_size
    except OSError:
        pass

report = {
    "root": str(ROOT),
    "total_files": total,
    "total_mb": round(total_bytes / 1e6, 2),
    "unique_contents": len(by_hash),
    "duplicate_content_groups": len(dupe_groups),
    "redundant_copies": sum(len(p) - 1 for p in dupe_groups.values()),
    "wasted_mb": round(wasted / 1e6, 2),
    "by_extension": dict(sorted(by_ext.items(), key=lambda x: -x[1])),
    "top_duplicated_basenames": sorted(
        ((name, len(paths)) for name, paths in by_name.items() if len(paths) > 3),
        key=lambda x: -x[1])[:25],
}

os.makedirs("_validation/out", exist_ok=True)
with open("_validation/out/inventory.json", "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2)
# also dump full dupe groups for later dedupe
with open("_validation/out/duplicate_groups.json", "w", encoding="utf-8") as f:
    json.dump({h: paths for h, paths in dupe_groups.items()}, f, indent=2)

print(json.dumps(report, indent=2))
