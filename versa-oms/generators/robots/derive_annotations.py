#!/usr/bin/env python3
"""derive_annotations — PROJECT the founder's annotated flows (source) downstream — the full interpretation ladder.

Reads  source-of-truth/v2_supplement/annotated_flows.json   (folded in from /annotate, CLAUDE.md #8/#9)
       spec/staff_journeys.json                              (compose/send per screen — to RESOLVE selectors)
Writes spec/derived/annotations.json                         (per-screen notes, each BOUND to a field/action)
       reports/FLOW_INTENT.md                                (human-readable; the reviewable spec to implement from)

DETERMINISTIC bindings (auto, derived-only) — ②③④: a drawn selector resolves to the exact compose field/action;
gen_portal shows the note as that field's help. INTERPRETIVE suggestions (reviewed, NEVER auto-written to source) —
⑤ validation→send_validation · ⑥ data→prefill · ⑦ action→send/lifecycle · ⑧ screen→tab · ⑨ trigger→entry-point ·
⑩ flow-order→journey sequence · ⑪ "add X"→new compose field · ⑫ unresolved→disambiguation candidates. Emitted to
FLOW_INTENT.md as paste-ready blocks; a human/LLM applies them to source after review.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "source-of-truth" / "v2_supplement" / "annotated_flows.json"
JOURNEYS = ROOT / "spec" / "staff_journeys.json"
OUT = ROOT / "spec" / "derived" / "annotations.json"
REPORT = ROOT / "reports" / "FLOW_INTENT.md"

LIFECYCLE_VERBS = ("approve", "reject", "publish", "cancel", "pause", "resume", "retire", "verify", "issue",
                   "void", "resolve", "escalate", "reopen", "accept", "supersede", "lock", "release", "schedule")
STATUSES = ("draft", "scheduled", "sending", "sent", "paused", "cancelled", "active", "archived", "published")


def _slug(s):
    return re.sub(r"[^a-z0-9]+", "_", (s or "").lower()).strip("_")[:40] or "item"


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
            if idv == "b_to":
                return {"kind": "field", "to": "to"}
    m = re.search(r'[“”"]([^“”"]+)[“”"]', sel)
    if m:
        lbl = m.group(1).strip().lower()
        for a in send:
            al = (a.get("label") or "").lower()
            if al and (al == lbl or lbl in al or al in lbl):
                return {"kind": "action", "to": a.get("key")}
    return {"kind": None, "to": None}


# --- interpretive suggesters (reviewed; never auto-written to source) ---
def s_validation(note, bind):                                          # ⑤
    low = (note or "").lower()
    if any(w in low for w in ("attach", "body", "content", "html")):
        return {"check": "body_or_attachment", "message": note or "Add an email body, or attach a file"}
    if (bind.get("kind") == "field" and bind.get("to") == "to") or any(w in low for w in ("recipient", "email id", "address")):
        return {"check": "recipients", "message": note or "Add at least one recipient"}
    if bind.get("kind") == "field":
        return {"check": "field", "field": bind["to"], "message": note or f"{bind['to']} is required"}
    return {"check": "REVIEW — selector did not resolve to a field", "message": note}


def s_prefill(note, bind):                                             # ⑥
    if bind.get("kind") != "field" or bind.get("to") in (None, "to"):
        return None
    low = (note or "").lower()
    if not any(w in low for w in ("prefill", "pre-fill", "auto", "fill", "populate", "from the selection", "from selection", "from selected")):
        return None
    src = ("coordinator_email" if "email" in low else "name" if "name" in low else
           "city" if "city" in low else "state" if "state" in low else "REVIEW — name the source field")
    return {"for_field": bind["to"], "prefill": src}


def s_action(note, bind):                                             # ⑦
    if bind.get("kind") == "action":
        return None                                                    # already an existing action (③)
    low = (note or "").lower()
    as_ = "lifecycle_transition" if any(v in low for v in LIFECYCLE_VERBS) else "send_action"
    return {"as": as_, "key": _slug(note), "label": (note or "Action").strip()[:40]}


def s_tab(note):                                                      # ⑧
    low = (note or "").lower()
    st = next((s for s in STATUSES if s in low), None)
    return {"label": (note or "Tab").strip()[:30], "status": ([st] if st else [])}


def s_entry(note, screen):                                            # ⑨
    return {"label": (note or "Open").strip()[:40], "as": "bulk_action|nav", "to": screen}


def s_field(note, bind, compose_fields):                              # ⑪
    if bind.get("kind"):
        return None
    low = (note or "").lower()
    if not any(w in low for w in ("add ", "new ", "capture", "another", "cc", "bcc", "include", "field")):
        return None
    fld = _slug(note)
    if fld in compose_fields:
        return None
    return {"kind": ("emails" if "email" in low else "text"), "field": fld,
            "label": (note or "Field").strip()[:30], "_first": "add this field to the entity in the BRD (WHAT) before compose"}


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

    # collect interpretive suggestions ⑤–⑫
    sug = {k: {} for k in ("validation", "prefill", "action", "tab", "entry", "field", "disambig")}
    for sid, notes in by_screen.items():
        cfields = [p["field"] for p in journeys.get(sid, {}).get("compose", []) if p.get("field")]
        for n in notes:
            t, b, note = (n["type"] or ""), n["bind"], n["note"]
            if t == "validation":
                sug["validation"].setdefault(sid, []).append(s_validation(note, b))
            if t == "data":
                for key, val in (("prefill", s_prefill(note, b)), ("field", s_field(note, b, cfields))):
                    if val:
                        sug[key].setdefault(sid, []).append(val)
            if t == "action" and s_action(note, b):
                sug["action"].setdefault(sid, []).append(s_action(note, b))
            if t == "screen":
                sug["tab"].setdefault(sid, []).append(s_tab(note))
            if t == "trigger":
                sug["entry"].setdefault(sid, []).append(s_entry(note, "/staff/" + sid + ".html"))
            if not b.get("kind") and n["selector"]:
                sug["disambig"].setdefault(sid, []).append({"note": note, "selector": n["selector"], "candidate_fields": cfields})
    # ⑩ ordered distinct screens per flow
    seq = {}
    for fname, flow in flows.items():
        order, seen = [], set()
        for s in flow.get("steps", []):
            sid = (s.get("screen") or "").rsplit("/", 1)[-1].replace(".html", "")
            if sid and sid not in seen:
                order.append(sid)
                seen.add(sid)
        seq[fname] = order

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(by_screen, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    L = ["# Flow intent — projected from annotated_flows.json", "",
         "_Selectors auto-resolve to compose fields/actions where unambiguous (②③④, derived). Everything under "
         "**Suggested spec changes** is INTERPRETIVE — reviewed, never auto-written. Apply to source, then regenerate._", ""]
    if not flows:
        L.append("_No annotated flows captured yet. Use **Send to source** on /annotate._")
    for fname, flow in flows.items():
        steps = flow.get("steps", [])
        L.append(f"## Flow: {fname}  ({len(steps)} steps)")
        last = None
        for s in steps:
            if s.get("screen") != last:
                L.append(f"\n**{s.get('screen','')}**\n")
                last = s.get("screen")
            sid = (s.get("screen") or "").rsplit("/", 1)[-1].replace(".html", "")
            jc = journeys.get(sid, {"compose": [], "send": []})
            b = resolve_selector(s.get("selector", ""), jc["compose"], jc["send"])
            tag = (f"binds → {b['kind']} `{b['to']}`" if b["kind"] else "**unresolved**")
            sel = f" _(`{s.get('selector')}`)_" if s.get("selector") else ""
            L.append(f"- ({s.get('type','')}) {s.get('note') or '(no note)'} — {tag}{sel}")
        L.append("")

    def block(num_title, sub, data):
        if not any(any(x for x in v) for v in data.values()):
            return
        L.append(f"### {num_title}")
        L.append("")
        L.append(f"_{sub}_")
        L.append("")
        for sid, items in data.items():
            items = [x for x in items if x]
            if not items:
                continue
            L.append(f"**{sid}**:")
            L.append("```json")
            L.append(json.dumps(items, indent=2, ensure_ascii=False))
            L.append("```")
            L.append("")

    if any(sug.values()) or any(len(v) > 1 for v in seq.values()):
        L.append("## Suggested spec changes — review → apply to source, then regenerate")
        L.append("")
        block("⑤ `send_validation` (journey key)", "From type=validation. Paste into the journey's `send_validation`.", sug["validation"])
        block("⑥ compose `prefill` (per field)", "From type=data prefill notes. Set `prefill` on the named compose field.", sug["prefill"])
        block("⑦ `send` action / lifecycle transition", "From type=action not matching an existing action. Add to `send[]` or wire the lifecycle transition.", sug["action"])
        block("⑧ `tabs` (journey key)", "From type=screen. Add to the journey's `tabs[]`.", sug["tab"])
        block("⑨ entry point (bulk_action / nav)", "From type=trigger. Wire as a `bulk_action` or nav entry to the screen.", sug["entry"])
        block("⑪ new compose field", "From an 'add X' note that binds to nothing. Add the field to the entity in the BRD (WHAT) FIRST, then to compose.", sug["field"])
        block("⑫ unresolved — disambiguation", "Selector didn't resolve. Pick the intended field from the candidates.", sug["disambig"])
        if any(len(v) > 1 for v in seq.values()):
            L.append("### ⑩ journey sequence (screen order)")
            L.append("")
            for fname, scr in seq.items():
                if len(scr) > 1:
                    L.append(f"- **{fname}**: {' → '.join(scr)}")
            L.append("")

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text("\n".join(L) + "\n", encoding="utf-8")

    nsug = sum(len([x for x in v if x]) for d in sug.values() for v in d.values())
    print(f"derive_annotations: {len(flows)} flow(s), {resolved} bound + {unresolved} unresolved, {nsug} suggestion(s) across {len(by_screen)} screen(s)")


if __name__ == "__main__":
    main()
