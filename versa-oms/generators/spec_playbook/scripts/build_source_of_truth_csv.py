from __future__ import annotations

import argparse
from pathlib import Path
from common import SOURCE_DIR, read_csv, write_csv, read_json, ROOT

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--answers", default=str(SOURCE_DIR / "answered_questionnaire.csv"))
    parser.add_argument("--out", default=str(SOURCE_DIR / "answered_source_of_truth.csv"))
    args = parser.parse_args()

    schema = read_json(ROOT / "config" / "source_of_truth_schema.json")
    headers = schema["columns"]

    rows = read_csv(Path(args.answers))
    normalized = []
    for r in rows:
        item = {h: r.get(h, "") for h in headers}
        if not item["answer"]:
            item["answer"] = "TBD"
            item["answer_source"] = item.get("answer_source") or "tbd"
            item["confidence"] = item.get("confidence") or "tbd"
            item["needs_user_review"] = "true"
        normalized.append(item)

    write_csv(Path(args.out), normalized, headers)
    print(f"Wrote source of truth CSV: {args.out}")

if __name__ == "__main__":
    main()
