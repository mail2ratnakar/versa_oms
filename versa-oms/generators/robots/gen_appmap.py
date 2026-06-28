#!/usr/bin/env python3
"""DEV TOOL (independent — NOT a gated robot, NOT in the pipeline) — generates spec/derived/appmap.html, served at
/appmap. A storyboard of the REAL app: every generated screen shown as a LIVE scaled-down preview (an iframe of the
actual page), grouped by journey/portal in flow order, click to open full. So you can SEE the actual pages and how
they connect — the flow superimposed on the real screens. Reads the journey specs only (read-only, no coupling)."""
import json
from pathlib import Path

OUT = Path("versa-oms/spec/derived/appmap.html")
PORTALS = [("Operations (staff)", "versa-oms/spec/staff_journeys.json", "/staff/"),
           ("School portal", "versa-oms/spec/school_journeys.json", "/portal/")]


def cards():
    out = []
    for portal_name, spec, base in PORTALS:
        try:
            journeys = json.loads(Path(spec).read_text(encoding="utf-8")).get("journeys", [])
        except Exception:
            journeys = []
        rows, last_group = [], object()
        for j in journeys:
            g = j.get("group") or "—"
            if g != last_group:
                rows.append(f'<div class="grp">{g}</div>')
                last_group = g
            url = base + j["id"] + ".html"
            shape = j.get("shape", "")
            rows.append(
                f'<a class="card" href="{url}" target="_blank" title="Open {j["id"]} in a new tab">'
                f'<div class="thumbwrap"><iframe class="thumb" src="{url}" loading="lazy" scrolling="no" tabindex="-1"></iframe><span class="open">open &nearr;</span></div>'
                f'<div class="cap"><b>{j["id"]}</b> · {j.get("title", "")}<span class="shape">{shape}</span></div></a>')
        out.append(f'<section><h2>{portal_name}</h2><div class="grid">{"".join(rows)}</div></section>')
    return "".join(out)


HTML = """<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Versa App Map</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,sans-serif;color:#2a2342;background:#faf8ff}
.top{position:sticky;top:0;z-index:5;background:#fff;border-bottom:1px solid #e6e0f5;padding:13px 22px}
.top h1{font-size:17px;margin:0}.top p{margin:3px 0 0;color:#8a82a8;font-size:12.5px}
section{padding:8px 22px 22px}h2{font-size:14px;margin:18px 0 6px;color:#3a3357}
.grp{flex-basis:100%;font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:#9a92b5;font-weight:800;margin:14px 0 2px}
.grid{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start}
.card{width:316px;text-decoration:none;color:inherit;border:1px solid #e6e0f5;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 4px 14px rgba(40,30,70,.06);transition:.15s}
.card:hover{border-color:#7c5cfc;box-shadow:0 8px 26px rgba(80,50,160,.16);transform:translateY(-2px)}
.thumbwrap{position:relative;width:316px;height:210px;overflow:hidden;background:#f3f0fb;border-bottom:1px solid #eee}
.thumb{width:1264px;height:840px;border:0;transform:scale(.25);transform-origin:top left;pointer-events:none;background:#fff}
.open{position:absolute;top:8px;right:8px;background:#7c5cfc;color:#fff;font-size:11px;font-weight:700;padding:3px 8px;border-radius:7px;opacity:0;transition:.15s}
.card:hover .open{opacity:1}
.cap{padding:9px 12px;font-size:12.5px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}.cap b{color:#7c5cfc}
.shape{margin-left:auto;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:#9a92b5;background:#f2eefb;border-radius:6px;padding:2px 7px}
</style></head><body>
<div class="top"><h1>App Map — the real screens</h1><p>Every generated page as a live preview, in journey order. Click a card to open the actual page. This is what the spec builds.</p></div>
__CARDS__
</body></html>"""

OUT.write_text(HTML.replace("__CARDS__", cards()), encoding="utf-8")
print(f"appmap -> {OUT}")
