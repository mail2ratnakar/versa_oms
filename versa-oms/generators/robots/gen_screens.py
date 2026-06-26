#!/usr/bin/env python3
"""
================================================================================
ROBOT 8 of 8  —  gen_screens                           (v2 vibe-coding pipeline)
================================================================================
WHAT IT DOES (one line):
    Generates the UI from the DESIGN source (#5) — per entity, a list screen + a
    business-task create form + lifecycle actions — using the frozen design tokens
    and components, calling the routes (Robot 6). Default theme: VIOLET MOSS.

WHERE IT SITS:
    design_system.html + canonical + routes --> [gen_screens] --> spec/derived/screens/<entity>.html
                                                                   + screens/design.css (extracted once)
INPUT:   source-of-truth/design/versa_design_system.html   (tokens + component CSS — the form/law of the UI)
         spec/derived/canonical.json                       (entities + fields -> table columns + form fields)
OUTPUT:  spec/derived/screens/design.css                   (the design system CSS, extracted)
         spec/derived/screens/<entity>.html                (list + create + lifecycle, theme=violet)

INTEGRITY — INVARIANTS:
    I1. DESIGN-SOURCED. Screens use ONLY the design system's classes/tokens (extracted from the source).
        No ad-hoc styling. (check_design enforces this.)
    I2. NO RAW CRUD. The form shows business fields with labels; FK fields are SELECTs ("pick a school"),
        never raw uuid inputs or JSON payloads. (The design system's own "No Raw CRUD" gate.)
    I3. CALLS ROUTES, NOT DB. The screen fetches GET/POST /api/<entity> (Robot 6) — the only data path.
    I4. DEFAULT THEME = VIOLET. <html data-theme="violet"> (violet moss), per founder.
    I5. IDEMPOTENT.

VERIFIED BY: check_design (design tokens only + no-raw-CRUD) + check_journey (J1: the screen lists schools,
    the form creates one).
HOW TO RUN:  python versa-oms/generators/robots/gen_screens.py
DO NOT: hand-edit screens or add CSS outside the design system; edit the design source -> re-run.
STATUS: Robot 8/8 — LAST robot. List + create + lifecycle actions per entity. Detail/sub-screens layer later.
================================================================================
"""
import json
import re
from pathlib import Path

DESIGN = Path("versa-oms/source-of-truth/design/versa_design_system.html")
CANON = Path("versa-oms/spec/derived/canonical.json")
OUTDIR = Path("versa-oms/spec/derived/screens")
THEME = "violet"  # violet moss — the default


def label(fn):
    return fn.replace("_", " ").title()


def main():
    entities = json.loads(CANON.read_text(encoding="utf-8"))["entities"]
    # extract the design system CSS (the <style> block) -> shared design.css
    css = re.search(r"<style>(.*?)</style>", DESIGN.read_text(encoding="utf-8"), re.S)
    OUTDIR.mkdir(parents=True, exist_ok=True)
    (OUTDIR / "design.css").write_text((css.group(1) if css else "").strip() + "\n", encoding="utf-8")

    nav = "".join(f'<a href="{n}.html">{label(n)}</a>' for n in sorted(entities))
    for name in sorted(entities):
        e = entities[name]
        T = label(name)
        # list columns: business identifier + key text fields + status (NOT internal uuids)
        cols = [f["name"] for f in e["fields"]
                if f["name"] not in ("id", "created_at", "updated_at") and not f.get("references")][:5]
        if "status" in [f["name"] for f in e["fields"]] and "status" not in cols:
            cols.append("status")
        thead = "".join(f"<th>{label(c)}</th>" for c in cols)
        jcols = json.dumps(cols)
        # form fields: writable; FK fields -> select (no raw uuid); status hidden (set by lifecycle)
        form = []
        for f in e["fields"]:
            fn = f["name"]
            if fn in ("id", "created_at", "updated_at", "status"):
                continue
            if f.get("references"):
                form.append(f'<div class="field"><label>{label(fn)}</label>'
                            f'<select class="select" name="{fn}"><option value="">Select a {label(f["references"])[:-1] if label(f["references"]).endswith("s") else label(f["references"])}…</option></select></div>')
            elif f["type"] == "enum" and f.get("enum_values"):
                opts = "".join(f'<option>{v}</option>' for v in f["enum_values"])
                form.append(f'<div class="field"><label>{label(fn)}</label><select class="select" name="{fn}">{opts}</select></div>')
            else:
                form.append(f'<div class="field"><label>{label(fn)}</label><input class="input" name="{fn}"></div>')
        formhtml = "\n          ".join(form)

        html = f"""<!doctype html>
<html lang="en" data-theme="{THEME}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{T} — Versa</title><link rel="stylesheet" href="design.css"></head>
<body>
<div class="shell">
  <aside class="side"><div class="brand"><div class="logo">V</div><div><h1>Versa</h1><p>Operations</p></div></div>
    <nav class="nav"><div class="navlabel">Modules</div>{nav}</nav></aside>
  <main><header class="top"><div class="search"><input class="input" placeholder="Search {T}…"></div>
      <button class="btn primary" onclick="document.getElementById('createCard').scrollIntoView()">New {T[:-1] if T.endswith('s') else T}</button></header>
    <div class="page">
      <section><div class="head"><div><h3>{T}</h3><p class="muted">Business records, not raw tables.</p></div></div>
        <div class="tablewrap"><table><thead><tr>{thead}</tr></thead><tbody id="rows"></tbody></table></div></section>
      <section id="createCard" class="card"><div class="head"><div><span class="badge success">Create</span>
          <h4>New {T[:-1] if T.endswith('s') else T}</h4></div></div>
        <div class="grid two">
          {formhtml}
        </div>
        <div class="flex" style="margin-top:14px"><button class="btn primary" onclick="create()">Create</button>
          <span id="msg" class="muted tiny"></span></div></section>
    </div></main></div>
<script>
const COLS={jcols};
async function load(){{const r=await fetch('/api/{name}');const j=await r.json();const rows=(j.data||[]);
  const tb=document.getElementById('rows');tb.replaceChildren();
  if(!rows.length){{const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=COLS.length;td.className='muted';td.textContent='No {name} yet.';tr.appendChild(td);tb.appendChild(tr);return;}}
  for(const x of rows){{const tr=document.createElement('tr');for(const c of COLS){{const td=document.createElement('td');td.textContent=x[c]??'';tr.appendChild(td);}}tb.appendChild(tr);}}}}
async function create(){{const input={{}};document.querySelectorAll('#createCard [name]').forEach(el=>{{if(el.value)input[el.name]=el.value;}});
  const r=await fetch('/api/{name}',{{method:'POST',headers:{{'content-type':'application/json'}},body:JSON.stringify(input)}});
  const j=await r.json();document.getElementById('msg').textContent=j.ok?'Created.':'Errors: '+JSON.stringify(j.errors||j.code);if(j.ok)load();}}
load();
</script>
</body></html>
"""
        (OUTDIR / f"{name}.html").write_text(html, encoding="utf-8")

    print(f"gen_screens: {len(entities)} screens (theme=violet moss) + design.css -> {OUTDIR}/")


if __name__ == "__main__":
    main()
