#!/usr/bin/env python3
"""apply_annotations — OPT-IN: promote a step-type's reviewed suggestions FROM annotated_flows INTO source.

The deliberate per-step override of the derived-only default (CLAUDE.md #8). It writes the suggestion into
`spec/staff_journeys.json` (source) — send_validation / tabs / compose.prefill — then you regenerate as normal.
NOT in the gated pipeline: it mutates source on purpose, so you run it knowingly. Idempotent (won't duplicate).

Usage:  python versa-oms/generators/robots/apply_annotations.py [validation|tab|prefill|all]
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import derive_annotations as da  # reuse the exact resolver + suggesters (one source of truth for the mapping)

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "source-of-truth" / "v2_supplement" / "annotated_flows.json"
SJ = ROOT / "spec" / "staff_journeys.json"
REVIEW = "REVIEW — name the source field"


def main(step):
    flows = json.loads(SRC.read_text(encoding="utf-8")).get("flows", {}) if SRC.exists() else {}
    sj = json.loads(SJ.read_text(encoding="utf-8"))
    journeys = {j["id"]: j for j in sj["journeys"]}
    applied = []

    for fname, flow in flows.items():
        for s in flow.get("steps", []):
            sid = (s.get("screen") or "").rsplit("/", 1)[-1].replace(".html", "")
            j = journeys.get(sid)
            if not j:
                continue
            compose, send = j.get("compose", []), j.get("send", [])
            bind = da.resolve_selector(s.get("selector", ""), compose, send)
            t, note = (s.get("type") or ""), s.get("note", "")

            if step in ("validation", "all") and t == "validation":
                sv = da.s_validation(note, bind)
                lst = j.setdefault("send_validation", [])
                if sv and "REVIEW" not in sv["check"] and not any(x.get("check") == sv["check"] and x.get("field") == sv.get("field") for x in lst):
                    lst.append(sv)
                    applied.append(f"{sid}.send_validation += {sv['check']}{(' '+sv['field']) if sv.get('field') else ''}")

            if step in ("tab", "all") and t == "screen":
                tab = da.s_tab(note)
                lst = j.setdefault("tabs", [])
                if tab and not any(x.get("label") == tab["label"] for x in lst):
                    lst.append(tab)
                    applied.append(f"{sid}.tabs += '{tab['label']}'")

            if step in ("prefill", "all") and t == "data":
                pf = da.s_prefill(note, bind)
                if pf and pf["prefill"] != REVIEW:
                    for p in compose:
                        if p.get("field") == pf["for_field"] and p.get("prefill") != pf["prefill"]:
                            p["prefill"] = pf["prefill"]
                            applied.append(f"{sid}.compose[{pf['for_field']}].prefill = {pf['prefill']}")

    if applied:
        SJ.write_text(json.dumps(sj, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"apply_annotations[{step}]: applied {len(applied)} change(s) to source")
    for a in applied:
        print("  +", a)
    if applied:
        print("  -> regenerate to project them (then check_generated / the gates).")
    else:
        print("  (nothing applicable — supported promotions: validation, tab, prefill)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "all")
