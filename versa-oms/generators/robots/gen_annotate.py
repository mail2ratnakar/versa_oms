#!/usr/bin/env python3
"""DEV TOOL (independent — NOT a gated robot, NOT in the pipeline) — generates spec/derived/annotate.html, served
at /annotate. Loads a REAL generated page in an iframe and lets you drop numbered callouts ON the actual elements
(click the page in Add mode), type the flow note for each, and export the annotations as JSON. The flow drawn on
top of the live screen — to see/communicate exactly where each step happens. Same-origin iframe, so it reads the
clicked element's selector too. Reads journey specs read-only; touches nothing we build."""
import json
from pathlib import Path

OUT = Path("versa-oms/spec/derived/annotate.html")
PORTALS = [("Staff", "versa-oms/spec/staff_journeys.json", "/staff/"),
           ("School", "versa-oms/spec/school_journeys.json", "/portal/")]


def screens():
    out = []
    for grp, spec, base in PORTALS:
        try:
            for j in json.loads(Path(spec).read_text(encoding="utf-8")).get("journeys", []):
                out.append({"label": grp + " · " + j["id"] + " — " + j.get("title", ""), "url": base + j["id"] + ".html"})
        except Exception:
            pass
    return out


SCREENS = screens()
DEFAULT = next((s["url"] for s in SCREENS if "OJ-O3B" in s["url"]), (SCREENS[0]["url"] if SCREENS else "/staff/OJ-O2.html"))

HTML = r"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Versa — Annotate a screen</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,sans-serif;color:#2a2342;background:#faf8ff;height:100vh;overflow:hidden}
.top{display:flex;align-items:center;gap:10px;padding:9px 16px;border-bottom:1px solid #e6e0f5;background:#fff}
.top b{font-size:14px}.top select,.top .btn{padding:7px 11px;border:1px solid #e6e0f5;border-radius:9px;font-size:13px;background:#fff;cursor:pointer}
.btn.on{background:#7c5cfc;color:#fff;border-color:#7c5cfc;font-weight:700}.btn.dark{background:#3a3357;color:#fff;border:0}
.muted{color:#8a82a8;font-size:12px}
.wrap{display:grid;grid-template-columns:1fr 320px;height:calc(100vh - 51px)}
.stage{overflow:auto;position:relative;background:#eee}
.canvas{position:relative;min-height:100%}
iframe#pg{width:100%;border:0;background:#fff;display:block}
#ov{position:absolute;inset:0;z-index:2}
#ov.add{cursor:crosshair}
.pin{position:absolute;z-index:3;transform:translate(-50%,-50%)}
.pin .num{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#7c5cfc;color:#fff;font-weight:800;font-size:13px;box-shadow:0 2px 8px rgba(80,40,160,.4);cursor:grab;border:2px solid #fff}
.pin .box{position:absolute;left:32px;top:-6px;width:200px;background:#2a2342;color:#fff;border-radius:9px;padding:7px 9px;font-size:12px;box-shadow:0 6px 20px rgba(20,12,40,.3)}
.pin .box textarea{width:100%;background:transparent;border:0;color:#fff;font:inherit;resize:vertical;outline:none;min-height:34px}
.pin .box::before{content:'';position:absolute;left:-6px;top:9px;border:6px solid transparent;border-right-color:#2a2342}
.side{border-left:1px solid #e6e0f5;background:#fff;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:8px}
.side h3{font-size:13px;margin:0}.row{display:flex;gap:8px;align-items:flex-start;border-bottom:1px solid #f2eefb;padding:7px 0;font-size:12.5px}
.row .n{width:20px;height:20px;border-radius:50%;background:#7c5cfc;color:#fff;display:grid;place-items:center;font-size:11px;font-weight:800;flex:0 0 auto}
.row .sel{color:#9a92b5;font-size:11px;font-family:monospace}
textarea#out{width:100%;height:150px;font-family:monospace;font-size:11px;border:1px solid #e6e0f5;border-radius:9px;padding:9px}
</style></head><body>
<div class="top"><b>Annotate</b>
  <select id="pick" onchange="loadScreen(this.value)">__OPTS__</select>
  <button class="btn" id="addbtn" onclick="toggleAdd()">+ Add note</button>
  <span class="muted" id="hint">pick a screen, click <b>+ Add note</b>, then click on the page where a step happens</span>
  <button class="btn dark" style="margin-left:auto" onclick="exportJson()">Export</button>
  <button class="btn" onclick="clearPins()">Clear</button></div>
<div class="wrap">
  <div class="stage"><div class="canvas" id="canvas"><iframe id="pg"></iframe><div id="ov"></div></div></div>
  <div class="side"><h3>Steps</h3><div id="list" class="muted">No notes yet.</div>
    <div style="margin-top:auto"><label class="muted">Annotation JSON — copy to me</label><textarea id="out" readonly></textarea></div></div>
</div>
<script>
const PINS=[];let ADD=false,N=0;
const ov=document.getElementById('ov'),pg=document.getElementById('pg'),canvas=document.getElementById('canvas');
function loadScreen(url){PINS.length=0;N=0;renderPins();pg.src=url;}
pg.addEventListener('load',()=>{try{const h=pg.contentDocument.body.scrollHeight;pg.style.height=Math.max(h,700)+'px';}catch(e){pg.style.height='1400px';}});
function toggleAdd(){ADD=!ADD;document.getElementById('addbtn').classList.toggle('on',ADD);ov.classList.toggle('add',ADD);document.getElementById('hint').textContent=ADD?'click on the page where a step happens':'pick a screen, click + Add note, then click the page';}
function selectorAt(cx,cy){try{const r=pg.getBoundingClientRect();ov.style.pointerEvents='none';const el=pg.contentDocument.elementFromPoint(cx-r.left,cy-r.top);ov.style.pointerEvents='';if(!el)return'';
  if(el.id)return'#'+el.id;const nm=el.getAttribute&&el.getAttribute('name');if(nm)return'['+'name='+nm+']';
  const t=(el.textContent||'').trim().slice(0,28);return el.tagName.toLowerCase()+(t?(' “'+t+'”'):'');}catch(e){return'';}}
ov.addEventListener('click',e=>{if(!ADD)return;const rect=canvas.getBoundingClientRect();const x=e.clientX-rect.left,y=e.clientY-rect.top;const sel=selectorAt(e.clientX,e.clientY);addPin(x,y,'',sel);});
function addPin(x,y,note,sel){N++;const p={n:N,x:x,y:y,note:note,sel:sel};PINS.push(p);renderPins();}
function renderPins(){[...ov.querySelectorAll('.pin')].forEach(e=>e.remove());
  for(const p of PINS){const d=document.createElement('div');d.className='pin';d.style.left=p.x+'px';d.style.top=p.y+'px';
    const num=document.createElement('span');num.className='num';num.textContent=p.n;
    const box=document.createElement('div');box.className='box';const ta=document.createElement('textarea');ta.value=p.note;ta.placeholder='what happens here…';ta.addEventListener('input',()=>{p.note=ta.value;renderList();});box.appendChild(ta);
    num.addEventListener('mousedown',ev=>startDrag(ev,p,d));
    d.append(num,box);ov.appendChild(d);}
  renderList();}
let drag=null;
function startDrag(ev,p,d){ev.preventDefault();drag={p,d};}
window.addEventListener('mousemove',e=>{if(!drag)return;const rect=canvas.getBoundingClientRect();drag.p.x=e.clientX-rect.left;drag.p.y=e.clientY-rect.top;drag.d.style.left=drag.p.x+'px';drag.d.style.top=drag.p.y+'px';});
window.addEventListener('mouseup',()=>{if(drag){drag=null;renderList();}});
function renderList(){const l=document.getElementById('list');if(!PINS.length){l.className='muted';l.textContent='No notes yet.';out();return;}l.className='';l.replaceChildren();
  for(const p of PINS){const r=document.createElement('div');r.className='row';const n=document.createElement('span');n.className='n';n.textContent=p.n;const b=document.createElement('div');b.style.flex='1';b.textContent=p.note||'(empty)';if(p.sel){const s=document.createElement('div');s.className='sel';s.textContent=p.sel;b.appendChild(s);}const x=document.createElement('span');x.style.cursor='pointer';x.textContent='×';x.onclick=()=>{const i=PINS.indexOf(p);PINS.splice(i,1);PINS.forEach((q,k)=>q.n=k+1);N=PINS.length;renderPins();};r.append(n,b,x);l.appendChild(r);}
  out();}
function out(){const url=document.getElementById('pick').value;document.getElementById('out').value=JSON.stringify({screen:url,annotations:PINS.map(p=>({n:p.n,note:p.note,selector:p.sel,x:Math.round(p.x),y:Math.round(p.y)}))},null,2);}
function exportJson(){out();navigator.clipboard.writeText(document.getElementById('out').value);document.getElementById('hint').textContent='copied!';}
function clearPins(){PINS.length=0;N=0;renderPins();}
loadScreen('__DEFAULT__');
</script></body></html>"""

opts = "".join(f'<option value="{s["url"]}"{" selected" if s["url"] == DEFAULT else ""}>{s["label"]}</option>' for s in SCREENS)
OUT.write_text(HTML.replace("__OPTS__", opts).replace("__DEFAULT__", DEFAULT), encoding="utf-8")
print(f"annotate: {len(SCREENS)} screens, default {DEFAULT} -> {OUT}")
