from __future__ import annotations

import argparse
from pathlib import Path
from common import MODULES_DIR, ZIPS_DIR, make_zip, write_json

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default=str(ZIPS_DIR / "all_modules_spec_pack.zip"))
    args = parser.parse_args()

    if not MODULES_DIR.exists():
        raise SystemExit(f"No modules folder found: {MODULES_DIR}")

    summary = make_zip(MODULES_DIR, Path(args.out))
    write_json(ZIPS_DIR / "all_modules_zip_summary.json", summary)
    print(args.out)

if __name__ == "__main__":
    main()
