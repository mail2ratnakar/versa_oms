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
ICON_MAP = json.loads(Path("versa-oms/spec/icon_map.json").read_text(encoding="utf-8")) if Path("versa-oms/spec/icon_map.json").exists() else {}
REF = {k: v for k, v in (json.loads(Path("versa-oms/spec/reference_lists.json").read_text(encoding="utf-8")).items() if Path("versa-oms/spec/reference_lists.json").exists() else []) if not k.startswith("_")}
# module feature scope — DERIVED from source (supplement.module_features -> derive_specs -> here). gen_portal
# reads the projection, never the source; the founder's /campaignspec picks live only in the BRD/supplement.
_mf = json.loads(Path("versa-oms/spec/derived/module_features.json").read_text(encoding="utf-8")) if Path("versa-oms/spec/derived/module_features.json").exists() else {}
MODULE_FEATURES = {e: set(v.get("include", [])) for e, v in _mf.get("modules", {}).items()}
# declared email templates (source: supplement.email_templates -> derive_specs -> here) for the campaign builder
_et = json.loads(Path("versa-oms/spec/derived/email_templates.json").read_text(encoding="utf-8")) if Path("versa-oms/spec/derived/email_templates.json").exists() else {}
EMAIL_TEMPLATES = _et.get("items", [])


def in_scope(entity, *keys):
    # an entity with no founder-declared scope -> tools default on; with a scope -> only the included keys
    feats = MODULE_FEATURES.get(entity)
    if not feats:
        return True
    return any(k in feats for k in keys)


def label(fn):
    return fn.replace("_", " ").title()


def col_label(c):
    s = label(c)
    return s[:-3] if s.endswith(" At") else s


ACTION_ICONS = [("approve", "check"), ("accept", "check"), ("confirm", "check"), ("complete", "check"), ("finish", "check"),
    ("validate", "check"), ("reconcile", "check"), ("match", "check"), ("submit", "check"),
    ("block", "shield"), ("reject", "x"), ("revoke", "x"), ("void", "x"), ("cancel", "x"), ("fail", "x"), ("reverse", "x"), ("withhold", "lock"), ("pause", "x"),
    ("unsubscribe", "bell"), ("resubscribe", "bell"),
    ("publish", "upload"), ("release", "upload"), ("start", "play"), ("send", "mail"), ("issue", "file"), ("generate", "file"),
    ("register", "user"), ("schedule", "calendar"), ("link", "link"), ("upload", "upload"), ("download", "download"), ("import", "upload"), ("open", "play"), ("change", "route"), ("select", "route")]


def action_icon(a):
    al = a.lower()
    for kw, ic in ACTION_ICONS:
        if kw in al:
            return ic
    return "play"


def icon(n, w=18):
    lu = ICON_MAP.get(n, n)
    return f'<i data-lucide="{lu}" width="{w}" height="{w}" style="vertical-align:middle;display:inline-flex"></i>'


def field_section(fn):
    nl = fn.lower()
    if any(k in nl for k in ("address", "locality", "city", "state", "country", "pincode")):
        return "Address"
    if any(k in nl for k in ("coordinator", "principal", "contact", "email", "mobile", "phone")):
        return "Contact"
    return "Details"


def form_fields(entity, ents, hide):
    SECT = {"Details": [], "Address": [], "Contact": []}
    for f in ents[entity]["fields"]:
        fn = f["name"]
        if fn in ("id", "created_at", "updated_at", "status") or fn in hide or "system" in f.get("rule", "") or (f.get("type") or "") == "timestamp":
            continue  # never expose computed/system/timestamp fields as form inputs (timestamps are set by actions)
        if fn in REF:
            oc = ' onchange="stateToCountry(this)"' if fn == "state" else ""
            div = f'<div class="field"><label>{label(fn)}</label><select class="select" name="{fn}"{oc}><option value="">Select…</option>' + "".join(f"<option>{v}</option>" for v in REF[fn]) + "</select></div>"
        elif fn == "pincode":
            div = f'<div class="field"><label>{label(fn)}</label><input class="input" name="{fn}" maxlength="6" inputmode="numeric" oninput="pinLookup(this)" onblur="checkField(this)" placeholder="6-digit — fills city/state"><small class="ferr"></small></div>'
        elif f.get("references"):
            div = f'<div class="field"><label>{label(fn)}</label><select class="select" name="{fn}" id="fk_{fn}"><option value="">Select…</option></select></div>'
        elif f["type"] == "enum" and f.get("enum_values"):
            div = f'<div class="field"><label>{label(fn)}</label><select class="select" name="{fn}">' + "".join(f"<option>{v}</option>" for v in f["enum_values"]) + "</select></div>"
        else:
            nl, ty = fn.lower(), (f.get("type") or "").lower()
            if ty == "text":
                attach = "attach" in fn.lower()
                ph = "Hosted files — one per line:  Brochure | https://…/file.pdf" if attach else "HTML or text — merge tags {{school_name}} {{city}} {{state}}"
                rows = "3" if attach else "6"
                div = f'<div class="field" style="grid-column:1/-1"><label>{label(fn)}</label><textarea class="input" name="{fn}" rows="{rows}" data-kind="text" placeholder="{ph}"></textarea></div>'
            else:
                if "email" in nl:
                    at = 'type="email" data-kind="email"'
                elif "website" in nl or nl.endswith("url"):
                    at = 'type="url" data-kind="url" placeholder="https://…"'
                elif "mobile" in nl or "phone" in nl:
                    at = 'inputmode="numeric" maxlength="10" data-kind="tel" oninput="onlyDigits(this)"'
                elif ty in ("integer", "int", "number", "decimal"):
                    at = 'inputmode="numeric" data-kind="number" oninput="onlyDigits(this)"'
                elif fn in ("coordinator_name", "principal_name", "city"):
                    at = 'data-kind="alpha" oninput="onlyAlpha(this)"'
                else:
                    at = 'data-kind="text"'
                div = f'<div class="field"><label>{label(fn)}</label><input class="input" name="{fn}" {at} onblur="checkField(this)"><small class="ferr"></small></div>'
        SECT[field_section(fn)].append(div)
    nonempty = [s for s in SECT if SECT[s]]
    out = []
    for s in ("Details", "Address", "Contact"):
        if not SECT[s]:
            continue
        hdr = f'<div class="fsec-h">{s}</div>' if len(nonempty) > 1 else ""
        out.append(f'<div class="fsec">{hdr}<div class="grid two">' + "".join(SECT[s]) + "</div></div>")
    return "".join(out)


def fk_map(entity, ents):
    return {f["name"]: f["references"] for f in ents[entity]["fields"] if f.get("references") and f["name"] != "school_id"}


_ANN_CACHE = None
def _load_ann():
    global _ANN_CACHE
    if _ANN_CACHE is None:
        _ap = Path(__file__).resolve().parents[2] / "spec" / "derived" / "annotations.json"
        _ANN_CACHE = json.loads(_ap.read_text(encoding="utf-8")) if _ap.exists() else {}
    return _ANN_CACHE
def _esc_html(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
def field_help(sid, field):
    ns = [n for n in _load_ann().get(sid, []) if (n.get("bind") or {}).get("kind") == "field" and (n.get("bind") or {}).get("to") == field and n.get("note")]
    if not ns:
        return ""
    return '<div class="fieldhelp" style="font-size:11px;color:var(--muted);margin-top:4px">✎ ' + "; ".join(_esc_html(n["note"]) for n in ns) + '</div>'
def build_body(j, ents, scoped_portal, ui, lifecycle=None):
    sid, title, shape, entity, scope = j["id"], j["title"], j["shape"], j["entity"], j["scope"]
    lifecycle = lifecycle or {}
    if shape == "dashboard":
        kpis, per = j.get("kpis", []), ui.get("kpi_cards_per_line", 5)
        scoped = "true" if (scoped_portal and scope == "school") else "false"
        body = ('<section><div class="kpirow" id="kpis"></div>'
                f'<button class="btn ghost" id="moreBtn" onclick="toggleMore()" style="margin-top:10px">{icon("chart", 16)} <span>See more</span></button>'
                '<div id="kpimore" class="kpimore"></div></section>')
        script = f"""const KPIS={json.dumps(kpis)};const PER={per};const SCOPED={scoped};
async function loadKpis(){{const row=document.getElementById('kpis'),more=document.getElementById('kpimore');row.replaceChildren();more.replaceChildren();
  for(let i=0;i<KPIS.length;i++){{const e=KPIS[i];const r=await fetch('/api/'+e.entity);const jr=await r.json();const data=(jr.data||[]).filter(x=>!SCOPED||!x.school_id||x.school_id===schoolId());
    const by={{}};data.forEach(x=>{{const s=x.status||'—';by[s]=(by[s]||0)+1;}});
    const card=document.createElement('div');card.className='kpi';const l=document.createElement('div');l.className='kpi-l';l.textContent=e.label;const n=document.createElement('div');n.className='kpi-n';n.textContent=data.length;card.append(l,n);(i<PER?row:more).appendChild(card);
    const br=document.createElement('div');br.className='kpibreak';const bl=document.createElement('div');bl.className='kpi-l';bl.textContent=e.label+' by status';br.appendChild(bl);
    for(const s in by){{const t=document.createElement('span');t.className='chip';t.textContent=s+' · '+by[s];br.appendChild(t);}}more.appendChild(br);}}}}
function toggleMore(){{const open=document.getElementById('kpimore').classList.toggle('open');document.getElementById('moreBtn').querySelector('span').textContent=open?'See less':'See more';}}
loadKpis();"""
        return body, script
    if shape == "import":
        names = ["Upload", "Map columns", "Review", "Done"]
        ws = ""
        for i, s in enumerate(names):
            if i:
                ws += '<span class="arrow">&rarr;</span>'
            ws += f'<div class="step{" on" if i == 0 else ""}" data-w="{i + 1}"><span class="lbl">{i + 1} &middot; {s}</span></div>'
        gsteps = [("Upload", "Choose a CSV or XLSX of schools. Only an <b>email</b> column is required — everything else enriches if present."),
                  ("Map columns", "Each column is auto-detected; adjust any dropdown. One column must map to <b>email</b>."),
                  ("Review", "See how many will import, how many have <b>no email</b> (skipped), and how many are <b>duplicates</b> of schools already in the directory (skipped)."),
                  ("Done", "The schools are added as <b>prospects</b>. Open the School directory to email them.")]
        imp_guide = ('<div id="g" class="modalbg" onclick="if(event.target===this)closeGuide()"><div class="modal" style="max-width:560px;max-height:85vh;overflow:auto">'
                     f'<div class="between"><h3 style="margin:0">How import works</h3><button class="btn ghost iconbtn" onclick="closeGuide()">{icon("x", 16)}</button></div>'
                     '<div class="guide" style="margin-top:14px">' + "".join(f'<div class="gstep"><div class="gname">{n}</div><div class="gtxt">{d}</div></div>' for n, d in gsteps) + '</div></div></div>')
        body = (f'<div class="stepper">{ws}<button class="stephelp" onclick="openGuide()" title="How import works">?</button></div><section class="card">'
                '<div class="wpanel on" data-p="1"><h4>Upload a school list</h4><p class="muted tiny">CSV or XLSX from any source — only an email column is required.</p>'
                '<input type="file" id="ifile" class="input" accept=".csv,.xlsx,.xls" style="max-width:420px">'
                f'<div class="flex" style="margin-top:14px"><button class="btn primary" onclick="wUpload()">{icon("upload", 16)} Parse file</button> <a class="btn ghost" href="/api/import-template">{icon("download", 16)} Template</a> <span id="wmsg" class="muted tiny"></span></div></div>'
                '<div class="wpanel" data-p="2"><h4>Map columns</h4><p class="muted tiny">Auto-detected — adjust any. Email is the only required field.</p><div id="maprows" class="detailgrid"></div>'
                '<div class="flex" style="margin-top:14px"><button class="btn ghost" onclick="wGo(1)">Back</button> <button class="btn primary" onclick="wValidate()">Review</button></div></div>'
                '<div class="wpanel" data-p="3"><h4>Review</h4><div id="counts" class="kpirow"></div><p class="muted tiny" style="margin-top:10px">Rows with no email, and duplicates (email already in the directory), are skipped.</p>'
                '<div class="flex" style="margin-top:14px"><button class="btn ghost" onclick="wGo(2)">Back</button> <button class="btn primary" id="impBtn" onclick="wRun()">Import</button></div></div>'
                '<div class="wpanel" data-p="4"><h4>Done</h4><div id="summary" class="kpirow"></div>'
                f'<div class="flex" style="margin-top:14px"><a class="btn primary" href="OJ-O2.html">{icon("arrow", 16)} School directory</a> <button class="btn ghost" onclick="location.reload()">New import</button></div></div></section>{imp_guide}')
        script = (
            "let UP=null;\n"
            "function wGo(n){document.querySelectorAll('.wpanel').forEach(p=>p.classList.toggle('on',p.dataset.p===String(n)));document.querySelectorAll('.stepper .step').forEach(s=>s.classList.toggle('on',Number(s.dataset.w)<=n));}\n"
            "function wmsg(t){document.getElementById('wmsg').textContent=t||'';}\n"
            "async function wUpload(){const f=document.getElementById('ifile').files[0];if(!f){wmsg('Choose a file first');return;}wmsg('Parsing…');"
            "const b64=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(String(fr.result).split(',')[1]);fr.readAsDataURL(f);});"
            "const res=await fetch('/api/import/upload',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({dataB64:b64})});UP=await res.json();wmsg('');buildMap();wGo(2);}\n"
            "function buildMap(){const g=document.getElementById('maprows');g.replaceChildren();for(const h of UP.headers){const row=document.createElement('div');row.className='drow';const k=document.createElement('span');k.className='dk';k.textContent=h;const sel=document.createElement('select');sel.className='select';sel.dataset.col=h;const o0=document.createElement('option');o0.value='';o0.textContent='— ignore —';sel.appendChild(o0);for(const c of UP.canonical){const o=document.createElement('option');o.value=c;o.textContent=c.replace(/_/g,' ');if(UP.mapping[h]===c)o.selected=true;sel.appendChild(o);}row.append(k,sel);g.appendChild(row);}}\n"
            "function curMapping(){const m={};document.querySelectorAll('#maprows select').forEach(s=>{if(s.value)m[s.dataset.col]=s.value;});return m;}\n"
            "function cards(id,pairs){const c=document.getElementById(id);c.replaceChildren();for(const p of pairs){const d=document.createElement('div');d.className='kpi';const a=document.createElement('div');a.className='kpi-l';a.textContent=p[0];const b=document.createElement('div');b.className='kpi-n';b.textContent=p[1];d.append(a,b);c.appendChild(d);}}\n"
            "async function wValidate(){const m=curMapping();if(!Object.values(m).includes('email')){toast('Map a column to email — it is the only required field.','err');return;}"
            "const res=await fetch('/api/import/validate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:UP.token,mapping:m})});const j=await res.json();"
            "cards('counts',[['Will import',j.valid],['No email',j.missing],['Duplicates',j.duplicates],['Total rows',j.total]]);document.getElementById('impBtn').textContent='Import '+j.valid+' prospects';wGo(3);}\n"
            "async function wRun(){const m=curMapping();document.getElementById('impBtn').textContent='Importing…';"
            "const res=await fetch('/api/import/run',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:UP.token,mapping:m,source:'upload'})});const j=await res.json();"
            "cards('summary',[['Imported',j.imported],['Skipped (no email)',j.failed],['Duplicates',j.duplicates]]);wGo(4);}\n"
            "function openGuide(){const g=document.getElementById('g');if(g)g.classList.add('open');}\n"
            "function closeGuide(){const g=document.getElementById('g');if(g)g.classList.remove('open');}"
        )
        return body, script
    if shape == "register":
        fields = form_fields(entity, ents, hide=[])
        body = (f'<section class="card"><div class="head"><div><span class="badge success">Step 1</span>'
                f'<h4>School details</h4></div></div>{fields}'
                f'<div class="flex" style="margin-top:16px"><button class="btn primary" onclick="register()">{icon("check",16)} Register</button>'
                f'<span id="msg" class="muted tiny"></span></div></section>')
        script = ("async function register(){const _ve=validate(document.querySelector('.card'));if(_ve){document.getElementById('msg').textContent=_ve;return;}const input={};document.querySelectorAll('.card [name]').forEach(el=>{if(el.value)input[el.name]=el.value;});"
                  "input.status='lead';const r=await fetch('/api/schools',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)});"
                  "const j=await r.json();document.getElementById('msg').textContent=j.ok?('Registered — '+j.data.name+' is now pending approval.'):errText(j);}")
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
    if shape == "builder":
        sched = ('<div id="sch" class="modalbg" onclick="if(event.target===this)closeSchedule()"><div class="modal" style="max-width:440px">'
                 f'<div class="between"><h3 style="margin:0">Schedule send</h3><button class="btn ghost iconbtn" onclick="closeSchedule()">{icon("x", 16)}</button></div>'
                 '<p class="muted tiny" style="margin:8px 0 10px">Pick when this campaign should send. A tick checks every minute and sends due campaigns.</p>'
                 '<div class="field"><label>Send at (your local time)</label><input class="input" type="datetime-local" id="schAt"></div>'
                 f'<div class="flex" style="margin-top:14px"><button class="btn primary" onclick="doSchedule()">{icon("file-clock", 16)} Schedule</button><span id="schMsg" class="muted tiny"></span></div>'
                 '</div></div>')
        toolbar = (f'<button class="tbtn" onclick="bExec(\'bold\')" title="Bold">{icon("bold", 15)}</button>'
                   f'<button class="tbtn" onclick="bExec(\'italic\')" title="Italic">{icon("italic", 15)}</button>'
                   f'<button class="tbtn" onclick="bExec(\'formatBlock\',\'H2\')" title="Heading">{icon("heading", 15)}</button>'
                   f'<button class="tbtn" onclick="bExec(\'insertUnorderedList\')" title="Bullet list">{icon("list", 15)}</button>'
                   f'<button class="tbtn" onclick="bLink()" title="Link">{icon("link", 15)}</button>'
                   f'<button class="tbtn" onclick="bImg()" title="Image">{icon("image", 15)}</button>')
        compose = j.get("compose", [])
        _cfp, cmetas = [], []
        for _p in compose:
            _k = _p.get("kind")
            if _k == "text":
                _fid = "b_" + _p["field"]; _oc = ' oninput="bPreview()"' if _p.get("merge") else ''
                _cfp.append('<div class="bsec"><label>' + _p["label"] + '</label><input class="input" id="' + _fid + '"' + _oc + ' placeholder="' + _p.get("placeholder", "") + '">' + field_help(j["id"], _p["field"]) + '</div>')
                cmetas.append({"id": _fid, "field": _p["field"], "kind": "text"})
            elif _k == "recipients":
                _cfp.append('<div class="bsec"><label>' + _p["label"] + '</label><input class="input" id="b_to" readonly placeholder="auto-filled from the selected schools">' + field_help(j["id"], "to") + '</div>')
                cmetas.append({"id": "b_to", "kind": "recipients", "prefill": _p["prefill"]})
            elif _k == "emails":
                _fid = "b_" + _p["field"]
                _cfp.append('<div class="bsec"><label>' + _p["label"] + '</label><textarea class="input" id="' + _fid + '" rows="3" oninput="bPreview()" placeholder="auto-filled from the selected schools — one email per line, editable"></textarea>' + field_help(j["id"], _p["field"]) + '</div>')
                cmetas.append({"id": _fid, "field": _p["field"], "kind": "emails", "prefill": _p["prefill"]})
            elif _k == "body":
                cmetas.append({"field": _p["field"], "kind": "body"})
            elif _k == "attachments":
                cmetas.append({"field": _p["field"], "kind": "attachments"})
        cfields = "".join(_cfp)
        body = (f'<a href="OJ-O3.html" class="btn ghost tiny" style="margin-bottom:10px">{icon("arrow", 14)} Back to campaigns</a>'
                '<div class="builder"><div class="bcompose">'
                f'{cfields}'
                '<div class="bsec"><label>Start from a template</label><div id="b_templates" class="brow"></div></div>'
                '<div class="bsec"><div class="between"><label>Body</label><div class="btabs">'
                '<button id="tabVis" class="btn ghost tiny pvon" onclick="bTab(\'vis\')">Visual</button>'
                '<button id="tabHtml" class="btn ghost tiny" onclick="bTab(\'html\')">HTML</button></div></div>'
                f'<div class="btoolbar" id="btoolbar">{toolbar}</div>'
                '<input type="file" id="b_imgfile" accept="image/*" style="display:none" onchange="bImgUp(this.files)">'
                '<div id="b_visual" class="bedit" contenteditable="true" oninput="bFromVisual()"></div>'
                '<textarea id="b_html" class="input bedit hide" rows="13" oninput="bFromHtml()" placeholder="Paste HTML (e.g. from an AI tool) or write it here…"></textarea></div>'
                '<div class="bsec"><label>Attachments &amp; media</label>'
                '<p class="muted tiny" style="margin:0 0 8px">Attach PDFs, HTML or images — uploaded &amp; hosted automatically; they appear in the preview.</p>'
                '<input type="file" id="b_files" multiple accept=".pdf,.html,.htm,image/*" style="display:none" onchange="bUpload(this.files)">'
                f'<button class="btn secondary" onclick="document.getElementById(\'b_files\').click()">{icon("paperclip", 15)} Attach files</button>'
                '<div id="b_attlist" class="brow" style="margin-top:8px"></div></div>'
                '<div class="bsec bsend">'
                f'<button class="btn primary" onclick="bSend(\'now\')">{icon("send", 15)} Send now</button>'
                f'<button class="btn secondary" onclick="bSend(\'schedule\')">{icon("file-clock", 15)} Schedule</button>'
                f'<button class="btn ghost" onclick="bSave()">{icon("save", 15)} Save draft</button>'
                '<span id="b_msg" class="muted tiny"></span></div></div>'
                '<div class="bpreview"><div class="between" style="margin-bottom:8px"><b>Live preview</b><div class="btabs">'
                '<button id="pvD" class="btn ghost tiny pvon" onclick="setPv(\'d\')">Desktop</button>'
                '<button id="pvM" class="btn ghost tiny" onclick="setPv(\'m\')">Mobile</button></div></div>'
                '<div class="muted tiny" id="b_pvsub" style="margin-bottom:8px"></div>'
                '<div class="pvstage"><div class="pvframe" id="pvframe"><iframe id="pvif" title="preview"></iframe></div></div>'
                f'</div></div>{sched}')
        script = (f"const ENTITY={json.dumps(entity)};const TEMPLATES={json.dumps(EMAIL_TEMPLATES)};const COMPOSE={json.dumps(cmetas)};const SENDVAL={json.dumps(j.get('send_validation', []))};const LISTPAGE='OJ-O3.html';const SCHEDULE_FIELD='scheduled_at';\n"
                  "let CID=new URLSearchParams(location.search).get('id');let MODE='vis';let TARGETS=null;\n"
                  "function load(){location.href=LISTPAGE;}\n"
                  "function bBody(){return MODE==='vis'?document.getElementById('b_visual').innerHTML:document.getElementById('b_html').value;}\n"
                  "function setBody(h){document.getElementById('b_visual').innerHTML=h;document.getElementById('b_html').value=h;bPreview();}\n"
                  "function bTab(m){MODE=m;const v=document.getElementById('b_visual'),h=document.getElementById('b_html');if(m==='vis'){h.classList.add('hide');v.classList.remove('hide');v.innerHTML=h.value;document.getElementById('btoolbar').style.display='flex';}else{v.classList.add('hide');h.classList.remove('hide');h.value=v.innerHTML;document.getElementById('btoolbar').style.display='none';}document.getElementById('tabVis').classList.toggle('pvon',m==='vis');document.getElementById('tabHtml').classList.toggle('pvon',m==='html');}\n"
                  "function bFromVisual(){document.getElementById('b_html').value=document.getElementById('b_visual').innerHTML;bPreview();}\n"
                  "function bFromHtml(){bPreview();}\n"
                  "let ATTACH=[];\n"
                  "function parseAttachLines(text){return String(text||'').split('\\n').map(function(l){return l.trim();}).filter(Boolean).map(function(l){const i=l.indexOf('|');return i>=0?{name:l.slice(0,i).trim(),url:l.slice(i+1).trim()}:{name:(l.split('/').pop()||l),url:l};}).filter(function(a){return a.url;});}\n"
                  "function attachText(){return ATTACH.map(function(a){return a.name+' | '+a.url;}).join('\\n');}\n"
                  "function renderAttach(){const c=document.getElementById('b_attlist');if(!c)return;c.replaceChildren();ATTACH.forEach(function(a,i){const chip=document.createElement('span');chip.className='chip';chip.textContent=a.name+' ';const x=document.createElement('button');x.className='chipx';x.textContent='×';x.title='Remove';x.onclick=function(){ATTACH.splice(i,1);renderAttach();bPreview();};chip.appendChild(x);c.appendChild(chip);});bPreview();}\n"
                  "async function doUpload(f){const b64=await new Promise(function(r){const fr=new FileReader();fr.onload=function(){r(String(fr.result).split(',')[1]);};fr.readAsDataURL(f);});const res=await fetch('/api/upload',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:f.name,contentType:f.type||'application/octet-stream',dataB64:b64})});const j=await res.json();if(!j.url)throw new Error(j.error||'upload failed');let url=j.url;if(url.charAt(0)==='/')url=location.origin+url;return{name:f.name,url:url};}\n"
                  "async function bUpload(files){for(const f of files){try{toast('Uploading '+f.name+'…');const a=await doUpload(f);ATTACH.push(a);toast('Uploaded '+f.name);}catch(e){toast('Upload failed: '+e.message,'err');}}document.getElementById('b_files').value='';renderAttach();}\n"
                  "function bImg(){document.getElementById('b_imgfile').click();}\n"
                  "async function bImgUp(files){if(!files[0])return;try{const a=await doUpload(files[0]);const img='<img src=\"'+a.url+'\" style=\"max-width:100%;height:auto\">';if(MODE==='vis'){document.getElementById('b_visual').focus();document.execCommand('insertHTML',false,img);bFromVisual();}else{const h=document.getElementById('b_html');h.value+=(h.value?'\\n':'')+img;bFromHtml();}toast('Image added');}catch(e){toast('Upload failed: '+e.message,'err');}document.getElementById('b_imgfile').value='';}\n"
                  "function bExec(c,v){document.execCommand(c,false,v||null);document.getElementById('b_visual').focus();bFromVisual();}\n"
                  "function bLink(){ask({title:'Insert link',label:'Link URL',kind:'url',placeholder:'https://…',ok:function(u){bExec('createLink',u);}});}\n"
                  "function bInsertImage(){ask({title:'Insert image',label:'Image URL',kind:'url',placeholder:'https://…/image.png',ok:function(u){const img='<img src=\"'+u+'\" style=\"max-width:100%;height:auto\">';if(MODE==='vis'){bExec('insertHTML',img);}else{const h=document.getElementById('b_html');h.value+=(h.value?'\\n':'')+img;bFromHtml();}toast('Image inserted');}});}\n"
                  "function bTemplates(){const c=document.getElementById('b_templates');c.replaceChildren();for(const t of TEMPLATES){const b=document.createElement('button');b.className='btn ghost tiny';b.textContent=t.name;b.onclick=function(){setBody(t.html);};c.appendChild(b);}if(!TEMPLATES.length)c.innerHTML='<span class=\"muted tiny\">No templates declared.</span>';}\n"
                  "function audMode(){const r=document.querySelector('input[name=aud]:checked');return r?r.value:'all';}\n"
                  "async function fillRecipients(ids,fresh){if(!ids||!ids.length)return;const r=await fetch('/api/schools');const j=await r.json();const sel=(j.data||[]).filter(function(s){return ids.includes(s.id);});const NL=String.fromCharCode(10);for(const c of COMPOSE){if(!c.prefill)continue;const el=document.getElementById(c.id);if(!el)continue;const vals=sel.map(function(s){return s[c.prefill];}).filter(Boolean);if(c.kind==='recipients')el.value=vals.join(', ');else if(fresh)el.value=vals.join(NL);}}\n"
                  "function bPreview(){const subj=document.getElementById('b_subject').value;document.getElementById('b_pvsub').textContent='Subject: '+(pvFill(subj)||'(none)');const f=document.getElementById('pvif');const html=pvFill(bBody());f.srcdoc=(html||'<p style=\"font-family:system-ui;color:#999;padding:24px\">Empty — pick a template, paste HTML, or type.</p>')+attachFooter(attachText());}\n"
                  "function bInput(){const i={channel:'outreach'};for(const c of COMPOSE){if(!c.field)continue;if(c.kind==='body')i[c.field]=bBody();else if(c.kind==='attachments')i[c.field]=attachText();else{const el=document.getElementById(c.id);if(el)i[c.field]=el.value;}}if(TARGETS)i.target_ids=JSON.stringify(TARGETS);return i;}\n"
                  "async function bSaveRaw(){const input=bInput();let r;if(CID){r=await fetch('/api/'+ENTITY+'/'+CID,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify(input)});}else{input.status='draft';r=await fetch('/api/'+ENTITY,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(input)});}const j=await r.json();if(j.ok&&j.data&&j.data.id)CID=j.data.id;return j;}\n"
                  "function bmsg(t){document.getElementById('b_msg').textContent=t||'';}function validateSend(){const NL=String.fromCharCode(10);for(const v of SENDVAL){if(v.check==='recipients'){const el=document.getElementById('b_recipient_emails');const n=el?el.value.split(NL).map(function(s){return s.trim();}).filter(Boolean).length:0;if(!n)return v.message;}else if(v.check==='field'){const el=document.getElementById('b_'+v.field);if(!el||!el.value.trim())return v.message;}else if(v.check==='body_or_attachment'){if(!bBody().replace(/<[^>]*>/g,'').trim()&&!attachText().trim())return v.message;}}return '';}\n"
                  "async function bSave(){const j=await bSaveRaw();if(j.ok){toast('Draft saved');bmsg('Saved');}else bmsg(errText(j));}\n"
                  "async function bSend(mode){const ve=validateSend();if(ve){bmsg(ve);return;}const j=await bSaveRaw();if(!j.ok){bmsg(errText(j));return;}if(mode==='schedule'){openSchedule(CID);return;}const act=mode==='brevo'?'create_in_brevo':'start_send';const r=await fetch('/api/'+ENTITY+'/'+CID+'/'+act,{method:'POST'});const k=await r.json();if(k.ok){localStorage.removeItem('campaign_targets');toast(mode==='brevo'?'Created in Brevo':'Campaign sending');setTimeout(function(){location.href=LISTPAGE;},800);}else bmsg('Failed: '+(k.code||''));}\n"
                  "async function bLoad(){if(!CID)return;const r=await fetch('/api/'+ENTITY+'/'+CID);const j=await r.json();const c=j.data;if(!c)return;for(const cf of COMPOSE){if(!cf.field)continue;const v=c[cf.field]||'';if(cf.kind==='body')setBody(v);else if(cf.kind==='attachments'){ATTACH=parseAttachLines(v);renderAttach();}else{const el=document.getElementById(cf.id);if(el)el.value=v;}}if(c.target_ids){try{TARGETS=JSON.parse(c.target_ids);}catch(e){}}await fillRecipients(TARGETS,false);bPreview();}\n"
                  "bTemplates();setPv('d');(async function(){if(CID){await bLoad();}else{const raw=localStorage.getItem('campaign_targets');if(raw){try{TARGETS=JSON.parse(raw);}catch(e){}}await fillRecipients(TARGETS,true);}bPreview();})();")
        return body, script

    # list / manage share a scoped table
    cols = j.get("cols", ["status"])
    download = j.get("download", False)
    acts = j.get("actions", [])
    create_status = j.get("create_status", "")
    create_label = j.get("create_label", "New")
    scoped = "true" if (scoped_portal and scope == "school") else "false"
    sf = next((f for f in ents[entity]["fields"] if f["name"] == "status"), None) if entity in ents else None
    states = sf.get("enum_values", []) if sf else []
    stepper = ""
    if states and ui.get("process_stepper"):
        lc = lifecycle.get(entity, [])
        parts = []
        for i, s in enumerate(states):
            if i:
                parts.append('<span class="arrow">&rarr;</span>')
            parts.append(f'<div class="step" data-st="{s}"><span class="lbl">{label(s)}</span><b class="cnt">0</b></div>')
        any_acts = [t for t in lc if t["from"] == "any"]
        grows = []
        for s in states:
            outs = [t for t in lc if t["from"] == s]
            staff = [t for t in outs if t["action"] in acts]
            ext = [t for t in outs if t["action"] not in acts]
            segs = []
            if staff:
                segs.append("<b>You:</b> " + ", ".join(f'{label(t["action"])} &rarr; {label(t["to"])}' for t in staff))
            if ext:
                segs.append("<b>School / system:</b> " + ", ".join(f'{label(t["action"])} &rarr; {label(t["to"])}' for t in ext))
            txt = " &middot; ".join(segs) if segs else "Final stage — nothing more to do here."
            grows.append(f'<div class="gstep"><div class="gname">{label(s)}</div><div class="gtxt">{txt}</div></div>')
        anyline = ('<div class="gany"><b>Anytime:</b> ' + ", ".join(f'{label(t["action"])} &rarr; {label(t["to"])}' for t in any_acts) + '</div>') if any_acts else ""
        guide = ('<div id="g" class="modalbg" onclick="if(event.target===this)closeGuide()"><div class="modal" style="max-width:560px;max-height:85vh;overflow:auto">'
                 f'<div class="between"><h3 style="margin:0">How this works</h3><button class="btn ghost iconbtn" onclick="closeGuide()">{icon("x", 16)}</button></div>'
                 '<p class="muted tiny" style="margin:8px 0 14px">Each stage and what to do to move it forward.</p>'
                 f'<div class="guide">{"".join(grows)}</div>{anyline}</div></div>')
        helpbtn = '<button class="stephelp" onclick="openGuide()" title="What do these stages mean?">?</button>'
        stepper = f'<div class="stepper">{"".join(parts)}{helpbtn}</div>{guide}'
    # filters (declared per-journey) -> toolbar controls
    filters = []
    for fn in j.get("filters", []):
        fld = next((f for f in ents[entity]["fields"] if f["name"] == fn), None)
        if not fld:
            continue
        if fld["type"] == "boolean":
            filters.append({"name": fn, "type": "boolean"})
        elif fld.get("enum_values"):
            filters.append({"name": fn, "type": "enum", "options": fld["enum_values"]})
        else:
            filters.append({"name": fn, "type": "text"})
    tb = '<input class="input" id="q" placeholder="Search…" oninput="render()" style="max-width:230px">'
    for f in filters:
        if f["type"] == "enum":
            opts = f'<option value="">{label(f["name"])}: all</option>' + "".join(f'<option value="{o}">{label(o)}</option>' for o in f["options"])
            tb += f'<select class="select" id="f_{f["name"]}" onchange="render()" style="max-width:170px">{opts}</select>'
        elif f["type"] == "boolean":
            tb += f'<label class="muted tiny" style="display:flex;gap:6px;align-items:center;white-space:nowrap"><input type="checkbox" id="f_{f["name"]}" onchange="render()"> Hide {label(f["name"]).lower()}</label>'
        else:
            tb += f'<input class="input" id="f_{f["name"]}" placeholder="{label(f["name"])}" oninput="render()" style="max-width:130px">'
    tb += '<select class="select" id="psize" onchange="setPsize(this.value)" style="max-width:120px;margin-left:auto"><option value="25">25 / page</option><option value="50">50 / page</option><option value="100">100 / page</option></select>'
    toolbar = f'<div class="toolbar">{tb}</div>'
    pager = '<div class="pager"><button class="btn ghost tiny" onclick="pg(-1)">&larr; Prev</button> <span id="pinfo" class="muted tiny"></span> <button class="btn ghost tiny" onclick="pg(1)">Next &rarr;</button></div>'
    entlabel = label(entity)[:-1] if label(entity).endswith("s") else label(entity)
    deletable = j.get("deletable", "")
    datecols = [c for c in cols if c.endswith("_at") or c.endswith("_date") or (next((f for f in ents[entity]["fields"] if f["name"] == c), {}).get("type") in ("date", "timestamp"))]
    sys_names = ["status", "created_at", "updated_at"] + [f["name"] for f in ents[entity]["fields"] if "system" in f.get("rule", "") and f["name"] not in ("id", "created_at", "updated_at")]
    trans = {}
    for tr in lifecycle.get(entity, []):
        trans.setdefault(tr["action"], []).append(tr["from"])
    act_icons = {a: (ICON_MAP.get(a) or ICON_MAP.get(action_icon(a), action_icon(a))) for a in acts}
    toggles_e = [dict(tg, on_ic=ICON_MAP.get(tg["on"].lower(), "bell"), off_ic=ICON_MAP.get(tg["off"].lower(), "bell")) for tg in j.get("toggles", [])]
    all_trans = [{"action": tr["action"], "from": tr["from"], "to": tr["to"], "staff": tr["action"] in acts} for tr in lifecycle.get(entity, [])]
    all_act_icons = {tr["action"]: (ICON_MAP.get(tr["action"]) or ICON_MAP.get(action_icon(tr["action"]), action_icon(tr["action"]))) for tr in lifecycle.get(entity, [])}
    bulk = j.get("bulk_action")
    cb_th = '''<th style="width:30px"><input type="checkbox" id="selall" onchange="toggleAll(this.checked)"></th>''' if bulk else ""
    thead = cb_th + "".join(f"<th>{col_label(c)}</th>" for c in cols) + ("<th>File</th>" if download else "") + ("<th>Actions</th>" if shape == "manage" else "")
    span = len(cols) + (1 if download else 0) + (1 if shape == "manage" else 0) + (1 if bulk else 0)
    bulkbar = (f'''<div class="bulkbar hide" id="bulkbar"><b id="bulkn">0</b> selected <button class="btn primary tiny" onclick="doBulk()">{icon("mail", 14)} {bulk["label"]}</button> <button class="btn ghost tiny" onclick="clearSel()">Clear</button></div>''') if bulk else ""
    new_btn = f'<button class="btn secondary" onclick="openNew()">{icon("spark", 16)} {create_label}</button>' if shape == "manage" else ""
    modal, detail, pv_modal, sch_modal = "", "", "", ""
    more_modal = ('<div id="more" class="modalbg" onclick="if(event.target===this)closeMore()"><div class="modal" style="max-width:520px;max-height:85vh;overflow:auto">'
                  f'<div class="between"><h3 id="moreTitle" style="margin:0">Actions</h3><button class="btn ghost iconbtn" onclick="closeMore()">{icon("x", 16)}</button></div>'
                  '<p class="muted tiny" style="margin:8px 0 6px">All lifecycle actions — available now (You) or shown muted (other stage, or the school does it).</p>'
                  '<div id="moreBody"></div></div></div>') if (shape == "manage" and all_trans) else ""
    if shape == "manage":
        fields = form_fields(entity, ents, hide=["school_id"])
        # entities with an email body (html_content) get compose tools: preview (desktop/mobile) + send-test
        body_field = next((f["name"] for f in ents[entity]["fields"] if (f.get("type") == "text" and any(k in f["name"].lower() for k in ("content", "body", "html")))), None)
        cbtn = []
        if body_field:
            if in_scope(entity, "image_host"):
                cbtn.append(f'<button class="btn secondary" onclick="insertImage()">{icon("image", 16)} Insert image</button>')
            if in_scope(entity, "preview_desktop", "preview_mobile"):
                cbtn.append(f'<button class="btn secondary" onclick="openPreview()">{icon("eye", 16)} Preview</button>')
            if in_scope(entity, "send_test"):
                cbtn.append(f'<button class="btn secondary" onclick="sendTest()">{icon("send", 16)} Send test</button>')
        compose_btns = "".join(cbtn)
        modal = (f'<div id="m" class="modalbg" onclick="if(event.target===this)closeModal()"><div class="modal" style="max-height:85vh;display:flex;flex-direction:column">'
                 f'<div class="between" style="flex:0 0 auto"><h3 id="mtitle" style="margin:0">New {entlabel}</h3><button class="btn ghost iconbtn" onclick="closeModal()">{icon("x", 16)}</button></div>'
                 f'<div class="mbody" id="mform">{fields}<div id="msys" class="detailgrid" style="margin-top:8px"></div></div>'
                 f'<div class="flex" style="flex:0 0 auto;border-top:1px solid var(--line);padding-top:12px;margin-top:6px"><button class="btn primary" onclick="save()">{icon("check", 16)} Save</button>'
                 f'{compose_btns}'
                 f'<button class="btn ghost tiny hide" id="delBtn" onclick="del()">{icon("x", 16)} Delete</button>'
                 f'<span id="msg" class="muted tiny"></span></div></div></div>')
        pv_modal = (f'<div id="pv" class="modalbg" onclick="if(event.target===this)closePreview()"><div class="modal" style="max-width:780px;max-height:92vh;display:flex;flex-direction:column">'
                    f'<div class="between" style="flex:0 0 auto"><h3 style="margin:0">Preview</h3><div class="flex">'
                    f'<button class="btn ghost tiny" id="pvD" onclick="setPv(\'d\')">{icon("monitor", 14)} Desktop</button>'
                    f'<button class="btn ghost tiny" id="pvM" onclick="setPv(\'m\')">{icon("smartphone", 14)} Mobile</button>'
                    f'<button class="btn ghost iconbtn" onclick="closePreview()">{icon("x", 16)}</button></div></div>'
                    f'<div class="muted tiny" id="pvsub" style="flex:0 0 auto;margin:8px 2px"></div>'
                    f'<div class="pvstage"><div class="pvframe" id="pvframe"><iframe id="pvif" title="email preview"></iframe></div></div>'
                    f'</div></div>') if (body_field and in_scope(entity, "preview_desktop", "preview_mobile")) else ""
        # entities with a scheduled_at timestamp + a schedule transition get a date-time picker for the schedule action
        sched_field = next((f["name"] for f in ents[entity]["fields"] if (f.get("type") == "timestamp" and "schedul" in f["name"].lower())), None)
        if not any(tr["action"] == "schedule" for tr in lifecycle.get(entity, [])):
            sched_field = None
        sch_modal = (f'<div id="sch" class="modalbg" onclick="if(event.target===this)closeSchedule()"><div class="modal" style="max-width:440px">'
                     f'<div class="between"><h3 style="margin:0">Schedule send</h3><button class="btn ghost iconbtn" onclick="closeSchedule()">{icon("x", 16)}</button></div>'
                     f'<p class="muted tiny" style="margin:8px 0 10px">Pick when this {entlabel.lower()} should send. A tick checks every minute and sends due campaigns automatically.</p>'
                     f'<div class="field"><label>Send at (your local time)</label><input class="input" type="datetime-local" id="schAt"></div>'
                     f'<div class="flex" style="margin-top:14px"><button class="btn primary" onclick="doSchedule()">{icon("file-clock", 16)} Schedule</button><span id="schMsg" class="muted tiny"></span></div>'
                     f'</div></div>') if sched_field else ""
    elif ui.get("row_detail_modal"):
        detail = ('<div id="d" class="modalbg" onclick="if(event.target===this)closeDetail()"><div class="modal" style="max-height:85vh;overflow:auto">'
                  f'<div class="between"><h3 style="margin:0">Details</h3><button class="btn ghost iconbtn" onclick="closeDetail()">{icon("x", 16)}</button></div>'
                  '<div id="dbody" class="detailgrid"></div></div></div>')
    rcv = j.get("receive")
    rcvbanner = (f'<div class="bulkbar hide" id="rcvbanner"><b id="rcvn">0</b> <span id="rcvnoun"></span> from the directory &middot; <button class="btn primary tiny" onclick="openNew()">{icon("mail", 14)} New campaign for them</button> <button class="btn ghost tiny" onclick="clearReceive()">Clear</button></div>') if (rcv and shape == "manage") else ""
    tabs = j.get("tabs", [])
    tabs_html = ('<div class="wtabs">' + "".join('<button class="wtab' + (' on' if _i == 0 else '') + '" onclick="setTab(' + str(_i) + ')">' + _t["label"] + '</button>' for _i, _t in enumerate(tabs)) + '</div>') if tabs else ""
    body = (f'{stepper}{toolbar}{rcvbanner}<section><div class="head"><div><h3>{label(entity)}</h3></div>{new_btn}</div>{bulkbar}{tabs_html}'
            f'<div class="tablewrap"><table><thead><tr>{thead}</tr></thead><tbody id="rows"></tbody></table></div>{pager}</section>{modal}{detail}{more_modal}{pv_modal}{sch_modal}')
    script = f"""const ENTITY={json.dumps(entity)};const ENT={json.dumps(entlabel)};const COLS={json.dumps(cols)};const ACTS={json.dumps(acts)};const SCOPED={scoped};const FK={json.dumps(fk_map(entity, ents))};const DOWNLOAD={str(download).lower()};const CREATE_STATUS={json.dumps(create_status)};const FILTERS={json.dumps([{"name": f["name"], "type": f["type"]} for f in filters])};const SYS={json.dumps(sys_names)};const SPAN={span};const MANAGE={"true" if shape == "manage" else "false"};const DELETABLE={json.dumps(deletable)};const DATECOLS={json.dumps(datecols)};const TRANS={json.dumps(trans)};const BULK={json.dumps(bulk)};const RECEIVE={json.dumps(rcv)};const SCHEDULE_FIELD={json.dumps(sched_field if shape == "manage" else None)};const BUILDER={json.dumps(j.get('builder'))};const CREATE_DEFAULTS={json.dumps(j.get('create_defaults', {}))};const TOGGLES={json.dumps(toggles_e)};const ACT_ICONS={json.dumps(act_icons)};const ALL_TRANS={json.dumps(all_trans)};const ALL_ACT_ICONS={json.dumps(all_act_icons)};const TABS={json.dumps(tabs)};
let ALL=[],PAGE=1,PSIZE=25,EDIT_ID=null,SEL=new Set(),TAB=0;
function svgIcon(n){{const i=document.createElement('i');i.setAttribute('data-lucide',n);i.setAttribute('width','16');i.setAttribute('height','16');return i;}}
function val(id){{const e=document.getElementById(id);return e?(e.type==='checkbox'?(e.checked?'1':''):e.value):'';}}
function filtered(){{let rows=ALL.filter(x=>!SCOPED||x.school_id===schoolId());const q=val('q').toLowerCase();if(TABS.length&&TABS[TAB]&&TABS[TAB].status.length)rows=rows.filter(x=>TABS[TAB].status.includes(x.status));
  if(q)rows=rows.filter(x=>COLS.some(c=>String(x[c]??'').toLowerCase().includes(q))||String(x.name??'').toLowerCase().includes(q)||String(x.coordinator_email??'').toLowerCase().includes(q));
  for(const f of FILTERS){{const v=val('f_'+f.name);if(!v)continue;
    if(f.type==='boolean')rows=rows.filter(x=>!x[f.name]);
    else if(f.type==='text')rows=rows.filter(x=>String(x[f.name]??'').toLowerCase().includes(v.toLowerCase()));
    else rows=rows.filter(x=>String(x[f.name]??'')===v);}}
  return rows;}}
function render(){{const rows=filtered();const pages=Math.max(1,Math.ceil(rows.length/PSIZE));if(PAGE>pages)PAGE=pages;if(PAGE<1)PAGE=1;const pr=rows.slice((PAGE-1)*PSIZE,(PAGE-1)*PSIZE+PSIZE);
  const tb=document.getElementById('rows');tb.replaceChildren();
  if(!pr.length){{const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=SPAN;td.className='muted';td.textContent='No matches.';tr.appendChild(td);tb.appendChild(tr);}}
  else for(const x of pr){{const tr=document.createElement('tr');tr.style.cursor='pointer';tr.addEventListener('click',()=>MANAGE?openEdit(x):showDetail(x));if(BULK)addCb(tr,x);
    for(const c of COLS){{const td=document.createElement('td');td.textContent=DATECOLS.includes(c)?fmtDate(x[c]):(x[c]??'');tr.appendChild(td);}}
    if(DOWNLOAD){{const td=document.createElement('td');const b=document.createElement('button');b.className='btn secondary tiny';b.textContent='Download';b.addEventListener('click',(ev)=>{{ev.stopPropagation();toast('Signed download — wired at the file phase');}});td.appendChild(b);tr.appendChild(td);}}
    if(ACTS.length||TOGGLES.length||ALL_TRANS.length){{const td=document.createElement('td');td.style.whiteSpace='nowrap';const avail=ACTS.filter(a=>(TRANS[a]||['any']).some(fr=>fr==='any'||fr===x.status));for(const a of avail){{const b=document.createElement('button');b.className='iconact';b.title=a.replace(/_/g,' ');b.appendChild(svgIcon(ACT_ICONS[a]||'play'));b.addEventListener('click',(ev)=>{{ev.stopPropagation();if(a==='schedule'&&SCHEDULE_FIELD){{openSchedule(x.id);}}else{{act(x.id,a);}}}});td.appendChild(b);}}for(const tg of TOGGLES){{const on=!!x[tg.field];const b=document.createElement('button');b.className='iconact'+(on?' on':'');b.title=on?tg.off:tg.on;b.appendChild(svgIcon(on?tg.off_ic:tg.on_ic));b.addEventListener('click',(ev)=>{{ev.stopPropagation();toggleField(x.id,tg.field,!on);}});td.appendChild(b);}}if(ALL_TRANS.length){{const mb=document.createElement('button');mb.className='iconact';mb.title='All actions';mb.appendChild(svgIcon('chevron-down'));mb.addEventListener('click',(ev)=>{{ev.stopPropagation();openMore(x);}});td.appendChild(mb);}}tr.appendChild(td);}}
    tb.appendChild(tr);}}
  const info=document.getElementById('pinfo');if(info)info.textContent='Page '+PAGE+' of '+pages+' · '+rows.length+' rows';updateBulk();
  const cnt={{}};ALL.forEach(x=>{{cnt[x.status]=(cnt[x.status]||0)+1;}});document.querySelectorAll('.step').forEach(st=>{{const c=cnt[st.dataset.st]||0;st.querySelector('.cnt').textContent=c;st.classList.toggle('on',c>0);}});if(window.lucide)lucide.createIcons();}}
function pg(d){{PAGE+=d;render();}}
function setTab(i){{TAB=i;document.querySelectorAll('.wtab').forEach(function(e,k){{e.classList.toggle('on',k===i);}});PAGE=1;render();}}
function setPsize(v){{PSIZE=Number(v);PAGE=1;render();}}
function addCb(tr,x){{const td=document.createElement('td');const cb=document.createElement('input');cb.type='checkbox';cb.checked=SEL.has(x.id);cb.addEventListener('click',ev=>ev.stopPropagation());cb.addEventListener('change',()=>{{cb.checked?SEL.add(x.id):SEL.delete(x.id);updateBulk();}});td.appendChild(cb);tr.appendChild(td);}}
function updateBulk(){{if(!BULK)return;const bar=document.getElementById('bulkbar');if(!bar)return;document.getElementById('bulkn').textContent=SEL.size;bar.classList.toggle('hide',SEL.size===0);}}
function toggleAll(on){{for(const x of filtered())on?SEL.add(x.id):SEL.delete(x.id);render();}}
function clearSel(){{SEL.clear();const sa=document.getElementById('selall');if(sa)sa.checked=false;render();}}
function doBulk(){{if(!SEL.size)return;localStorage.setItem(BULK.key,JSON.stringify([...SEL]));location.href=BULK.to;}}
async function load(){{const r=await fetch('/api/'+ENTITY);const j=await r.json();ALL=j.data||[];PAGE=1;render();if(RECEIVE&&localStorage.getItem(RECEIVE.key)){{const n=(JSON.parse(localStorage.getItem(RECEIVE.key)||'[]')||[]).length;const e=document.getElementById('rcvn');if(e){{e.textContent=n;document.getElementById('rcvnoun').textContent=(RECEIVE.noun||'items')+' selected';document.getElementById('rcvbanner').classList.remove('hide');}}}}}}
function clearReceive(){{if(RECEIVE)localStorage.removeItem(RECEIVE.key);const b=document.getElementById('rcvbanner');if(b)b.classList.add('hide');}}
async function act(id,a){{const r=await fetch('/api/'+ENTITY+'/'+id+'/'+a,{{method:'POST'}});const j=await r.json();const m=document.getElementById('msg');if(m)m.textContent=j.ok?(a.replace(/_/g,' ')+' done'):(a.replace(/_/g,' ')+' blocked: '+(j.code||''));load();}}
async function toggleField(id,field,val){{await fetch('/api/'+ENTITY+'/'+id,{{method:'PATCH',headers:{{'content-type':'application/json'}},body:JSON.stringify({{[field]:val}})}});load();}}
function openMore(x){{const b=document.getElementById('moreBody');b.replaceChildren();document.getElementById('moreTitle').textContent='Actions — '+(x.name||x.id);
  for(const tr of ALL_TRANS){{const active=tr.staff&&(tr.from===x.status||tr.from==='any');const row=document.createElement('div');row.className='actrow'+(active?'':' muted');
    const ic=document.createElement('span');ic.className='ai';ic.appendChild(svgIcon(ALL_ACT_ICONS[tr.action]||'play'));
    const lab=document.createElement('div');lab.style.flex='1';const nm=document.createElement('div');nm.style.fontWeight='700';nm.style.fontSize='13px';nm.textContent=tr.action.replace(/_/g,' ');const sub=document.createElement('div');sub.className='muted tiny';sub.textContent=(tr.staff?'You':'School / system')+' · '+tr.from+' → '+tr.to;lab.append(nm,sub);
    const right=document.createElement('div');if(active){{const btn=document.createElement('button');btn.className='btn secondary tiny';btn.textContent='Do';btn.onclick=()=>{{if(tr.action==='schedule'&&SCHEDULE_FIELD){{openSchedule(x.id);closeMore();}}else{{act(x.id,tr.action);closeMore();}}}};right.appendChild(btn);}}else{{const tnote=document.createElement('span');tnote.className='muted tiny';tnote.textContent=tr.staff?('needs '+tr.from):'school-driven';right.appendChild(tnote);}}
    row.append(ic,lab,right);b.appendChild(row);}}
  document.getElementById('more').classList.add('open');if(window.lucide)lucide.createIcons();}}
function closeMore(){{document.getElementById('more').classList.remove('open');}}
async function populateFk(){{for(const f in FK){{const sel=document.getElementById('fk_'+f);if(!sel)continue;const r=await fetch('/api/'+FK[f]);const j=await r.json();
  const opts=(j.data||[]).filter(x=>!x.school_id||x.school_id===schoolId());sel.replaceChildren();const o0=document.createElement('option');o0.value='';o0.textContent='Select…';sel.appendChild(o0);
  for(const x of opts){{const o=document.createElement('option');o.value=x.id;o.textContent=(x.name||x.participation_code||x.olympiad_code||x.result_code||x.candidate_id||x.id);sel.appendChild(o);}}}}}}
function openNew(){{if(BUILDER){{location.href=BUILDER;return;}}EDIT_ID=null;document.getElementById('mtitle').textContent='New '+ENT;document.querySelectorAll('#mform [name]').forEach(el=>{{el.value='';}});document.getElementById('msys').replaceChildren();document.getElementById('delBtn').classList.add('hide');document.getElementById('msg').textContent='';populateFk();document.getElementById('m').classList.add('open');}}
async function openEdit(x){{if(BUILDER){{location.href=BUILDER+'?id='+x.id;return;}}EDIT_ID=x.id;document.getElementById('mtitle').textContent='Edit '+ENT;await populateFk();
  document.querySelectorAll('#mform [name]').forEach(el=>{{el.value=(x[el.name]??'');}});
  const sys=document.getElementById('msys');sys.replaceChildren();for(const k of SYS){{const r=document.createElement('div');r.className='drow';const a=document.createElement('span');a.className='dk';a.textContent=k.replace(/_/g,' ');const v=document.createElement('span');v.className='dv';v.textContent=(x[k]==null||x[k]==='')?'—':fmtVal(x[k]);r.append(a,v);sys.appendChild(r);}}
  document.getElementById('delBtn').classList.toggle('hide',!(DELETABLE&&x.status===DELETABLE));document.getElementById('msg').textContent='';document.getElementById('m').classList.add('open');}}
async function save(){{const _ve=validate(document.getElementById('m'));if(_ve){{document.getElementById('msg').textContent=_ve;return;}}const input={{}};document.querySelectorAll('#mform [name]').forEach(el=>{{if(el.value!==''||EDIT_ID)input[el.name]=el.value;}});if(SCOPED)input.school_id=schoolId();
  let r;if(EDIT_ID){{r=await fetch('/api/'+ENTITY+'/'+EDIT_ID,{{method:'PATCH',headers:{{'content-type':'application/json'}},body:JSON.stringify(input)}});}}
  else{{Object.assign(input,CREATE_DEFAULTS);if(RECEIVE&&localStorage.getItem(RECEIVE.key))input[RECEIVE.field]=localStorage.getItem(RECEIVE.key);if(CREATE_STATUS)input.status=CREATE_STATUS;r=await fetch('/api/'+ENTITY,{{method:'POST',headers:{{'content-type':'application/json'}},body:JSON.stringify(input)}});}}
  const j=await r.json();document.getElementById('msg').textContent=j.ok?'Saved.':errText(j);if(j.ok){{if(RECEIVE){{localStorage.removeItem(RECEIVE.key);const _rb=document.getElementById('rcvbanner');if(_rb)_rb.classList.add('hide');}}closeModal();load();}}}}
function del(){{if(!EDIT_ID)return;ask({{title:'Delete '+ENT,desc:'This cannot be undone.',confirm:true,danger:true,okLabel:'Delete',ok:async function(){{await fetch('/api/'+ENTITY+'/'+EDIT_ID,{{method:'DELETE'}});closeModal();load();toast(ENT+' deleted');}}}});}}
function closeModal(){{const m=document.getElementById('m');if(m)m.classList.remove('open');}}
function showDetail(x){{const g=document.getElementById('dbody');if(!g)return;g.replaceChildren();for(const k in x){{const r=document.createElement('div');r.className='drow';const a=document.createElement('span');a.className='dk';a.textContent=k.replace(/_/g,' ');const v=document.createElement('span');v.className='dv';v.textContent=(x[k]===null||x[k]===''||x[k]===undefined)?'—':fmtVal(x[k]);r.append(a,v);g.appendChild(r);}}document.getElementById('d').classList.add('open');}}
function closeDetail(){{const d=document.getElementById('d');if(d)d.classList.remove('open');}}
function openGuide(){{const g=document.getElementById('g');if(g)g.classList.add('open');}}
function closeGuide(){{const g=document.getElementById('g');if(g)g.classList.remove('open');}}
load();"""
    return body, script


def portal_page(j, nav, symbols, body, script, portal, shell):
    title, desc, scope = j["title"], j["desc"], j["scope"]
    brand, navlabel = portal["brand"], portal["navlabel"]
    picker = "" if (not portal["scoped"] or scope == "public") else ('<div class="field" style="min-width:200px;margin:0"><label class="tiny muted">Acting as school (until login)</label>'
                                           '<select class="select" id="schoolPicker" onchange="setSchool(this.value)"></select></div>')
    # universal top bar — projected from spec/app_shell.json onto every page (notifications + account menu)
    n = shell.get("notifications", {}).get("badge", 0)
    badge = '<span class="badge" id="notifBadge" style="display:none">0</span>'
    acct_items = "".join(f'<div class="ditem" onclick="shellAction(\'{m["action"]}\')">{icon(m["icon"], 16)} <span>{m["label"]}</span></div>' for m in shell["account"]["menu"])
    topbar = (f'<div class="topright">{picker}'
              f'<div class="acct"><button class="iconbtn" title="Notifications" onclick="toggleMenu(\'notifMenu\')">{icon("bell")}{badge}</button>'
              f'<div class="dropdown" id="notifMenu"><div class="ditem" style="cursor:default;color:var(--muted)">No new notifications</div></div></div>'
              f'<div class="acct"><button class="avatar" title="Account" onclick="toggleMenu(\'acctMenu\')">{shell["account"].get("avatar", "U")}</button>'
              f'<div class="dropdown" id="acctMenu">{acct_items}</div></div></div>')
    tz = shell.get("timezone", {})
    tz_script = (f"const TZ={{mode:{json.dumps(tz.get('mode','auto'))},zone:{json.dumps(tz.get('zone','Asia/Kolkata'))}}};"
                 "function tzOpts(){return TZ.mode==='fixed'?{timeZone:TZ.zone}:{};}"
                 "function fmtDate(v){if(!v)return'';const d=new Date(v);if(isNaN(d.getTime()))return String(v);return d.toLocaleDateString('en-GB',{...tzOpts(),day:'2-digit',month:'2-digit',year:'2-digit'});}"
                 "function fmtDateTime(v){if(!v)return'';const d=new Date(v);if(isNaN(d.getTime()))return String(v);return d.toLocaleString('en-GB',{...tzOpts(),day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit',timeZoneName:'short'});}"
                 "function isTs(v){return typeof v==='string'&&v.length>=19&&v[4]==='-'&&v[7]==='-'&&v[10]==='T';}"
                 "function isDate(v){return typeof v==='string'&&v.length===10&&v[4]==='-'&&v[7]==='-';}"
                 "function fmtVal(v){return isTs(v)?fmtDateTime(v):isDate(v)?fmtDate(v):(v==null?'':v);}"
                 "async function pinLookup(el){const v=el.value.replace(/[^0-9]/g,'').slice(0,6);el.value=v;if(v.length!==6)return;try{const r=await fetch('/api/pincode/'+v);const po=await r.json();if(!po||!po.city)return;const sc=el.closest('.modal')||el.closest('section')||document;const c=sc.querySelector('[name=city]');const s=sc.querySelector('[name=state]');if(c)c.value=po.city;if(s){if(s.tagName==='SELECT'){for(const o of s.options)if(o.value.toLowerCase()===String(po.state||'').toLowerCase())s.value=o.value;}else s.value=po.state||'';}const co=sc.querySelector('[name=country]');if(co)co.value='India';}catch(e){}}"
                 "function onlyDigits(el){el.value=el.value.replace(/[^0-9]/g,'');}"
                 "function onlyAlpha(el){el.value=el.value.replace(/[^A-Za-z .'-]/g,'');}"
                 "function fieldError(el){const k=el.dataset.kind,v=(el.value||'').trim();if(!v)return '';if(k==='email'&&!(v.indexOf('@')>0&&v.indexOf('.',v.indexOf('@')+1)>0))return 'Enter a valid email';if(k==='url'&&!(v.startsWith('http://')||v.startsWith('https://')))return 'Start with http:// or https://';if(k==='tel'&&v.length!==10)return 'Must be 10 digits';if(el.name==='pincode'&&v.length!==6)return 'Must be 6 digits';return '';}"
                 "function checkField(el){const e=fieldError(el);el.classList.toggle('invalid',!!e);const fe=el.parentElement&&el.parentElement.querySelector('.ferr');if(fe)fe.textContent=e;return e;}"
                 "function validate(scope){if(!scope)return '';for(const el of scope.querySelectorAll('[data-kind]')){const e=checkField(el);if(e){el.focus();return (el.name||'field').replace(/_/g,' ')+': '+e;}}return '';}"
                 "function stateToCountry(el){if(el.value){const sc=el.closest('.modal')||el.closest('section')||document;const co=sc.querySelector('[name=country]');if(co)co.value='India';}}"
                 "function pvBody(){const t=document.querySelector('#mform textarea');return t?t.value:'';}"
                 "function pvSubject(){const s=document.querySelector('#mform [name=subject]');return s?s.value:'';}"
                 "function pvFill(s){return String(s||'').replace(/{{\\s*school_name\\s*}}/gi,'Greenwood High').replace(/{{\\s*city\\s*}}/gi,'Pune').replace(/{{\\s*state\\s*}}/gi,'Maharashtra');}"
                 "function openPreview(){const pv=document.getElementById('pv');if(!pv)return;const sub=document.getElementById('pvsub');if(sub)sub.textContent='Subject: '+(pvFill(pvSubject())||'(none)');const f=document.getElementById('pvif');if(f)f.srcdoc=(pvFill(pvBody())||'<p style=\"font-family:system-ui;color:#999;padding:24px\">Empty body — paste HTML or text in the form, then Preview.</p>')+attachFooter(pvAttach());setPv('d');pv.classList.add('open');}"
                 "function setPv(m){const f=document.getElementById('pvframe');if(!f)return;f.classList.toggle('m',m==='m');const d=document.getElementById('pvD'),mo=document.getElementById('pvM');if(d)d.classList.toggle('pvon',m!=='m');if(mo)mo.classList.toggle('pvon',m==='m');}"
                 "function closePreview(){const p=document.getElementById('pv');if(p)p.classList.remove('open');}"
                 "function sendTest(){ask({title:'Send a test',desc:'Send this campaign to one inbox to check how it looks.',label:'Recipient email',kind:'email',placeholder:'you@example.com',okLabel:'Send test',ok:async function(to){const r=await fetch('/api/campaign/test',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:to,subject:pvSubject(),html:pvBody()+attachFooter(pvAttach())})});let j={};try{j=await r.json();}catch(e){}toast(j.accepted?('Test sent to '+to):('Test failed: '+(j.error||j.code||'error')),j.accepted?'ok':'err');}});}"
                 "let SCH_ID=null;"
                 "function openSchedule(id){SCH_ID=id;const el=document.getElementById('schAt');if(el)el.value='';const m=document.getElementById('schMsg');if(m)m.textContent='';const s=document.getElementById('sch');if(s)s.classList.add('open');}"
                 "function closeSchedule(){const s=document.getElementById('sch');if(s)s.classList.remove('open');}"
                 "async function doSchedule(){const at=document.getElementById('schAt').value;const m=document.getElementById('schMsg');if(!at){if(m)m.textContent='Pick a date & time';return;}if(new Date(at).getTime()<Date.now()){if(m)m.textContent='Pick a time in the future';return;}const patch={};patch[SCHEDULE_FIELD]=new Date(at).toISOString();await fetch('/api/'+ENTITY+'/'+SCH_ID,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify(patch)});const r=await fetch('/api/'+ENTITY+'/'+SCH_ID+'/schedule',{method:'POST'});const j=await r.json();if(j.ok){closeSchedule();load();}else{if(m)m.textContent='Schedule failed: '+(j.code||'');}}"
                 "function pvAttach(){const t=document.querySelector('#mform [name=attachments]');return t?t.value:'';}"
                 "function attachFooter(text){const a=String(text||'').split('\\n').map(l=>l.trim()).filter(Boolean).map(l=>{const i=l.indexOf('|');return i>=0?{name:l.slice(0,i).trim(),url:l.slice(i+1).trim()}:{name:(l.split('/').pop()||l),url:l};}).filter(x=>x.url);if(!a.length)return '';return '<div style=\"margin-top:24px;padding-top:12px;border-top:1px solid #eee;font-family:system-ui;font-size:13px\"><strong>Attachments</strong><ul>'+a.map(x=>'<li><a href=\"'+x.url+'\">'+x.name+'</a></li>').join('')+'</ul></div>';}"
                 "function insertImage(){ask({title:'Insert image',desc:'Paste a hosted image URL — added to the body as an image.',label:'Image URL',kind:'url',placeholder:'https://…/image.png',ok:function(u){const t=document.querySelector('#mform textarea');if(t){t.value+=(t.value?'\\n':'')+'<img src=\"'+u+'\" style=\"max-width:100%;height:auto\">';t.focus();}toast('Image inserted');}});}"
                 "let _askCb=null,_askKind='';"
                 "function ask(o){_askCb=o.ok||null;_askKind=o.kind||'';document.getElementById('askTitle').textContent=o.title||'';const d=document.getElementById('askDesc');d.textContent=o.desc||'';d.style.display=o.desc?'block':'none';document.getElementById('askField').style.display=o.confirm?'none':'block';const inp=document.getElementById('askInput');inp.value=o.value||'';inp.placeholder=o.placeholder||'';document.getElementById('askLabel').textContent=o.label||'';document.getElementById('askErr').textContent='';const ok=document.getElementById('askOk');ok.textContent=o.okLabel||(o.confirm?'Confirm':'OK');ok.className='btn '+(o.danger?'danger':'primary');document.getElementById('ask').classList.add('open');if(!o.confirm)setTimeout(function(){inp.focus();},60);}"
                 "function askClose(){document.getElementById('ask').classList.remove('open');_askCb=null;}"
                 "function askSubmit(){const inp=document.getElementById('askInput');const conf=document.getElementById('askField').style.display==='none';const v=(inp.value||'').trim();const e=document.getElementById('askErr');if(!conf){if(!v){e.textContent='Required';return;}if(_askKind==='email'&&!(v.indexOf('@')>0&&v.indexOf('.',v.indexOf('@')+1)>0)){e.textContent='Enter a valid email';return;}if(_askKind==='url'&&!(v.startsWith('http://')||v.startsWith('https://'))){e.textContent='Start with http:// or https://';return;}}const cb=_askCb;askClose();if(cb)cb(conf?true:v);}"
                 "function toast(msg,kind){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.className='toast show'+(kind?(' '+kind):'');setTimeout(function(){t.className='toast';},3200);}"
                 "function errText(j){if(j&&j.errors&&j.errors.length)return j.errors.map(function(e){return e.message;}).join(' · ');return (j&&j.code)||'Could not save — please check the form.';}")
    return f"""<!doctype html>
<html lang="en" data-theme="violet">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title} — Versa Schools</title><link rel="stylesheet" href="design.css"><style>.navgroup>summary{{display:flex;gap:10px;align-items:center;color:var(--muted);padding:10px 12px;border-radius:14px;font-size:13px;font-weight:700;cursor:pointer;list-style:none}}.navgroup>summary::-webkit-details-marker{{display:none}}.navgroup>summary::after{{content:"\\25B8";margin-left:auto;font-size:13px;color:var(--ink);opacity:.85;transition:transform .15s}}.navgroup[open]>summary::after{{transform:rotate(90deg)}}.navgroup>summary:hover{{color:var(--ink)}}.navgroup a{{padding-left:32px}}.side::-webkit-scrollbar{{width:7px}}.side::-webkit-scrollbar-thumb{{background:var(--line);border-radius:4px}}.top{{display:flex;align-items:center;gap:16px}}.topright{{display:flex;align-items:center;gap:10px;margin-left:auto}}.iconbtn{{position:relative;background:var(--panel);border:1px solid var(--line);width:38px;height:38px;border-radius:11px;display:grid;place-items:center;cursor:pointer;color:var(--muted)}}.iconbtn:hover{{color:var(--ink)}}.badge{{position:absolute;top:-5px;right:-5px;background:var(--a);color:#fff;font-size:9px;font-weight:800;min-width:15px;height:15px;border-radius:8px;display:grid;place-items:center;padding:0 3px}}.acct{{position:relative}}.avatar{{width:38px;height:38px;border-radius:50%;border:0;background:var(--a);color:#fff;font-weight:800;font-size:14px;cursor:pointer}}.dropdown{{position:absolute;right:0;top:48px;background:var(--panel);border:1px solid var(--line);border-radius:14px;box-shadow:0 14px 44px rgba(20,12,40,.18);padding:6px;min-width:200px;display:none;z-index:60}}.dropdown.open{{display:block}}.ditem{{display:flex;gap:10px;align-items:center;padding:9px 11px;border-radius:9px;color:var(--ink);text-decoration:none;font-size:13px;cursor:pointer}}.ditem:hover{{background:color-mix(in srgb,var(--a) 10%,transparent)}}.stepper{{display:flex;gap:7px;align-items:center;overflow-x:auto;padding:4px 0 18px}}.stepper .step{{display:flex;align-items:center;gap:7px;padding:7px 13px;border:1px solid var(--line);border-radius:999px;background:var(--panel);white-space:nowrap;font-size:12px;color:var(--muted)}}.stepper .step:before{{display:none!important;content:none!important}}.step.on{{color:var(--ink);border-color:color-mix(in srgb,var(--a) 55%,var(--line));background:color-mix(in srgb,var(--a) 7%,var(--panel))}}.arrow{{color:var(--muted);font-size:13px;opacity:.6;flex:0 0 auto}}.stephelp{{margin-left:8px;width:24px;height:24px;border-radius:50%;border:1px solid color-mix(in srgb,var(--a) 40%,var(--line));background:var(--panel);color:var(--a);font-weight:800;font-size:13px;cursor:pointer;flex:0 0 auto}}.stephelp:hover{{background:color-mix(in srgb,var(--a) 12%,transparent)}}.guide{{display:flex;flex-direction:column;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:12px;overflow:hidden}}.gstep{{background:var(--panel);padding:11px 14px}}.gname{{font-weight:800;font-size:13px;color:var(--ink);text-transform:capitalize}}.gtxt{{font-size:12.5px;color:var(--muted);margin-top:3px}}.gany{{margin-top:12px;font-size:12.5px;color:var(--muted);background:color-mix(in srgb,var(--a) 8%,transparent);border-radius:10px;padding:10px 13px}}.step .cnt{{background:color-mix(in srgb,var(--a) 14%,transparent);color:var(--a);border-radius:7px;padding:0 6px;font-weight:800;font-size:11px}}.kpirow{{display:flex;gap:12px;flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px}}.kpi{{flex:1 1 0;min-width:150px;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:16px 18px}}.kpi-l{{color:var(--muted);font-size:12px;font-weight:700;text-transform:capitalize}}.kpi-n{{color:var(--ink);font-size:30px;font-weight:800;margin-top:6px}}.kpimore{{display:none;flex-direction:row;flex-wrap:wrap;gap:12px;margin-top:14px}}.kpimore.open{{display:flex}}.wpanel{{display:none}}.wpanel.on{{display:block}}#maprows .drow{{align-items:center}}#maprows .select{{max-width:240px}}.toolbar{{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px}}.pager{{display:flex;gap:12px;align-items:center;justify-content:flex-end;margin-top:14px}}.hide{{display:none!important}}.mbody{{flex:1 1 auto;overflow:auto;padding:14px 6px 4px;margin-top:2px}}.mbody::-webkit-scrollbar{{width:8px}}.mbody::-webkit-scrollbar-thumb{{background:var(--line);border-radius:4px}}.fsec-h{{font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:var(--muted);font-weight:800;margin:12px 0 8px}}.input.invalid,.select.invalid{{border-color:#e5484d!important}}.ferr{{display:block;color:#e5484d;font-size:11px;margin-top:3px}}.bulkbar{{display:flex;gap:10px;align-items:center;background:color-mix(in srgb,var(--a) 10%,var(--panel));border:1px solid color-mix(in srgb,var(--a) 30%,var(--line));border-radius:12px;padding:9px 14px;margin-bottom:12px;font-size:13px}}.iconact{{width:30px;height:30px;border-radius:9px;border:1px solid var(--line);background:var(--panel);color:var(--muted);cursor:pointer;display:inline-grid;place-items:center;margin-right:5px;vertical-align:middle}}.iconact:hover{{color:var(--ink);border-color:color-mix(in srgb,var(--a) 45%,var(--line))}}.iconact.on{{color:var(--a);border-color:color-mix(in srgb,var(--a) 45%,var(--line))}}.actrow{{display:flex;align-items:center;gap:12px;padding:9px 2px;border-bottom:1px solid var(--line)}}.actrow.muted{{opacity:.55}}.actrow .ai{{width:30px;height:30px;border-radius:8px;border:1px solid var(--line);display:grid;place-items:center;color:var(--muted)}}.actrow:not(.muted) .ai{{color:var(--a);border-color:color-mix(in srgb,var(--a) 40%,var(--line))}}.kpibreak{{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px 14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;flex:1 1 240px;min-width:220px}}.kpibreak .kpi-l{{flex-basis:100%}}.chip{{background:color-mix(in srgb,var(--a) 12%,transparent);color:var(--a);border-radius:8px;padding:3px 9px;font-size:12px;font-weight:700}}.detailgrid{{display:grid;gap:1px;margin-top:14px;background:var(--line);border:1px solid var(--line);border-radius:12px;overflow:hidden}}.drow{{display:grid;grid-template-columns:170px 1fr;gap:12px;background:var(--panel);padding:10px 13px}}.dk{{color:var(--muted);font-size:12px;text-transform:capitalize}}.dv{{color:var(--ink);font-size:13px;word-break:break-word}}.pvstage{{flex:1 1 auto;overflow:auto;display:flex;justify-content:center;align-items:flex-start;background:color-mix(in srgb,var(--a) 5%,var(--panel));border:1px solid var(--line);border-radius:14px;padding:18px;margin-top:4px}}.pvframe{{width:640px;max-width:100%;height:62vh;background:#fff;border-radius:10px;box-shadow:0 8px 30px rgba(30,20,60,.14);overflow:hidden;transition:width .18s,border-radius .18s}}.pvframe.m{{width:360px;border:9px solid #2a2342;border-radius:26px}}.pvframe iframe{{width:100%;height:100%;border:0;background:#fff}}.pvon{{background:var(--a)!important;color:#fff!important;border-color:var(--a)!important}}.toast{{position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(20px);background:#2a2342;color:#fff;padding:11px 18px;border-radius:11px;font-size:13px;box-shadow:0 10px 30px rgba(20,12,40,.25);opacity:0;pointer-events:none;transition:.2s;z-index:200;max-width:80vw;text-align:center}}.toast.show{{opacity:1;transform:translateX(-50%) translateY(0)}}.toast.err{{background:#e5484d}}.toast.ok{{background:#16a34a}}.btn.danger{{background:#e5484d;color:#fff;border-color:#e5484d}}.builder{{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}}@media(max-width:1100px){{.builder{{grid-template-columns:1fr}}}}.bcompose{{display:flex;flex-direction:column;gap:14px}}.bsec>label,.bsec .between>label{{display:block;font-size:12px;font-weight:700;color:var(--muted);margin-bottom:5px}}.btabs{{display:flex;gap:4px}}.btoolbar{{display:flex;gap:4px;border:1px solid var(--line);border-bottom:0;border-radius:10px 10px 0 0;padding:6px;background:var(--panel)}}.tbtn{{width:30px;height:30px;border:1px solid var(--line);background:var(--panel);border-radius:7px;cursor:pointer;color:var(--ink);display:grid;place-items:center}}.tbtn:hover{{border-color:color-mix(in srgb,var(--a) 45%,var(--line));color:var(--a)}}.bedit{{border:1px solid var(--line);border-radius:0 0 10px 10px;min-height:230px;max-height:50vh;padding:14px;font-family:Arial,sans-serif;font-size:14px;background:#fff;color:#2a2342;overflow:auto}}.bedit:focus{{outline:2px solid color-mix(in srgb,var(--a) 40%,transparent)}}textarea.bedit{{font-family:monospace;font-size:12px;width:100%}}.brow{{display:flex;gap:8px;flex-wrap:wrap}}.bradio{{display:flex;gap:6px;align-items:center;font-size:13px;color:var(--ink);border:1px solid var(--line);border-radius:9px;padding:8px 12px;cursor:pointer}}.bsend{{display:flex;flex-direction:row;flex-wrap:wrap;gap:8px;align-items:center;border-top:1px solid var(--line);padding-top:14px}}.bpreview{{position:sticky;top:16px;border:1px solid var(--line);border-radius:14px;padding:16px;background:var(--panel)}}.bpreview .pvstage{{margin-top:0}}.bpreview .pvframe{{height:56vh}}.wtabs{{display:flex;gap:4px;margin-bottom:14px;border-bottom:1px solid var(--line)}}.wtab{{background:none;border:0;border-bottom:2px solid transparent;padding:8px 14px;font-size:13px;font-weight:700;color:var(--muted);cursor:pointer}}.wtab.on{{color:var(--a);border-bottom-color:var(--a)}}</style></head>
<body>
{symbols}
<div class="shell">
  <aside class="side" style="overflow:auto"><div class="brand"><div class="logo">V</div><div><h1>Versa</h1><p>{brand}</p></div></div>
    <nav class="nav"><div class="navlabel">{navlabel}</div>{nav}</nav></aside>
  <main><header class="top"><div><h3 style="margin:0">{title}</h3><p class="muted tiny" style="margin:2px 0 0">{desc}</p></div>{topbar}</header>
    <div class="page">{body}</div></main></div>
<div id="ask" class="modalbg" onclick="if(event.target===this)askClose()"><div class="modal" style="max-width:440px">
  <div class="between"><h3 id="askTitle" style="margin:0"></h3><button class="btn ghost iconbtn" onclick="askClose()">{icon("x", 16)}</button></div>
  <p class="muted tiny" id="askDesc" style="margin:8px 0 10px"></p>
  <div class="field" id="askField"><label id="askLabel"></label><input class="input" id="askInput" onkeydown="if(event.key==='Enter')askSubmit()"></div>
  <div class="flex" style="margin-top:14px"><button class="btn primary" id="askOk" onclick="askSubmit()">OK</button><button class="btn ghost" onclick="askClose()">Cancel</button><span id="askErr" class="tiny" style="color:#e5484d"></span></div>
</div></div>
<div id="toast" class="toast"></div>
<script src="/lucide.js"></script>
<script>
{tz_script}
const SK='versa_school';
function schoolId(){{return localStorage.getItem(SK)||'';}}
function setSchool(id){{localStorage.setItem(SK,id);location.reload();}}
async function initPicker(){{const r=await fetch('/api/schools');const j=await r.json();const data=j.data||[];
  if(!schoolId()&&data.length)localStorage.setItem(SK,data[0].id);
  const sel=document.getElementById('schoolPicker');if(sel){{sel.replaceChildren();for(const s of data){{const o=document.createElement('option');o.value=s.id;o.textContent=s.name;if(s.id===schoolId())o.selected=true;sel.appendChild(o);}}}}}}
function toggleMenu(id){{const m=document.getElementById(id);const o=m.classList.contains('open');document.querySelectorAll('.dropdown').forEach(d=>d.classList.remove('open'));if(!o)m.classList.add('open');}}
function shellAction(a){{toast(a.replace(/_/g,' ')+' — coming soon (wires at auth-last)');}}
document.addEventListener('click',e=>{{if(!e.target.closest('.acct'))document.querySelectorAll('.dropdown').forEach(d=>d.classList.remove('open'));}});
if(window.lucide)lucide.createIcons();
{script}
async function loadNotifs(){{try{{const r=await fetch('/api/notifications');const n=await r.json();const m=document.getElementById('notifMenu');m.replaceChildren();const b=document.getElementById('notifBadge');if(b){{b.textContent=n.length;b.style.display=n.length?'grid':'none';}}if(!n.length){{const d=document.createElement('div');d.className='ditem';d.style.color='var(--muted)';d.style.cursor='default';d.textContent='No new notifications';m.appendChild(d);}}else{{for(const x of n){{const d=document.createElement('div');d.className='ditem';d.style.cursor='default';d.textContent=x.text+(x.when?(' · '+x.when):'');m.appendChild(d);}}}}}}catch(e){{}}}}
initPicker();loadNotifs();
</script>
</body></html>
"""


PORTALS = [
    {"spec": "versa-oms/spec/school_journeys.json", "dir": "versa-oms/spec/derived/portal", "brand": "School Portal", "navlabel": "Your journey", "scoped": True},
    {"spec": "versa-oms/spec/staff_journeys.json", "dir": "versa-oms/spec/derived/staff", "brand": "Operations", "navlabel": "Operations", "scoped": False},
]


def inject_dashboards(journeys, portal):
    # synthesize a KPI dashboard at the head of each nav group — the section's default page (BRD §11)
    groups, seen, out = {}, set(), []
    for j in journeys:
        if j.get("group"): groups.setdefault(j["group"], []).append(j)
    for j in journeys:
        g = j.get("group")
        if g and g not in seen:
            seen.add(g)
            ents_seen, kpis = set(), []
            for x in groups[g]:
                if x.get("entity") and x["entity"] not in ents_seen:
                    ents_seen.add(x["entity"]); kpis.append({"entity": x["entity"], "label": label(x["entity"])})
            slug = "DASH-" + re.sub(r"[^A-Za-z0-9]+", "-", g).strip("-")
            out.append({"id": slug, "title": g + " overview", "desc": "KPIs across " + g + ".", "icon": "grid",
                        "shape": "dashboard", "group": g, "entity": None, "scope": "school" if portal["scoped"] else "all", "kpis": kpis})
        out.append(j)
    return out


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
    cat = json.loads(Path("versa-oms/spec/derived/rule_catalog.json").read_text(encoding="utf-8"))
    ent_lc = {}  # per-entity lifecycle transitions (for the stepper '?' guide — derived from BRD §07)
    for tr in cat.get("rules", {}).get("lifecycle", []):
        ent_lc.setdefault(tr["entity"], []).append(tr)
    src = DESIGN.read_text(encoding="utf-8")
    css = re.search(r"<style>(.*?)</style>", src, re.S)
    symbols = re.search(r'<svg width="0" height="0".*?</svg>', src, re.S)
    SYMBOLS = symbols.group(0) if symbols else ""
    _annp = Path(__file__).resolve().parents[2] / "spec" / "derived" / "annotations.json"
    ANN = json.loads(_annp.read_text(encoding="utf-8")) if _annp.exists() else {}
    def _esc(s): return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    total = 0
    for portal in PORTALS:
        spec = json.loads(Path(portal["spec"]).read_text(encoding="utf-8"))
        out = Path(portal["dir"]); out.mkdir(parents=True, exist_ok=True)
        for stale in out.glob("*.html"):
            stale.unlink()  # purge old screens so a removed/merged journey leaves no orphan file
        (out / "design.css").write_text((css.group(1) if css else "").strip() + "\n", encoding="utf-8")
        journeys = spec["journeys"]
        ui = shell.get("ui", {})
        if ui.get("section_dashboards"):
            journeys = inject_dashboards(journeys, portal)
        nav = build_nav(journeys)
        for j in journeys:
            body, script = build_body(j, ents, portal["scoped"], ui, ent_lc)
            _notes = [n for n in ANN.get(j["id"], []) if (n.get("bind") or {}).get("kind") != "field"]
            if _notes:
                _items = "".join('<li style="margin:3px 0"><b>' + _esc(n.get("type", "")) + '</b> · ' + _esc(n.get("note") or "(no note)") + (' — <code>' + _esc(n["selector"]) + '</code>' if n.get("selector") else '') + '</li>' for n in _notes)
                body = ('<details class="flownotes" style="margin:0 0 14px;border:1px dashed var(--line);border-radius:10px;padding:8px 12px;background:color-mix(in srgb,var(--a) 4%,transparent)"><summary style="cursor:pointer;font-size:12px;font-weight:700;color:var(--muted)">✎ Flow notes (' + str(len(_notes)) + ')</summary><ul style="margin:8px 0 2px;padding-left:18px;font-size:12px;color:var(--ink)">' + _items + '</ul></details>') + body
            (out / f'{j["id"]}.html').write_text(portal_page(j, nav, SYMBOLS, body, script, portal, shell), encoding="utf-8")
        (out / "index.html").write_text(f'<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url={journeys[0]["id"]}.html">\n', encoding="utf-8")
        total += len(journeys)
        print(f'gen_portal: {portal["brand"]} -> {len(journeys)} screens -> {out}/')
    print(f"gen_portal: {total} portal screens total across {len(PORTALS)} portals")


if __name__ == "__main__":
    main()
