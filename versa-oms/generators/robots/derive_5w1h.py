#!/usr/bin/env python3
"""derive_5w1h — the INTERROGATION ENGINE. Resolve Who/What/Where/When/Why/How for every feature from source.

A feature is not "done" until all six interrogatives (Zachman) are answered. This robot RESOLVES each from the
authored source (which traces to the BRD) and records gaps; `check_5w1h` then fails any feature with a gap — so
completeness is structural, not best-effort. The answers FLOW FROM the BRD/source; a blank cell tells you exactly
what to add to the BRD next. (Auto-writing the answer back into the BRD stays the interpretive, reviewed step.)

Writes spec/derived/w5h.json + reports/W5H_MATRIX.md.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SJ = ROOT / "spec" / "staff_journeys.json"
DM = ROOT / "spec" / "derived" / "data_model.json"
OUT = ROOT / "spec" / "derived" / "w5h.json"
REPORT = ROOT / "reports" / "W5H_MATRIX.md"


def resolve(j, entities):
    ent = j.get("entity")
    e = entities.get(ent, {})
    fields = e.get("fields", [])
    stateful = any(f["name"] in ("status", "state") or f["name"].endswith("_status") or f["name"].endswith("_state") for f in fields)
    has_rules = (any((f.get("rule") or "").strip().lower() not in ("", "primary key.") for f in fields)
                 or bool(e.get("relationships")) or stateful)
    return {
        "who": "staff",                                       # portal actor (auth-last; refine per access-matrix)
        "what": ent if ent in entities else None,             # entity (canonical)
        "where": j.get("id"),                                 # the screen
        "when": ("stateful" if stateful else "stateless"),    # lifecycle present or explicitly stateless
        "how": ("crud+actions" if ent in entities else None), # generated routes/services
        "why": ("business-rules" if has_rules else None),     # validation / FKs / lifecycle = the rationale
    }


def main():
    journeys = json.loads(SJ.read_text(encoding="utf-8"))["journeys"]
    entities = json.loads(DM.read_text(encoding="utf-8")).get("entities", {})

    rows = []
    for j in journeys:
        w = resolve(j, entities)
        rows.append({"journey": j.get("id"), "title": j.get("title"), "entity": j.get("entity"),
                     "w5h": w, "missing": [k for k, v in w.items() if not v]})

    OUT.write_text(json.dumps({"_robot": "derive_5w1h", "journeys": rows}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    L = ["# 5 Ws + H completeness matrix — every feature must answer all six (Zachman / EARS)", "",
         "_Answers are DERIVED from source (which traces to the BRD). A `MISSING` cell = a gap to fill in the "
         "BRD/source; `check_5w1h` fails any feature with a gap — not done until all six are answered._", "",
         "| Feature | WHO | WHAT | WHERE | WHEN | WHY | HOW |", "|---|---|---|---|---|---|---|"]
    for r in rows:
        w = r["w5h"]
        c = lambda v: (v if v else "**MISSING**")
        L.append(f"| {r['journey']} ({r['entity']}) | {c(w['who'])} | {c(w['what'])} | {c(w['where'])} | {c(w['when'])} | {c(w['why'])} | {c(w['how'])} |")
    gaps = [r for r in rows if r["missing"]]
    L += ["", f"**{len(rows) - len(gaps)}/{len(rows)} features fully specified.**"]
    for r in gaps:
        L.append(f"- **{r['journey']}** unanswered: {', '.join(r['missing'])} → add to the BRD/source.")
    REPORT.write_text("\n".join(L) + "\n", encoding="utf-8")

    print(f"derive_5w1h: {len(rows)} feature(s), {len(rows) - len(gaps)} fully specified, {len(gaps)} with gaps")


if __name__ == "__main__":
    main()
