from __future__ import annotations

import argparse
from common import module_output_dir, module_reports_dir, ZIPS_DIR, make_zip, write_json, file_manifest, write_csv

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--module", required=True)
    args = parser.parse_args()

    folder = module_output_dir(args.module)
    if not folder.exists():
        raise SystemExit(f"Module folder not found: {folder}")

    manifest = {"module_id": args.module, "files": file_manifest(folder)}
    write_json(folder / "PACKAGE_MANIFEST.json", manifest)
    write_csv(folder / "PACKAGE_MANIFEST.csv", manifest["files"], ["path", "size_bytes", "sha256"])

    zip_path = ZIPS_DIR / f"{args.module}_spec_pack.zip"
    summary = make_zip(folder, zip_path)
    write_json(module_reports_dir(args.module) / f"{args.module}_zip_summary.json", summary)
    print(zip_path)

if __name__ == "__main__":
    main()
