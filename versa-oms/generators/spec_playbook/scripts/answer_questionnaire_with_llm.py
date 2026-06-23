from __future__ import annotations

import argparse
from pathlib import Path
from common import SOURCE_DIR, read_csv, write_csv

def draft_answer(question: str, modules: str) -> str:
    return (
        "Draft assumption: define clear ownership, lifecycle states, validations, permissions, "
        "security controls, audit events, reports and downstream dependencies for "
        f"{modules or 'the relevant modules'}."
    )

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--questionnaire", default=str(SOURCE_DIR / "questionnaire.csv"))
    parser.add_argument("--out", default=str(SOURCE_DIR / "answered_questionnaire.csv"))
    parser.add_argument("--mode", choices=["llm_draft", "hybrid"], default="hybrid")
    args = parser.parse_args()

    rows = read_csv(Path(args.questionnaire))
    for r in rows:
        if not r.get("answer"):
            r["answer"] = draft_answer(r.get("question", ""), r.get("affected_modules", ""))
            r["answer_source"] = "llm_draft"
            r["confidence"] = "medium"
            r["needs_user_review"] = "true"
            r["assumptions"] = "Drafted by deterministic fallback. Replace with LLM/user answer for production."

    headers = list(rows[0].keys()) if rows else []
    write_csv(Path(args.out), rows, headers)
    print(f"Wrote answered questionnaire: {args.out}")

if __name__ == "__main__":
    main()
