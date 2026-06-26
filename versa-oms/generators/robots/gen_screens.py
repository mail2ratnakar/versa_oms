#!/usr/bin/env python3
"""
================================================================================
ROBOT 8 of 8  —  gen_screens                           (v2 vibe-coding pipeline)
================================================================================
WHAT IT DOES: Generates the UI from the DESIGN source (#5). Per entity, a COMPLETE
screen: icon-rail nav + searchable header + list table + STATUS-AWARE LIFECYCLE
ACTION BUTTONS + a scrollable CREATE MODAL (business-task form). Theme: VIOLET MOSS.

RULES (enforced by check_design — no half-baked screens):
  R1 COMPLETE: list + create + EVERY lifecycle action button (from the catalog).
  R2 MODAL CREATE: "New X" opens a scrollable modal (.modalbg), not an inline dump.
  R3 ICONS WIRED: the design's SVG icon set is embedded + used (nav/search/buttons).
  R4 DESIGN-SOURCED: tokens/components/icons all extracted from the design source.
  R5 NO-RAW-CRUD: labeled fields, FK=select. R6 SAFE DOM: textContent, never innerHTML+data.

INPUT:  spec/derived/canonical.json + rule_catalog.json + the design source
OUTPUT: spec/derived/screens/<entity>.html + screens/design.css
VERIFIED BY: check_design (violet · no-raw-CRUD · lifecycle-actions · modal · icons) + check_security.
RUN: python versa-oms/generators/robots/gen_screens.py
================================================================================
"""
import json
import re
from pathlib import Path

DESIGN = Path("versa-oms/source-of-truth/design/versa_design_system.html")
CANON = Path("versa-oms/spec/derived/canonical.json")
CATALOG = Path("versa-oms/spec/derived/rule_catalog.json")
OUTDIR = Path("versa-oms/spec/derived/screens")
THEME = "violet"

# module -> design icon (all from the design source's symbol set; falls back to grid)
ICON = {"schools": "globe", "students": "users", "users": "user", "participations": "route",
        "results": "chart", "certificates": "file", "payments": "key", "exam_slots": "calendar",
        "exam_materials": "upload", "omr_imports": "upload", "courier_batches": "arrow",
        "audit_events": "shield", "school_users": "users", "olympiads": "zap"}


def label(fn):
    return fn.replace("_", " ").title()


def icon(name, w=18):
    return f'<svg width="{w}" height="{w}" style="vertical-align:middle"><use href="#{name}"></use></svg>'


def entity_for_workflow(wf, entities):
    wfl = wf.lower()
    for e in sorted(entities, key=len, reverse=True):
        if e.rstrip("s") in wfl:
            return e
    return None


def main():
    entities = json.loads(CANON.read_text(encoding="utf-8"))["entities"]
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    ent_trans = {n: [] for n in entities}
    for t in catalog["rules"]["lifecycle"]:
        e = entity_for_workflow(t["workflow"], entities)
        if e:
            ent_trans[e].append({"action": t["action"], "from": t["from"], "to": t["to"]})

    src = DESIGN.read_text(encoding="utf-8")
    css = re.search(r"<style>(.*?)</style>", src, re.S)
    symbols = re.search(r'<svg width="0" height="0".*?</svg>', src, re.S)  # the icon definitions
    SYMBOLS = symbols.group(0) if symbols else ""
    OUTDIR.mkdir(parents=True, exist_ok=True)
    (OUTDIR / "design.css").write_text((css.group(1) if css else "").strip() + "\n", encoding="utf-8")
    nav = "".join(f'<a href="{n}.html">{icon(ICON.get(n, "grid"))} <span>{label(n)}</span></a>' for n in sorted(entities))

    for name in sorted(entities):
        e = entities[name]
        T = label(name)
        single = T[:-1] if T.endswith("s") else T
        cols = [f["name"] for f in e["fields"]
                if f["name"] not in ("id", "created_at", "updated_at") and not f.get("references")][:5]
        if "status" in [f["name"] for f in e["fields"]] and "status" not in cols:
            cols.append("status")
        thead = "".join(f"<th>{label(c)}</th>" for c in cols) + "<th>Actions</th>"
        jcols, jtrans = json.dumps(cols), json.dumps(ent_trans[name])
        form = []
        for f in e["fields"]:
            fn = f["name"]
            if fn in ("id", "created_at", "updated_at", "status"):
                continue
            if f.get("references"):
                form.append(f'<div class="field"><label>{label(fn)}</label><select class="select" name="{fn}"><option value="">Select a {label(f["references"])[:-1]}…</option></select></div>')
            elif f["type"] == "enum" and f.get("enum_values"):
                form.append(f'<div class="field"><label>{label(fn)}</label><select class="select" name="{fn}">' + "".join(f"<option>{v}</option>" for v in f["enum_values"]) + "</select></div>")
            else:
                form.append(f'<div class="field"><label>{label(fn)}</label><input class="input" name="{fn}"></div>')
        formhtml = "\n            ".join(form)

        html = f"""<!doctype html>
<html lang="en" data-theme="{THEME}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{T} — Versa</title><link rel="stylesheet" href="design.css"></head>
<body>
{SYMBOLS}
<div class="shell">
  <aside class="side" style="overflow:auto"><div class="brand"><div class="logo">V</div><div><h1>Versa</h1><p>Operations</p></div></div>
    <nav class="nav"><div class="navlabel">Modules</div>{nav}</nav></aside>
  <main><header class="top"><div class="search">{icon('search', 16)} <input class="input" placeholder="Search {T}…"></div>
      <button class="btn primary" onclick="openModal()">{icon('spark', 16)} New {single}</button></header>
    <div class="page">
      <section><div class="head"><div><h3>{T}</h3><p class="muted">Business records + lifecycle actions.</p></div>
          <button class="btn secondary" onclick="openModal()">{icon('spark', 16)} New {single}</button></div>
        <div class="tablewrap"><table><thead><tr>{thead}</tr></thead><tbody id="rows"></tbody></table></div></section>
    </div></main></div>
<div id="createModal" class="modalbg" onclick="if(event.target===this)closeModal()">
  <div class="modal" style="max-height:85vh;overflow:auto">
    <div class="between"><div class="flex" style="gap:10px;align-items:center"><span class="badge success">Create</span><h3 style="margin:0">New {single}</h3></div>
      <button class="btn ghost iconbtn" onclick="closeModal()">{icon('x', 16)}</button></div>
    <div class="grid two" style="margin-top:14px">
            {formhtml}
    </div>
    <div class="flex" style="margin-top:18px;gap:10px"><button class="btn primary" onclick="create()">{icon('check', 16)} Create</button>
      <button class="btn ghost" onclick="closeModal()">Cancel</button><span id="msg" class="muted tiny"></span></div>
  </div></div>
<script>
const COLS={jcols};
const TRANSITIONS={jtrans};
function openModal(){{document.getElementById('createModal').classList.add('open');}}
function closeModal(){{document.getElementById('createModal').classList.remove('open');}}
async function load(){{const r=await fetch('/api/{name}');const j=await r.json();const rows=(j.data||[]);
  const tb=document.getElementById('rows');tb.replaceChildren();
  if(!rows.length){{const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=COLS.length+1;td.className='muted';td.textContent='No {name} yet.';tr.appendChild(td);tb.appendChild(tr);return;}}
  for(const x of rows){{const tr=document.createElement('tr');
    for(const c of COLS){{const td=document.createElement('td');td.textContent=x[c]??'';tr.appendChild(td);}}
    const ac=document.createElement('td');
    for(const t of TRANSITIONS){{if(t.from===x.status||t.from==='any'){{const b=document.createElement('button');b.className='btn secondary tiny';b.style.marginRight='6px';b.textContent=t.action.replace(/_/g,' ');b.addEventListener('click',()=>act(x.id,t.action));ac.appendChild(b);}}}}
    tr.appendChild(ac);tb.appendChild(tr);}}}}
async function act(id,action){{const r=await fetch('/api/{name}/'+id+'/'+action,{{method:'POST'}});const j=await r.json();const m=document.getElementById('msg');if(m)m.textContent=j.ok?(action.replace(/_/g,' ')+' done'):(action.replace(/_/g,' ')+' blocked: '+(j.code||''));load();}}
async function create(){{const input={{}};document.querySelectorAll('#createModal [name]').forEach(el=>{{if(el.value)input[el.name]=el.value;}});
  const r=await fetch('/api/{name}',{{method:'POST',headers:{{'content-type':'application/json'}},body:JSON.stringify(input)}});
  const j=await r.json();document.getElementById('msg').textContent=j.ok?'Created.':'Errors: '+JSON.stringify(j.errors||j.code);if(j.ok){{closeModal();load();}}}}
load();
</script>
</body></html>
"""
        (OUTDIR / f"{name}.html").write_text(html, encoding="utf-8")

    nlife = sum(1 for n in entities if ent_trans[n])
    print(f"gen_screens: {len(entities)} COMPLETE screens (icons + modal-create + lifecycle actions) · {nlife} with actions · violet -> {OUTDIR}/")


if __name__ == "__main__":
    main()
