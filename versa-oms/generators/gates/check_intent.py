#!/usr/bin/env python3
"""GATE check_intent — every questionnaire question is answered (no gaps in the source of truth)."""
import csv, sys
def main():
    rows = list(csv.DictReader(open("versa-oms/generators/spec_playbook/inputs/answered_questionnaire.csv", encoding="utf-8-sig")))
    bad = [r["question_id"].strip() for r in rows if r.get("status","").strip()!="ANSWERED" or not r.get("answer_source_of_truth","").strip()]
    if bad: print(f"check_intent: FAIL — {len(bad)} unanswered: {bad[:5]}"); return 1
    print(f"check_intent: PASS — {len(rows)} questions, all answered"); return 0
if __name__ == "__main__": sys.exit(main())
