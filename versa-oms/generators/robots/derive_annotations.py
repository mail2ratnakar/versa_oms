#!/usr/bin/env python3
"""derive_annotations — PROJECT the founder's annotated flows (source) downstream.

Reads  source-of-truth/v2_supplement/annotated_flows.json   (folded in from /annotate, CLAUDE.md #8/#9)
       spec/staff_journeys.json                              (compose/send per screen — to RESOLVE selectors)
Writes spec/derived/annotations.json                         (per-screen notes, each BOUND to a field/action)
       reports/FLOW_INTENT.md                                (human-readable; the reviewable spec to implement from)

Auto-mapping (derived-only): each annotation's drawn selector is resolved to the exact compose field or send
action it points at, so the note binds to THAT field — gen_portal then shows it as the field's help. Only
unambiguous selectors resolve ([name=X], #b_X, a button label); the rest stay screen-level + flagged for review.
The source compose spec is never auto-mutated — the binding lives in the derived layer.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "source-of-truth" / "v2_supplement" / "annotated_flows.json"
JOURNEYS = ROOT / "spec" / "staff_journeys.json"
OUT = ROOT / "spec" / "derived" / "annotations.json"
REPORT = ROOT / "reports" / "FLOW_INTENT.md"


def resolve_selector(sel, compose, send):
    """Deterministic selector -> {kind: field|action|None, to: <name|key|None>}. Unambiguous cases only."""
    sel = (sel or "").strip()
    fields = {p.get("field") for p in compose if p.get("field")}
    if sel.startswith("[name="):
        x = sel[6:]
        x = (x[:x.find("]")] if "]" in x else x).strip()
        if x in fields:
            return {"kind": "field", "to": x}
    if sel.startswith("#"):
        idv = sel[1:].split()[0].strip()
        if idv.startswith("b_"):
            f = idv[2:]
            if f in fields:
                return {"kind": "field", "to": f}
            if idv == "b_to":                       # the recipients/To part has no stored field
                return {"kind": "field", "to": "to"}
    m = re.search(r'[“”"]([^“”"]+)[“”"]', sel)   # tag "Label" (curly or straight)
    if m:
        lbl = m.group(1).strip().lower()
        for a in send:
            al = (a.get("label") or "").lower()
            if al and (al == lbl or lbl in al or al in lbl):
                return {"kind": "action", "to": a.get("key")}
    return {"kind": None, "to": None}


def main():
    flows = json.loads(SRC.read_text(encoding="utf-8")).get("flows", {}) if SRC.exists() else {}
    journeys = {}
    if JOURNEYS.exists():
        for j in json.loads(JOURNEYS.read_text(encoding="utf-8")).get("journeys", []):
            journeys[j["id"]] = {"compose": j.get("compose", []), "send": j.get("send", [])}

    by_screen, resolved, unresolved = {}, 0, 0
    for fname, flow in flows.items():
        for s in flow.get("steps", []):
            sid = (s.get("screen") or "").rsplit("/", 1)[-1].replace(".html", "")
            if not sid:
                continue
            jc = journeys.get(sid, {"compose": [], "send": []})
            bind = resolve_selector(s.get("selector", ""), jc["compose"], jc["send"])
            if bind["kind"]:
                resolved += 1
            else:
                unresolved += 1
            by_screen.setdefault(sid, []).append({
                "n": s.get("n"), "type": s.get("type"), "note": s.get("note", ""),
                "selector": s.get("selector", ""), "flow": fname, "bind": bind,
            })
    for sid in by_screen:
        by_screen[sid].sort(key=lambda a: (a["flow"], a["n"] or 0))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(by_screen, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    lines = ["# Flow intent — projected from annotated_flows.json", "",
             "_Source: `source-of-truth/v2_supplement/annotated_flows.json` (the founder's /annotate output). "
             "Selectors are auto-resolved to compose fields/actions where unambiguous; **unresolved** steps need a "
             "human read. Implement compose/tabs/rules from this — the intent is in source, not chat._", ""]
    if not flows:
        lines.append("_No annotated flows captured yet. Use **Send to source** on /annotate._")
    for fname, flow in flows.items():
        steps = flow.get("steps", [])
        lines.append(f"## Flow: {fname}  ({len(steps)} steps)")
        last = None
        for s in steps:
            if s.get("screen") != last:
                lines.append(f"\n**{s.get('screen','')}**\n")
                last = s.get("screen")
            sid = (s.get("screen") or "").rsplit("/", 1)[-1].replace(".html", "")
            jc = journeys.get(sid, {"compose": [], "send": []})
            b = resolve_selector(s.get("selector", ""), jc["compose"], jc["send"])
            tag = (f"binds → {b['kind']} `{b['to']}`" if b["kind"] else "**unresolved — needs review**")
            sel = f" _(`{s.get('selector')}`)_" if s.get("selector") else ""
            lines.append(f"- ({s.get('type','')}) {s.get('note') or '(no note)'} — {tag}{sel}")
        lines.append("")
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"derive_annotations: {len(flows)} flow(s), {resolved} bound + {unresolved} unresolved across {len(by_screen)} screen(s) -> {OUT.name}, {REPORT.name}")


if __name__ == "__main__":
    main()
