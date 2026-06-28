#!/usr/bin/env python3
"""derive_annotations — PROJECT the founder's annotated flows (source) downstream.

Reads  source-of-truth/v2_supplement/annotated_flows.json   (folded in from /annotate, CLAUDE.md #8/#9)
       spec/staff_journeys.json                              (compose/send per screen — to RESOLVE selectors)
Writes spec/derived/annotations.json                         (per-screen notes, each BOUND to a field/action)
       reports/FLOW_INTENT.md                                (human-readable; the reviewable spec to implement from)

Auto-mapping (derived-only): each annotation's drawn selector is resolved to the exact compose field or send
action it points at, so the note binds to THAT field — gen_portal shows it as the field's help. Only unambiguous
selectors resolve ([name=X], #b_X, a button label); the rest stay screen-level + flagged for review.

Interpretive SUGGESTIONS (review-then-apply, never auto-written to source) emitted to FLOW_INTENT.md:
  ⑤ type=validation -> a suggested `send_validation` block
  ⑥ type=data (prefill intent) -> a suggested compose `prefill` binding
The source compose/journey spec is never auto-mutated — bindings + suggestions live in the derived/report layer.
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


def suggest_send_validation(note, bind):
    """⑤ a type=validation note -> a suggested send_validation check. SUGGESTION only (reviewed)."""
    low = (note or "").lower()
    if any(w in low for w in ("attach", "body", "content", "html")):
        return {"check": "body_or_attachment", "message": note or "Add an email body, or attach a file"}
    if bind.get("kind") == "field" and bind.get("to") == "to":
        return {"check": "recipients", "message": note or "Add at least one recipient"}
    if any(w in low for w in ("recipient", "email id", "address", "to ")):
        return {"check": "recipients", "message": note or "Add at least one recipient"}
    if bind.get("kind") == "field":
        return {"check": "field", "field": bind["to"], "message": note or f"{bind['to']} is required"}
    return {"check": "REVIEW — selector did not resolve to a field", "message": note}


def suggest_prefill(note, bind):
    """⑥ a type=data 'prefill' note bound to a field -> a suggested compose prefill binding. SUGGESTION only."""
    if bind.get("kind") != "field" or bind.get("to") in (None, "to"):
        return None
    low = (note or "").lower()
    if not any(w in low for w in ("prefill", "pre-fill", "auto", "fill", "populate", "from the selection", "from selection", "from selected")):
        return None
    src = ("coordinator_email" if "email" in low else "name" if "name" in low else
           "city" if "city" in low else "state" if "state" in low else "REVIEW — name the source field")
    return {"for_field": bind["to"], "prefill": src}


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
            resolved += 1 if bind["kind"] else 0
            unresolved += 0 if bind["kind"] else 1
            by_screen.setdefault(sid, []).append({
                "n": s.get("n"), "type": s.get("type"), "note": s.get("note", ""),
                "selector": s.get("selector", ""), "flow": fname, "bind": bind,
            })
    for sid in by_screen:
        by_screen[sid].sort(key=lambda a: (a["flow"], a["n"] or 0))

    # interpretive suggestions (reviewed, not auto-applied)
    validations, prefills = {}, {}
    for sid, notes in by_screen.items():
        vs = [suggest_send_validation(n["note"], n["bind"]) for n in notes if (n["type"] or "") == "validation"]
        if vs:
            validations[sid] = vs
        ps = [p for p in (suggest_prefill(n["note"], n["bind"]) for n in notes if (n["type"] or "") == "data") if p]
        if ps:
            prefills[sid] = ps

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

    def _block(title, sub, data, fmt):
        lines.append(f"## {title}")
        lines.append("")
        lines.append(f"_{sub}_")
        lines.append("")
        for sid, items in data.items():
            lines.append(fmt(sid))
            lines.append("```json")
            lines.append(json.dumps(items, indent=2, ensure_ascii=False))
            lines.append("```")
            lines.append("")

    if validations:
        _block("⑤ Suggested `send_validation` — review, then add to the journey in source",
                "Projected from `type=validation` annotations. NOT auto-applied — paste into the journey's `send_validation` after a human/LLM read.",
                validations, lambda sid: f"**{sid}** → `spec/staff_journeys.json` journey `{sid}`, key `send_validation`:")
    if prefills:
        _block("⑥ Suggested compose `prefill` — review, then set on the field in `compose`",
                "Projected from `type=data` annotations that imply prefill. NOT auto-applied — set `prefill` on the named compose field after review.",
                prefills, lambda sid: f"**{sid}** → in journey `{sid}` `compose`, set on each `for_field`:")

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"derive_annotations: {len(flows)} flow(s), {resolved} bound + {unresolved} unresolved, "
          f"{sum(len(v) for v in validations.values())} validation + {sum(len(v) for v in prefills.values())} prefill suggestion(s) across {len(by_screen)} screen(s)")


if __name__ == "__main__":
    main()
