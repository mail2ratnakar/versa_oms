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


def build_body(j, ents, scoped_portal):
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
    create_status = j.get("create_status", "")
    create_label = j.get("create_label", "New")
    scoped = "true" if (scoped_portal and scope == "school") else "false"
    thead = "".join(f"<th>{label(c)}</th>" for c in cols) + ("<th>File</th>" if download else "") + ("<th>Actions</th>" if shape == "manage" else "")
    span = len(cols) + (1 if download else 0) + (1 if shape == "manage" else 0)
    new_btn = f'<button class="btn secondary" onclick="openModal()">{icon("spark",16)} {create_label}</button>' if shape == "manage" else ""
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
    script = f"""const COLS={json.dumps(cols)};const ACTS={json.dumps(acts)};const SCOPED={scoped};const FK={json.dumps(fk_map(entity, ents))};const DOWNLOAD={str(download).lower()};const CREATE_STATUS={json.dumps(create_status)};
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
async function create(){{const input={{}};document.querySelectorAll('#m [name]').forEach(el=>{{if(el.value)input[el.name]=el.value;}});if(SCOPED)input.school_id=schoolId();if(CREATE_STATUS)input.status=CREATE_STATUS;
  const r=await fetch('/api/{entity}',{{method:'POST',headers:{{'content-type':'application/json'}},body:JSON.stringify(input)}});const j=await r.json();
  document.getElementById('msg').textContent=j.ok?'Saved.':('Errors: '+JSON.stringify(j.errors||j.code));if(j.ok){{closeModal();load();}}}}
load();"""
    return body, script


def portal_page(j, nav, symbols, body, script, portal, shell):
    title, desc, scope = j["title"], j["desc"], j["scope"]
    brand, navlabel = portal["brand"], portal["navlabel"]
    picker = "" if (not portal["scoped"] or scope == "public") else ('<div class="field" style="min-width:200px;margin:0"><label class="tiny muted">Acting as school (until login)</label>'
                                           '<select class="select" id="schoolPicker" onchange="setSchool(this.value)"></select></div>')
    # universal top bar — projected from spec/app_shell.json onto every page (notifications + account menu)
    n = shell.get("notifications", {}).get("badge", 0)
    badge = f'<span class="badge">{n}</span>' if n else ''
    acct_items = "".join(f'<div class="ditem" onclick="shellAction(\'{m["action"]}\')">{icon(m["icon"], 16)} <span>{m["label"]}</span></div>' for m in shell["account"]["menu"])
    topbar = (f'<div class="topright">{picker}'
              f'<div class="acct"><button class="iconbtn" title="Notifications" onclick="toggleMenu(\'notifMenu\')">{icon("bell")}{badge}</button>'
              f'<div class="dropdown" id="notifMenu"><div class="ditem" style="cursor:default;color:var(--muted)">No new notifications</div></div></div>'
              f'<div class="acct"><button class="avatar" title="Account" onclick="toggleMenu(\'acctMenu\')">{shell["account"].get("avatar", "U")}</button>'
              f'<div class="dropdown" id="acctMenu">{acct_items}</div></div></div>')
    return f"""<!doctype html>
<html lang="en" data-theme="violet">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} — Versa Schools</title><link rel="stylesheet" href="design.css"><style>.navgroup>summary{{display:flex;gap:10px;align-items:center;color:var(--muted);padding:10px 12px;border-radius:14px;font-size:13px;font-weight:700;cursor:pointer;list-style:none}}.navgroup>summary::-webkit-details-marker{{display:none}}.navgroup>summary::after{{content:"\\25B8";margin-left:auto;font-size:13px;color:var(--ink);opacity:.85;transition:transform .15s}}.navgroup[open]>summary::after{{transform:rotate(90deg)}}.navgroup>summary:hover{{color:var(--ink)}}.navgroup a{{padding-left:32px}}.side::-webkit-scrollbar{{width:7px}}.side::-webkit-scrollbar-thumb{{background:var(--line);border-radius:4px}}.top{{display:flex;align-items:center;gap:16px}}.topright{{display:flex;align-items:center;gap:10px;margin-left:auto}}.iconbtn{{position:relative;background:var(--panel);border:1px solid var(--line);width:38px;height:38px;border-radius:11px;display:grid;place-items:center;cursor:pointer;color:var(--muted)}}.iconbtn:hover{{color:var(--ink)}}.badge{{position:absolute;top:-5px;right:-5px;background:var(--a);color:#fff;font-size:9px;font-weight:800;min-width:15px;height:15px;border-radius:8px;display:grid;place-items:center;padding:0 3px}}.acct{{position:relative}}.avatar{{width:38px;height:38px;border-radius:50%;border:0;background:var(--a);color:#fff;font-weight:800;font-size:14px;cursor:pointer}}.dropdown{{position:absolute;right:0;top:48px;background:var(--panel);border:1px solid var(--line);border-radius:14px;box-shadow:0 14px 44px rgba(20,12,40,.18);padding:6px;min-width:200px;display:none;z-index:60}}.dropdown.open{{display:block}}.ditem{{display:flex;gap:10px;align-items:center;padding:9px 11px;border-radius:9px;color:var(--ink);text-decoration:none;font-size:13px;cursor:pointer}}.ditem:hover{{background:color-mix(in srgb,var(--a) 10%,transparent)}}</style></head>
<body>
{symbols}
<div class="shell">
  <aside class="side" style="overflow:auto"><div class="brand"><div class="logo">V</div><div><h1>Versa</h1><p>{brand}</p></div></div>
    <nav class="nav"><div class="navlabel">{navlabel}</div>{nav}</nav></aside>
  <main><header class="top"><div><h3 style="margin:0">{title}</h3><p class="muted tiny" style="margin:2px 0 0">{desc}</p></div>{topbar}</header>
    <div class="page">{body}</div></main></div>
<script>
const SK='versa_school';
function schoolId(){{return localStorage.getItem(SK)||'';}}
function setSchool(id){{localStorage.setItem(SK,id);location.reload();}}
async function initPicker(){{const r=await fetch('/api/schools');const j=await r.json();const data=j.data||[];
  if(!schoolId()&&data.length)localStorage.setItem(SK,data[0].id);
  const sel=document.getElementById('schoolPicker');if(sel){{sel.replaceChildren();for(const s of data){{const o=document.createElement('option');o.value=s.id;o.textContent=s.name;if(s.id===schoolId())o.selected=true;sel.appendChild(o);}}}}}}
function toggleMenu(id){{const m=document.getElementById(id);const o=m.classList.contains('open');document.querySelectorAll('.dropdown').forEach(d=>d.classList.remove('open'));if(!o)m.classList.add('open');}}
function shellAction(a){{alert(a.replace(/_/g,' ')+' — coming soon (wires at auth-last)');}}
document.addEventListener('click',e=>{{if(!e.target.closest('.acct'))document.querySelectorAll('.dropdown').forEach(d=>d.classList.remove('open'));}});
{script}
initPicker();
</script>
</body></html>
"""


PORTALS = [
    {"spec": "versa-oms/spec/school_journeys.json", "dir": "versa-oms/spec/derived/portal", "brand": "School Portal", "navlabel": "Your journey", "scoped": True},
    {"spec": "versa-oms/spec/staff_journeys.json", "dir": "versa-oms/spec/derived/staff", "brand": "Operations", "navlabel": "Operations", "scoped": False},
]


def build_nav(journeys):
    # journeys with a "group" collapse under one parent menu (details/summary); the rest stay flat. Source-driven.
    groups, done, out = {}, set(), []
    for j in journeys:
        if j.get("group"): groups.setdefault(j["group"], []).append(j)
    for j in journeys:
        g = j.get("group")
        if g:
            if g in done: continue
            done.add(g)
            subs = "".join(f'<a href="{x["id"]}.html">{icon(x.get("icon", "grid"), 16)} <span>{x["title"]}</span></a>' for x in groups[g])
            out.append(f'<details open class="navgroup"><summary>{icon("users", 16)} <span>{g}</span></summary>{subs}</details>')
        else:
            out.append(f'<a href="{j["id"]}.html">{icon(j.get("icon", "grid"))} <span>{j["id"]} · {j["title"]}</span></a>')
    return "".join(out)


def main():
    ents = json.loads(CANON.read_text(encoding="utf-8"))["entities"]
    shell = json.loads(Path("versa-oms/spec/app_shell.json").read_text(encoding="utf-8"))
    src = DESIGN.read_text(encoding="utf-8")
    css = re.search(r"<style>(.*?)</style>", src, re.S)
    symbols = re.search(r'<svg width="0" height="0".*?</svg>', src, re.S)
    SYMBOLS = symbols.group(0) if symbols else ""
    total = 0
    for portal in PORTALS:
        spec = json.loads(Path(portal["spec"]).read_text(encoding="utf-8"))
        out = Path(portal["dir"]); out.mkdir(parents=True, exist_ok=True)
        (out / "design.css").write_text((css.group(1) if css else "").strip() + "\n", encoding="utf-8")
        journeys = spec["journeys"]
        nav = build_nav(journeys)
        for j in journeys:
            body, script = build_body(j, ents, portal["scoped"])
            (out / f'{j["id"]}.html').write_text(portal_page(j, nav, SYMBOLS, body, script, portal, shell), encoding="utf-8")
        (out / "index.html").write_text(f'<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url={journeys[0]["id"]}.html">\n', encoding="utf-8")
        total += len(journeys)
        print(f'gen_portal: {portal["brand"]} -> {len(journeys)} screens -> {out}/')
    print(f"gen_portal: {total} portal screens total across {len(PORTALS)} portals")


if __name__ == "__main__":
    main()
