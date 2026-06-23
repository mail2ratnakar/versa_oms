#!/usr/bin/env python3
"""Consistency + inventory check on the clean versa-oms/ tree."""
import hashlib, json, os
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path("versa-oms")

# ---- inventory ----
by_ext = Counter(); total = 0; total_bytes = 0
by_hash = defaultdict(list)
for dp, dirs, files in os.walk(ROOT):
    if "__pycache__" in dp: continue
    for fn in files:
        p = Path(dp)/fn
        total += 1; sz = p.stat().st_size; total_bytes += sz
        by_ext[p.suffix.lower() or "(none)"] += 1
        h = hashlib.sha256(p.read_bytes()).hexdigest()
        by_hash[h].append(str(p.relative_to(ROOT)))

dupes = {h:v for h,v in by_hash.items() if len(v)>1}

# ---- JSON validity ----
bad_json = []
json_count = 0
for p in ROOT.rglob("*.json"):
    json_count += 1
    try: json.loads(p.read_text(encoding="utf-8"))
    except Exception as e: bad_json.append((str(p.relative_to(ROOT)), str(e)[:80]))

# ---- module completeness ----
MOD = ROOT/"spec/modules"
CORE_FILES = ["module.json","schema.json","features.json","workflows.json",
              "permissions.json","validations.json","screens.json","messages.json",
              "security.json","tests.json"]
mod_status = {}
empty_files = []
for md in sorted(MOD.iterdir()):
    if not md.is_dir(): continue
    present = set(p.name for p in md.iterdir() if p.is_file())
    missing = [f for f in CORE_FILES if f not in present]
    mod_status[md.name] = {"files": len(present), "missing_core": missing}
    for p in md.iterdir():
        if p.is_file() and p.stat().st_size == 0: empty_files.append(str(p.relative_to(ROOT)))

# ---- empty files anywhere ----
for p in ROOT.rglob("*"):
    if p.is_file() and p.stat().st_size == 0 and str(p.relative_to(ROOT)) not in empty_files:
        empty_files.append(str(p.relative_to(ROOT)))

report = {
    "total_files": total, "total_mb": round(total_bytes/1e6,2),
    "by_extension": dict(by_ext.most_common()),
    "json_files": json_count, "invalid_json_count": len(bad_json), "invalid_json": bad_json,
    "internal_duplicate_groups": len(dupes),
    "internal_duplicates": {f"group_{i}": v for i,v in enumerate(dupes.values())},
    "modules": len(mod_status),
    "modules_missing_core_files": {k:v["missing_core"] for k,v in mod_status.items() if v["missing_core"]},
    "empty_files": empty_files,
}
(ROOT/"reports/CONSISTENCY_REPORT.json").write_text(json.dumps(report,indent=2),encoding="utf-8")

print("total files:", total, f"({report['total_mb']} MB)")
print("by ext:", dict(by_ext.most_common(8)))
print("JSON files:", json_count, "| INVALID:", len(bad_json))
for b in bad_json[:10]: print("   BAD:", b)
print("modules:", len(mod_status))
miss = report["modules_missing_core_files"]
print("modules missing core files:", miss if miss else "none")
print("internal duplicate groups:", len(dupes))
for i,v in enumerate(list(dupes.values())[:10]): print(f"   dup{i}: {v}")
print("empty files:", empty_files if empty_files else "none")
