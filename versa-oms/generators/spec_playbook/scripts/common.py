from __future__ import annotations

import csv
import hashlib
import json
import os
import re
import shutil
import zipfile
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUTS = ROOT / "outputs"
MODULES_DIR = DEFAULT_OUTPUTS / "modules"
REPORTS_DIR = DEFAULT_OUTPUTS / "reports"
ZIPS_DIR = DEFAULT_OUTPUTS / "zips"
SOURCE_DIR = DEFAULT_OUTPUTS / "source_of_truth"

def ensure_dirs() -> None:
    for p in [DEFAULT_OUTPUTS, MODULES_DIR, REPORTS_DIR, ZIPS_DIR, SOURCE_DIR]:
        p.mkdir(parents=True, exist_ok=True)

def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")

def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.rstrip() + "\n", encoding="utf-8")

def read_json(path: Path) -> Any:
    return json.loads(read_text(path))

def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

def read_csv(path: Path) -> List[Dict[str, str]]:
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))

def write_csv(path: Path, rows: List[Dict[str, Any]], headers: Optional[List[str]] = None) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if headers is None:
        headers = list(rows[0].keys()) if rows else []
    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=headers)
        w.writeheader()
        for row in rows:
            w.writerow({k: row.get(k, "") for k in headers})

def snake_case(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9]+", "_", value.strip().lower())
    value = re.sub(r"_+", "_", value).strip("_")
    return value or "module"

def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def file_manifest(folder: Path) -> List[Dict[str, Any]]:
    files = []
    for p in sorted(folder.rglob("*")):
        if p.is_file():
            files.append({
                "path": str(p.relative_to(folder)).replace("\\", "/"),
                "size_bytes": p.stat().st_size,
                "sha256": sha256_file(p)
            })
    return files

def make_zip(folder: Path, zip_path: Path) -> Dict[str, Any]:
    zip_path.parent.mkdir(parents=True, exist_ok=True)
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for p in sorted(folder.rglob("*")):
            if p.is_file():
                zf.write(p, str(p.relative_to(folder)).replace("\\", "/"))
    with zipfile.ZipFile(zip_path, "r") as zf:
        bad = zf.testzip()
        names = zf.namelist()
    return {
        "zip_path": str(zip_path),
        "zip_integrity": "OK" if bad is None else f"BAD_FILE:{bad}",
        "zip_file_count": len(names)
    }

def load_state() -> Dict[str, Any]:
    path = ROOT / "state" / "current_company_portal_state.json"
    return read_json(path) if path.exists() else {"completed_modules": [], "pending_modules": [], "next_recommended_module": None}

def load_registry(path: Optional[Path] = None) -> List[Dict[str, str]]:
    path = path or ROOT / "inputs" / "module_registry.csv"
    return read_csv(path)

def module_output_dir(module_id: str) -> Path:
    return MODULES_DIR / module_id

def module_spec_dir(module_id: str) -> Path:
    return module_output_dir(module_id) / "spec" / "modules" / module_id

def module_reports_dir(module_id: str) -> Path:
    return module_output_dir(module_id) / "reports"

def load_required_files() -> Dict[str, Any]:
    return read_json(ROOT / "config" / "module_spec_required_files.json")

def render_template(text: str, values: Dict[str, Any]) -> str:
    out = text
    for k, v in values.items():
        out = out.replace("{{" + k + "}}", str(v))
    return out
