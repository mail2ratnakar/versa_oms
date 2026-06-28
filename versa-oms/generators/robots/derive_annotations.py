#!/usr/bin/env python3
"""derive_annotations — PROJECT the founder's annotated flows (source) downstream.

Reads  source-of-truth/v2_supplement/annotated_flows.json   (folded in from /annotate, CLAUDE.md #8/#9)
Writes spec/derived/annotations.json                         (per-screen notes — consumed by gen_portal)
       reports/FLOW_INTENT.md                                (human-readable; the reviewable spec to implement from)

Deterministic only: it groups each flow's steps by screen and resolves the drawn element selector. The interpretive
leap (a note -> a new compose field / tab / rule) stays a reviewed step — but the INTENT now lives in source, not chat.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "source-of-truth" / "v2_supplement" / "annotated_flows.json"
OUT = ROOT / "spec" / "derived" / "annotations.json"
REPORT = ROOT / "reports" / "FLOW_INTENT.md"


def main():
    flows = json.loads(SRC.read_text(encoding="utf-8")).get("flows", {}) if SRC.exists() else {}

    by_screen = {}          # screen-url -> [ {n,type,note,selector,flow} ]
    for fname, flow in flows.items():
        for s in flow.get("steps", []):
            sid = (s.get("screen") or "").rsplit("/", 1)[-1].replace(".html", "")
            if not sid:
                continue
            by_screen.setdefault(sid, []).append({
                "n": s.get("n"), "type": s.get("type"), "note": s.get("note", ""),
                "selector": s.get("selector", ""), "flow": fname,
            })
    for url in by_screen:
        by_screen[url].sort(key=lambda a: (a["flow"], a["n"] or 0))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(by_screen, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    lines = ["# Flow intent — projected from annotated_flows.json", "",
             "_Source: `source-of-truth/v2_supplement/annotated_flows.json` (the founder's /annotate output). "
             "This is the reviewable spec — implement compose/tabs/rules from it; the intent is in source, not chat._", ""]
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
            sel = f" — `{s.get('selector')}`" if s.get("selector") else ""
            lines.append(f"- ({s.get('type','')}) {s.get('note') or '(no note)'}{sel}")
        lines.append("")
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"derive_annotations: {len(flows)} flow(s), {sum(len(v) for v in by_screen.values())} note(s) across {len(by_screen)} screen(s) -> {OUT.name}, {REPORT.name}")


if __name__ == "__main__":
    main()
