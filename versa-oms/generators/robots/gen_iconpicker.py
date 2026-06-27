#!/usr/bin/env python3
"""DEV TOOL (not a gated robot) — generates spec/derived/iconpicker.html: browse ALL Lucide icons and assign
one to each of our slots (ui/nav symbols + lifecycle actions). Export the JSON -> becomes spec/icon_map.json,
the central label<->icon dictionary gen_portal projects. Served by the dev server at /iconpicker."""
import json
import re
from pathlib import Path

DESIGN = Path("versa-oms/source-of-truth/design/versa_design_system.html")
CAT = Path("versa-oms/spec/derived/rule_catalog.json")
OUT = Path("versa-oms/spec/derived/iconpicker.html")

src = DESIGN.read_text(encoding="utf-8")
sb = re.search(r'<svg width="0" height="0".*?</svg>', src, re.S)
SYMBOLS = sb.group(0) if sb else ""
sym_names = sorted(set(re.findall(r'id="([a-z0-9-]+)"', SYMBOLS)))
cat = json.loads(CAT.read_text(encoding="utf-8"))
actions = sorted({t["action"] for t in cat["rules"].get("lifecycle", [])}) + ["unsubscribe", "resubscribe"]
slots = {"ui / nav symbols": sym_names, "lifecycle actions": actions}

HTML = r"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Versa Icon Picker (Lucide)</title>
<script src="https://unpkg.com/lucide@0.544.0"></script>
<style>
*{box-sizing:border-box}body{font-family:system-ui,Segoe UI,sans-serif;margin:0;background:#faf8ff;color:#2a2342}
.wrap{display:grid;grid-template-columns:1fr 380px;height:100vh}
.left{padding:20px;overflow:auto}.right{padding:20px;border-left:1px solid #e6e0f5;overflow:auto;background:#fff}
h1{font-size:17px;margin:0 0 12px}.muted{color:#8a82a8;font-size:12px}
#q{width:100%;padding:11px 13px;border:1px solid #e6e0f5;border-radius:11px;font-size:14px;margin:8px 0 14px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(94px,1fr));gap:8px}
.ic{display:flex;flex-direction:column;align-items:center;gap:7px;padding:11px 6px;border:1px solid #eee;border-radius:11px;cursor:pointer;background:#fff;font-size:10px;color:#6b6385;text-align:center;word-break:break-all}
.ic:hover{border-color:#7c5cfc;background:#f5f1ff}.ic.sel{border-color:#7c5cfc;background:#efeaff}.ic svg{width:22px;height:22px;color:#3a3357}
.preview{display:flex;gap:10px;align-items:center;margin:10px 0 16px;flex-wrap:wrap;min-height:36px}
.pbtn{display:inline-grid;place-items:center;width:34px;height:34px;border:1px solid #e6e0f5;border-radius:9px;background:#fff;color:#3a3357}
.ppill{display:inline-flex;gap:6px;align-items:center;padding:6px 11px;border-radius:999px;background:#efeaff;color:#7c5cfc;font-size:13px;font-weight:700}
.pbtn svg,.ppill svg{width:16px;height:16px}
.slot{display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid #f2eefb;font-size:13px}
.slot .cur,.slot .lu{width:22px;height:22px;display:grid;place-items:center}.slot .cur{color:#b3abc9}.slot .lu{color:#7c5cfc}
.slot .cur svg,.slot .lu svg{width:18px;height:18px}.slot .k{flex:1;font-family:monospace;font-size:12px}
.slot button{font-size:11px;padding:5px 9px;border:1px solid #d9d2ee;border-radius:8px;background:#7c5cfc;color:#fff;cursor:pointer;font-weight:700}
.grp{font-size:11px;text-transform:uppercase;letter-spacing:.09em;color:#9a92b5;font-weight:800;margin:16px 0 6px}
textarea{width:100%;height:170px;border:1px solid #e6e0f5;border-radius:11px;font-family:monospace;font-size:11px;padding:11px;margin-top:8px}
.cpy{margin-top:8px;padding:8px 14px;border:0;border-radius:9px;background:#3a3357;color:#fff;font-weight:700;cursor:pointer}
.sel-name{font-weight:800;color:#7c5cfc}
</style></head><body>
<div class="wrap">
  <div class="left"><h1>Lucide icons <span class="muted">— click one to select</span></h1>
    <input id="q" placeholder="Search (e.g. check, ban, mail, user)…" oninput="render()">
    <div class="muted" id="count"></div><div class="grid" id="grid" style="margin-top:10px"></div></div>
  <div class="right"><h1>Assign to our slots</h1>
    <div class="muted">Selected: <span class="sel-name" id="seln">— pick an icon on the left —</span></div>
    <div class="preview" id="prev"></div>
    <div id="slots"></div>
    <div class="grp">Central dictionary — copy &amp; paste back to me</div>
    <textarea id="out" readonly></textarea>
    <button class="cpy" onclick="navigator.clipboard.writeText(document.getElementById('out').value)">Copy JSON</button>
  </div>
</div>
<div style="position:absolute;width:0;height:0;overflow:hidden">__SYMBOLS__</div>
<script>
const SLOTS=__SLOTS__;const MAP={};let SEL=null,NAMES=[];
function kebab(n){return n.replace(/([a-z0-9])([A-Z])/g,'$1-$2').replace(/([A-Z]+)([A-Z][a-z])/g,'$1-$2').toLowerCase();}
function li(kn){const i=document.createElement('i');i.setAttribute('data-lucide',kn);return i;}
function render(){const q=document.getElementById('q').value.toLowerCase();const g=document.getElementById('grid');g.replaceChildren();let shown=0;
  for(const kn of NAMES){if(q&&!kn.includes(q))continue;shown++;const d=document.createElement('div');d.className='ic'+(SEL===kn?' sel':'');d.title=kn;
    d.appendChild(li(kn));const s=document.createElement('span');s.textContent=kn;d.appendChild(s);
    d.onclick=()=>{SEL=kn;document.getElementById('seln').textContent=kn;preview();render();};g.appendChild(d);}
  document.getElementById('count').textContent=shown+' of '+NAMES.length+' icons';lucide.createIcons();}
function preview(){const p=document.getElementById('prev');p.replaceChildren();if(!SEL)return;
  const b=document.createElement('span');b.className='pbtn';b.appendChild(li(SEL));
  const pill=document.createElement('span');pill.className='ppill';pill.appendChild(li(SEL));const t=document.createElement('span');t.textContent=SEL;pill.appendChild(t);
  p.append(b,pill);lucide.createIcons();}
function renderSlots(){const c=document.getElementById('slots');c.replaceChildren();
  for(const grp in SLOTS){const h=document.createElement('div');h.className='grp';h.textContent=grp;c.appendChild(h);
    for(const k of SLOTS[grp]){const row=document.createElement('div');row.className='slot';
      const cur=document.createElement('span');cur.className='cur';const sv=document.createElementNS('http://www.w3.org/2000/svg','svg');const u=document.createElementNS('http://www.w3.org/2000/svg','use');u.setAttribute('href','#'+k);sv.appendChild(u);cur.appendChild(sv);
      const kk=document.createElement('span');kk.className='k';kk.textContent=k;
      const lu=document.createElement('span');lu.className='lu';if(MAP[k])lu.appendChild(li(MAP[k]));
      const btn=document.createElement('button');btn.textContent='set';btn.onclick=()=>{if(!SEL){alert('Pick an icon first');return;}MAP[k]=SEL;out();renderSlots();};
      row.append(cur,kk,lu,btn);c.appendChild(row);}}
  lucide.createIcons();}
function out(){document.getElementById('out').value=JSON.stringify(MAP,null,2);}
function boot(){if(!window.lucide||!lucide.icons){document.getElementById('count').textContent='Lucide failed to load (needs internet for the CDN).';return;}
  NAMES=[...new Set(Object.keys(lucide.icons).map(kebab))].sort();render();renderSlots();out();}
window.addEventListener('load',()=>setTimeout(boot,250));
</script></body></html>"""

HTML = HTML.replace("__SYMBOLS__", SYMBOLS).replace("__SLOTS__", json.dumps(slots))
OUT.write_text(HTML, encoding="utf-8")
print(f"iconpicker: {len(sym_names)} ui symbols + {len(actions)} actions -> {OUT}")
