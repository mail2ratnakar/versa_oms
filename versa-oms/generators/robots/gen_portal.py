#!/usr/bin/env python3
"""
================================================================================
ROBOT —  gen_portal   (SCHOOL PORTAL, Phase 1)         (v2 vibe-coding pipeline)
================================================================================
WHAT IT DOES: Generates the SCHOOL PORTAL from the FROZEN SJ series. Per journey
(SJ1..SJ12), a JOURNEY-SHAPED, school-SCOPED screen (not entity CRUD) on the violet
design system, wired to the existing generated API.

INPUT:  spec/school_journeys.json (frozen from BRD §06/§11/§03) + canonical + design source
OUTPUT: spec/derived/portal/<SJ>.html + index.html + design.css

RULES (check_portal enforces): every frozen SJ has a screen · violet design system · school nav (by SJ, not
entity) · scope=school screens filter to the selected school_id · safe DOM (textContent). Login + real
own_school_only scoping wire at the AUTH phase (auth-last); here a school is PICKED (acting-as) so it is browsable.
RUN: python versa-oms/generators/robots/gen_portal.py
================================================================================
"""
import json
import re
from pathlib import Path

SJ = Path("versa-oms/spec/school_journeys.json")
CANON = Path("versa-oms/spec/derived/canonical.json")
DESIGN = Path("versa-oms/source-of-truth/design/versa_design_system.html")
OUT = Path("versa-oms/spec/derived/portal")


def label(fn):
    return fn.replace("_", " ").title()


def icon(n, w=18):
    return f'<svg width="{w}" height="{w}" style="vertical-align:middle"><use href="#{n}"></use></svg>'


def form_fields(entity, ents, hide):
    out = []
    for f in ents[entity]["fields"]:
        fn = f["name"]
        if fn in ("id", "created_at", "updated_at", "status") or fn in hide:
            continue
        if f.get("references"):
            out.append(f'<div class="field"><label>{label(fn)}</label><select class="select" name="{fn}" id="fk_{fn}"><option value="">Select…</option></select></div>')
        elif f["type"] == "enum" and f.get("enum_values"):
            out.append(f'<div class="field"><label>{label(fn)}</label><select class="select" name="{fn}">' + "".join(f"<option>{v}</option>" for v in f["enum_values"]) + "</select></div>")
        else:
            out.append(f'<div class="field"><label>{label(fn)}</label><input class="input" name="{fn}"></div>')
    return "\n            ".join(out)


def fk_map(entity, ents):
    return {f["name"]: f["references"] for f in ents[entity]["fields"] if f.get("references") and f["name"] != "school_id"}


def build_body(j, ents):
    sid, title, shape, entity, scope = j["id"], j["title"], j["shape"], j["entity"], j["scope"]
    if shape == "register":
        fields = form_fields(entity, ents, hide=[])
        body = (f'<section class="card"><div class="head"><div><span class="badge success">Step 1</span>'
                f'<h4>School details</h4></div></div><div class="grid two">{fields}</div>'
                f'<div class="flex" style="margin-top:16px"><button class="btn primary" onclick="register()">{icon("check",16)} Register</button>'
                f'<span id="msg" class="muted tiny"></span></div></section>')
        script = ("async function register(){const input={};document.querySelectorAll('.card [name]').forEach(el=>{if(el.value)input[el.name]=el.value;});"
                  "input.status='lead';const r=await fetch('/api/schools',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)});"
                  "const j=await r.json();document.getElementById('msg').textContent=j.ok?('Registered — '+j.data.name+' is now pending approval.'):('Errors: '+JSON.stringify(j.errors||j.code));}")
        return body, script
    if shape == "verify":
        body = ('<section class="card" style="max-width:560px"><div class="field"><label>Verification code</label>'
                '<input class="input" id="vcode" placeholder="VERIFY-..."></div>'
                '<div class="flex" style="margin-top:12px"><button class="btn primary" onclick="verify()">Verify</button></div>'
                '<div id="vresult" style="margin-top:16px"></div></section>')
        script = ("async function verify(){const code=document.getElementById('vcode').value.trim();const r=await fetch('/api/certificates');const j=await r.json();"
                  "const c=(j.data||[]).find(x=>x.verification_code===code);const el=document.getElementById('vresult');el.replaceChildren();const b=document.createElement('div');"
                  "if(c&&c.status==='issued'){b.className='badge success';b.textContent='VALID — certificate '+c.certificate_number;}"
                  "else if(c&&c.status==='revoked'){b.className='badge bad';b.textContent='REVOKED certificate';}"
                  "else{b.className='badge bad';b.textContent='INVALID — no certificate with that code';}el.appendChild(b);}")
        return body, script
    # list / manage share a scoped table
    cols = j.get("cols", ["status"])
    download = j.get("download", False)
    acts = j.get("actions", [])
    scoped = "true" if scope == "school" else "false"
    thead = "".join(f"<th>{label(c)}</th>" for c in cols) + ("<th>File</th>" if download else "") + ("<th>Actions</th>" if shape == "manage" else "")
    span = len(cols) + (1 if download else 0) + (1 if shape == "manage" else 0)
    new_btn = f'<button class="btn secondary" onclick="openModal()">{icon("spark",16)} New</button>' if shape == "manage" else ""
    modal = ""
    if shape == "manage":
        fields = form_fields(entity, ents, hide=["school_id"])
        modal = (f'<div id="m" class="modalbg" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-height:85vh;overflow:auto">'
                 f'<div class="between"><h3 style="margin:0">New {label(entity)[:-1] if label(entity).endswith("s") else label(entity)}</h3>'
                 f'<button class="btn ghost iconbtn" onclick="closeModal()">{icon("x",16)}</button></div>'
                 f'<div class="grid two" style="margin-top:14px">{fields}</div>'
                 f'<div class="flex" style="margin-top:16px"><button class="btn primary" onclick="create()">{icon("check",16)} Save</button>'
                 f'<span id="msg" class="muted tiny"></span></div></div></div>')
    body = (f'<section><div class="head"><div><h3>{label(entity)}</h3></div>{new_btn}</div>'
            f'<div class="tablewrap"><table><thead><tr>{thead}</tr></thead><tbody id="rows"></tbody></table></div></section>{modal}')
    script = f"""const COLS={json.dumps(cols)};const ACTS={json.dumps(acts)};const SCOPED={scoped};const FK={json.dumps(fk_map(entity, ents))};const DOWNLOAD={str(download).lower()};
async function load(){{const r=await fetch('/api/{entity}');const j=await r.json();const rows=(j.data||[]).filter(x=>!SCOPED||x.school_id===schoolId());
  const tb=document.getElementById('rows');tb.replaceChildren();
  if(!rows.length){{const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan={span};td.className='muted';td.textContent='Nothing here yet.';tr.appendChild(td);tb.appendChild(tr);return;}}
  for(const x of rows){{const tr=document.createElement('tr');
    for(const c of COLS){{const td=document.createElement('td');td.textContent=x[c]??'';tr.appendChild(td);}}
    if(DOWNLOAD){{const td=document.createElement('td');const b=document.createElement('button');b.className='btn secondary tiny';b.textContent='Download';b.addEventListener('click',()=>alert('Signed download (wired at file phase)'));td.appendChild(b);tr.appendChild(td);}}
    if(ACTS.length){{const td=document.createElement('td');for(const a of ACTS){{const b=document.createElement('button');b.className='btn secondary tiny';b.style.marginRight='6px';b.textContent=a.replace(/_/g,' ');b.addEventListener('click',()=>act(x.id,a));td.appendChild(b);}}tr.appendChild(td);}}
    tb.appendChild(tr);}}}}
async function act(id,a){{const r=await fetch('/api/{entity}/'+id+'/'+a,{{method:'POST'}});const j=await r.json();const m=document.getElementById('msg');if(m)m.textContent=j.ok?(a.replace(/_/g,' ')+' done'):(a.replace(/_/g,' ')+' blocked: '+(j.code||''));load();}}
function openModal(){{document.getElementById('m').classList.add('open');populateFk();}}
function closeModal(){{const m=document.getElementById('m');if(m)m.classList.remove('open');}}
async function populateFk(){{for(const f in FK){{const sel=document.getElementById('fk_'+f);if(!sel)continue;const r=await fetch('/api/'+FK[f]);const j=await r.json();
  const opts=(j.data||[]).filter(x=>!x.school_id||x.school_id===schoolId());sel.replaceChildren();const o0=document.createElement('option');o0.value='';o0.textContent='Select…';sel.appendChild(o0);
  for(const x of opts){{const o=document.createElement('option');o.value=x.id;o.textContent=(x.participation_code||x.olympiad_code||x.result_code||x.candidate_id||x.id);sel.appendChild(o);}}}}}}
async function create(){{const input={{}};document.querySelectorAll('#m [name]').forEach(el=>{{if(el.value)input[el.name]=el.value;}});if(SCOPED)input.school_id=schoolId();
  const r=await fetch('/api/{entity}',{{method:'POST',headers:{{'content-type':'application/json'}},body:JSON.stringify(input)}});const j=await r.json();
  document.getElementById('msg').textContent=j.ok?'Saved.':('Errors: '+JSON.stringify(j.errors||j.code));if(j.ok){{closeModal();load();}}}}
load();"""
    return body, script


def portal_page(j, nav, symbols, body, script):
    title, desc, scope = j["title"], j["desc"], j["scope"]
    picker = "" if scope == "public" else ('<div class="field" style="min-width:240px;margin:0"><label class="tiny muted">Acting as school (until login)</label>'
                                           '<select class="select" id="schoolPicker" onchange="setSchool(this.value)"></select></div>')
    return f"""<!doctype html>
<html lang="en" data-theme="violet">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} — Versa Schools</title><link rel="stylesheet" href="design.css"></head>
<body>
{symbols}
<div class="shell">
  <aside class="side" style="overflow:auto"><div class="brand"><div class="logo">V</div><div><h1>Versa</h1><p>School Portal</p></div></div>
    <nav class="nav"><div class="navlabel">Your journey</div>{nav}</nav></aside>
  <main><header class="top"><div><h3 style="margin:0">{title}</h3><p class="muted tiny" style="margin:2px 0 0">{desc}</p></div>{picker}</header>
    <div class="page">{body}</div></main></div>
<script>
const SK='versa_school';
function schoolId(){{return localStorage.getItem(SK)||'';}}
function setSchool(id){{localStorage.setItem(SK,id);location.reload();}}
async function initPicker(){{const r=await fetch('/api/schools');const j=await r.json();const data=j.data||[];
  if(!schoolId()&&data.length)localStorage.setItem(SK,data[0].id);
  const sel=document.getElementById('schoolPicker');if(sel){{sel.replaceChildren();for(const s of data){{const o=document.createElement('option');o.value=s.id;o.textContent=s.name;if(s.id===schoolId())o.selected=true;sel.appendChild(o);}}}}}}
{script}
initPicker();
</script>
</body></html>
"""


def main():
    spec = json.loads(SJ.read_text(encoding="utf-8"))
    ents = json.loads(CANON.read_text(encoding="utf-8"))["entities"]
    src = DESIGN.read_text(encoding="utf-8")
    css = re.search(r"<style>(.*?)</style>", src, re.S)
    symbols = re.search(r'<svg width="0" height="0".*?</svg>', src, re.S)
    SYMBOLS = symbols.group(0) if symbols else ""
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "design.css").write_text((css.group(1) if css else "").strip() + "\n", encoding="utf-8")
    journeys = spec["journeys"]
    nav = "".join(f'<a href="{j["id"]}.html">{icon(j.get("icon", "grid"))} <span>{j["id"]} · {j["title"]}</span></a>' for j in journeys)
    for j in journeys:
        body, script = build_body(j, ents)
        (OUT / f'{j["id"]}.html').write_text(portal_page(j, nav, SYMBOLS, body, script), encoding="utf-8")
    (OUT / "index.html").write_text('<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=SJ1.html">\n', encoding="utf-8")
    print(f"gen_portal: {len(journeys)} school-portal screens (SJ series) + index + design.css -> {OUT}/")


if __name__ == "__main__":
    main()
