#!/usr/bin/env python3
"""DEV TOOL (independent — NOT a gated robot, NOT in the pipeline, touches nothing we build) — generates
spec/derived/workflowbuilder.html, served at /workflowbuilder. A visual workflow builder: drag nodes
(triggers · UI components · actions · validations · logic · notes), join them, configure each (+ notes), then
Build -> a JSON the founder copies back so the assistant understands the intended workflow. Vendors Drawflow
(MIT, vanilla) inlined so the page is self-contained. Reusable picker pattern, like gen_iconpicker / gen_visualspec."""
import json
from pathlib import Path

DF_JS = Path("versa-oms/spec/derived/vendor/drawflow.min.js").read_text(encoding="utf-8")
DF_CSS = Path("versa-oms/spec/derived/vendor/drawflow.min.css").read_text(encoding="utf-8")
OUT = Path("versa-oms/spec/derived/workflowbuilder.html")


def _read(p):
    try:
        return json.loads(Path(p).read_text(encoding="utf-8"))
    except Exception:
        return {}


# BRD-driven option lists (read derived specs at gen time -> dropdowns; keeps the tool independent, no build coupling)
def build_src():
    canon = _read("versa-oms/spec/derived/canonical.json").get("entities", {})
    lc = _read("versa-oms/spec/derived/rule_catalog.json").get("rules", {}).get("lifecycle", [])
    ents = sorted(canon.keys())
    fields = sorted({f["name"] for e in canon.values() for f in e.get("fields", [])})
    refs = {en + "." + f["name"] for en, e in canon.items() for f in e.get("fields", [])}
    refs |= {"selected." + f["name"] for f in canon.get("schools", {}).get("fields", [])}
    actions = sorted({t["action"] for t in lc})
    statuses = sorted({v for e in canon.values() for f in e.get("fields", []) if f["name"] == "status" for v in (f.get("enum_values") or [])} | {"any"})
    screens = []
    for jp in ("versa-oms/spec/staff_journeys.json", "versa-oms/spec/school_journeys.json"):
        for j in _read(jp).get("journeys", []):
            screens.append(j["id"] + " — " + j.get("title", ""))
    return {"entities": ents, "fields": fields, "field_refs": sorted(refs), "actions": actions, "statuses": statuses, "screens": sorted(screens)}


SRC = build_src()
# which (node-type, field-key) pulls its suggestions from which BRD list
SRC_MAP = {
    ("page", "name"): "screens", ("form", "entity"): "entities", ("field", "name"): "fields", ("field", "prefill_from"): "field_refs",
    ("table", "entity"): "entities", ("create", "entity"): "entities", ("update", "entity"): "entities",
    ("transition", "entity"): "entities", ("transition", "action"): "actions", ("transition", "from"): "statuses", ("transition", "to"): "statuses",
    ("navigate", "to"): "screens", ("required", "field"): "fields", ("format", "field"): "fields", ("unique", "field"): "fields",
    ("selection", "entity"): "entities", ("selection", "from"): "screens", ("map", "from"): "field_refs", ("map", "to"): "field_refs",
    ("send_email", "to"): "field_refs",
}

# node catalog: cat -> color; each node = {type, name, ins, outs, fields:[{key,label,kind,opts?}]}
CATALOG = [
 # Triggers (a flow starts here)
 ("Triggers", "start", "Start", 0, 1, []),
 ("Triggers", "user_action", "User action", 0, 1, [{"key": "event", "label": "Event", "kind": "select", "opts": ["click", "submit", "select", "open", "upload"]}, {"key": "on", "label": "On (screen/button)", "kind": "text"}]),
 ("Triggers", "record_event", "Record event", 0, 1, [{"key": "entity", "label": "Entity", "kind": "text"}, {"key": "on", "label": "When", "kind": "select", "opts": ["created", "updated", "status_change", "deleted"]}]),
 ("Triggers", "schedule", "Schedule", 0, 1, [{"key": "when", "label": "When (cron / due)", "kind": "text"}]),
 ("Triggers", "webhook", "Webhook", 0, 1, [{"key": "path", "label": "Path", "kind": "text"}]),
 # UI / screen components
 ("UI", "page", "Page", 1, 1, [{"key": "name", "label": "Page name", "kind": "text"}, {"key": "scope", "label": "Scope", "kind": "select", "opts": ["staff", "school", "public"]}]),
 ("UI", "form", "Form", 1, 1, [{"key": "entity", "label": "Entity", "kind": "text"}]),
 ("UI", "field", "Field", 1, 1, [{"key": "name", "label": "Field name", "kind": "text"}, {"key": "type", "label": "Type", "kind": "select", "opts": ["text", "email", "url", "number", "date", "enum", "fk", "file"]}, {"key": "required", "label": "Required", "kind": "bool"}, {"key": "prefill_from", "label": "Prefill from", "kind": "text"}]),
 ("UI", "button", "Button", 1, 1, [{"key": "label", "label": "Label", "kind": "text"}, {"key": "action", "label": "Does (action)", "kind": "text"}, {"key": "carries", "label": "Carries data forward", "kind": "text"}, {"key": "shows_when", "label": "Shows when", "kind": "text"}]),
 ("UI", "table", "Table / list", 1, 1, [{"key": "entity", "label": "Entity", "kind": "text"}, {"key": "columns", "label": "Columns", "kind": "text"}]),
 ("UI", "modal", "Modal", 1, 1, [{"key": "title", "label": "Title", "kind": "text"}]),
 ("UI", "stepper", "Stepper", 1, 1, [{"key": "states", "label": "States (comma-sep)", "kind": "text"}]),
 # Actions / effects
 ("Actions", "create", "Create record", 1, 1, [{"key": "entity", "label": "Entity", "kind": "text"}]),
 ("Actions", "update", "Update record", 1, 1, [{"key": "entity", "label": "Entity", "kind": "text"}, {"key": "fields", "label": "Fields set", "kind": "text"}]),
 ("Actions", "transition", "Lifecycle transition", 1, 1, [{"key": "entity", "label": "Entity", "kind": "text"}, {"key": "action", "label": "Action", "kind": "text"}, {"key": "from", "label": "From", "kind": "text"}, {"key": "to", "label": "To", "kind": "text"}]),
 ("Actions", "send_email", "Send email", 1, 1, [{"key": "to", "label": "To", "kind": "text"}, {"key": "template", "label": "Template/subject", "kind": "text"}, {"key": "provider", "label": "Provider", "kind": "select", "opts": ["brevo", "console"]}]),
 ("Actions", "navigate", "Navigate", 1, 1, [{"key": "to", "label": "To page", "kind": "text"}]),
 ("Actions", "call_api", "Call API", 1, 1, [{"key": "method", "label": "Method", "kind": "select", "opts": ["GET", "POST", "PATCH", "DELETE"]}, {"key": "path", "label": "Path", "kind": "text"}]),
 ("Actions", "generate", "Generate doc", 1, 1, [{"key": "what", "label": "What", "kind": "text"}]),
 # Validations / guards
 ("Validation", "required", "Required", 1, 1, [{"key": "field", "label": "Field", "kind": "text"}]),
 ("Validation", "format", "Format check", 1, 1, [{"key": "field", "label": "Field", "kind": "text"}, {"key": "rule", "label": "Rule", "kind": "select", "opts": ["email", "url", "number", "digits", "alpha", "alphanumeric"]}]),
 ("Validation", "condition", "Condition / guard", 1, 1, [{"key": "expr", "label": "Expression", "kind": "text"}]),
 ("Validation", "unique", "Unique", 1, 1, [{"key": "field", "label": "Field", "kind": "text"}]),
 ("Validation", "permission", "Permission", 1, 1, [{"key": "who", "label": "Who (role)", "kind": "text"}]),
 # Logic / flow
 ("Logic", "branch", "Branch (if/else)", 1, 2, [{"key": "condition", "label": "Condition", "kind": "text"}]),
 ("Logic", "join", "Join / merge", 2, 1, []),
 ("Logic", "loop", "Loop / for-each", 1, 1, [{"key": "over", "label": "Over", "kind": "text"}]),
 ("Logic", "delay", "Delay / wait", 1, 1, [{"key": "duration", "label": "Duration", "kind": "text"}]),
 ("Logic", "end", "End", 1, 0, []),
 # Data flow between screens (carry the selected record · prefill a field · pass context)
 ("Data", "selection", "Selected record", 0, 1, [{"key": "entity", "label": "Entity", "kind": "text"}, {"key": "from", "label": "Selected on (screen)", "kind": "text"}]),
 ("Data", "map", "Map / prefill", 1, 1, [{"key": "from", "label": "From (source field)", "kind": "text"}, {"key": "to", "label": "To (target field)", "kind": "text"}]),
 ("Data", "context", "Pass context", 1, 1, [{"key": "data", "label": "Data passed", "kind": "text"}]),
 # Annotation
 ("Note", "note", "Note", 0, 0, [{"key": "text", "label": "Note", "kind": "textarea"}]),
]
COLORS = {"Triggers": "#16a34a", "UI": "#7c5cfc", "Actions": "#2563eb", "Validation": "#d97706", "Logic": "#64748b", "Data": "#0891b2", "Note": "#eab308"}
catalog = [{"cat": c, "type": t, "name": n, "ins": i, "outs": o, "fields": [dict(fld) for fld in f]} for (c, t, n, i, o, f) in CATALOG]
# annotate fields with their BRD source list (so the inspector offers real entities/fields/actions/statuses/screens)
for c in catalog:
    for fld in c["fields"]:
        s = SRC_MAP.get((c["type"], fld["key"]))
        if s:
            fld["src"] = s

HTML = r"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Versa Workflow Builder</title>
<style>__DFCSS__</style>
<style>
*{box-sizing:border-box}body{margin:0;font-family:system-ui,Segoe UI,sans-serif;color:#2a2342;background:#faf8ff;height:100vh;overflow:hidden}
.top{display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid #e6e0f5;background:#fff}
.top h1{font-size:15px;margin:0;font-weight:800}.top .muted{color:#8a82a8;font-size:12px}
.top input{padding:8px 11px;border:1px solid #e6e0f5;border-radius:9px;font-size:13px}
.btn{padding:8px 14px;border:1px solid #d9d2ee;border-radius:9px;background:#fff;font-weight:700;cursor:pointer;font-size:13px;color:#3a3357}
.btn.pri{background:#7c5cfc;color:#fff;border-color:#7c5cfc}.btn.dark{background:#3a3357;color:#fff;border:0}
.wrap{display:grid;grid-template-columns:210px 1fr 330px;height:calc(100vh - 53px)}
.pal{border-right:1px solid #e6e0f5;overflow:auto;padding:12px;background:#fff}
.pal .grp{font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:#9a92b5;font-weight:800;margin:14px 0 6px}
.pal .item{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid #eee;border-radius:9px;margin-bottom:6px;cursor:grab;font-size:13px;font-weight:600;background:#fff}
.pal .item:hover{border-color:#cdbcff;background:#f6f2ff}.pal .dot{width:9px;height:9px;border-radius:50%}
#drawflow{position:relative;width:100%;height:100%;background:#f3f0fb;background-image:radial-gradient(#ddd6f3 1px,transparent 1px);background-size:18px 18px}
.insp{border-left:1px solid #e6e0f5;background:#fff;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
.insp h3{font-size:13px;margin:0}.insp label{font-size:11px;font-weight:700;color:#8a82a8;display:block;margin-bottom:3px}
.insp input,.insp select,.insp textarea{width:100%;padding:8px 10px;border:1px solid #e6e0f5;border-radius:8px;font-size:13px;font-family:inherit}
.insp .fld{margin-bottom:8px}.insp .hint{color:#9a92b5;font-size:12px}
textarea#out{width:100%;height:200px;font-family:monospace;font-size:11px;border:1px solid #e6e0f5;border-radius:9px;padding:10px}
.wfn{min-width:150px}.wfn-h{display:flex;align-items:center;gap:6px;color:#fff;padding:5px 9px;border-radius:7px 7px 0 0;font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase}
.wfn-label{padding:8px 9px;font-size:13px;font-weight:600;background:#fff;border-radius:0 0 7px 7px}
.drawflow .drawflow-node{padding:0;border:1px solid #e3ddf3;border-radius:8px;box-shadow:0 4px 14px rgba(40,30,70,.10);background:#fff;width:auto}
.drawflow .drawflow-node.selected{box-shadow:0 0 0 3px #c9bcff}
.drawflow .drawflow-node .input,.drawflow .drawflow-node .output{background:#7c5cfc;border:2px solid #fff}
.drawflow .connection .main-path{stroke:#b3a4f0;stroke-width:2.5px}
</style></head><body>
<div class="top"><h1>Workflow Builder</h1><span class="muted">drag nodes &rarr; join &rarr; configure &rarr; Build</span>
  <input id="wfname" placeholder="Workflow name…" style="margin-left:8px;width:220px">
  <div style="margin-left:auto;display:flex;gap:8px">
    <button class="btn" onclick="clearAll()">Clear</button>
    <button class="btn" onclick="importJson()">Import &uarr;</button>
    <button class="btn pri" onclick="build()">Build JSON</button>
    <button class="btn dark" onclick="copyJson()">Copy</button></div></div>
<div class="wrap">
  <div class="pal" id="pal"></div>
  <div id="drawflow" ondrop="drop(event)" ondragover="event.preventDefault()"></div>
  <div class="insp"><h3 id="ititle">Select a node</h3><div id="ibody" class="hint">Click a node to edit its details &amp; notes. Drag from the left, or click a palette item to drop one in.</div>
    <div style="margin-top:auto"><label>Workflow JSON — <b>Build</b> to export, or paste a JSON &amp; <b>Import &uarr;</b> to load it onto the canvas</label><textarea id="out" placeholder='Paste a { "workflow": { "nodes": [...], "links": [...] } } here, then click Import ↑'></textarea></div></div>
</div>
<script>__DFJS__</script>
<script>
const CATALOG=__CATALOG__;const COLORS=__COLORS__;const SRC=__SRC__;
const byType={};CATALOG.forEach(c=>byType[c.type]=c);
const editor=new Drawflow(document.getElementById('drawflow'));editor.reroute=true;editor.start();
let SEL=null;
function renderPalette(){const p=document.getElementById('pal');const cats=[...new Set(CATALOG.map(c=>c.cat))];
  for(const cat of cats){const h=document.createElement('div');h.className='grp';h.textContent=cat;p.appendChild(h);
    for(const n of CATALOG.filter(c=>c.cat===cat)){const d=document.createElement('div');d.className='item';d.draggable=true;d.dataset.type=n.type;
      d.addEventListener('dragstart',e=>e.dataTransfer.setData('type',n.type));
      d.addEventListener('click',()=>addNodeAt(n.type,260,90+Math.random()*220));
      const dot=document.createElement('span');dot.className='dot';dot.style.background=COLORS[cat];const t=document.createElement('span');t.textContent=n.name;d.append(dot,t);p.appendChild(d);}}}
function nodeHtml(type,label){const c=byType[type];return '<div class="wfn"><div class="wfn-h" style="background:'+COLORS[c.cat]+'">'+c.name+'</div><div class="wfn-label">'+(label||c.name)+'</div></div>';}
function drop(e){e.preventDefault();const type=e.dataTransfer.getData('type');if(type)addNodeAt(type,e.clientX,e.clientY);}
function addNodeAt(type,cx,cy){const c=byType[type];const rect=editor.precanvas.getBoundingClientRect();
  const zoom=editor.zoom;const x=(cx-rect.left)/zoom;const y=(cy-rect.top)/zoom;
  const data={type:type,label:c.name,props:{},notes:''};c.fields.forEach(f=>{if(f.kind==='bool')data.props[f.key]=false;else data.props[f.key]='';});
  editor.addNode(type,c.ins,c.outs,x,y,'node-'+type,data,nodeHtml(type,c.name));}
function inspField(id,f,val){const wrap=document.createElement('div');wrap.className='fld';const lab=document.createElement('label');lab.textContent=f.label;wrap.appendChild(lab);
  let el;if(f.kind==='select'){el=document.createElement('select');for(const o of f.opts){const op=document.createElement('option');op.value=o;op.textContent=o;el.appendChild(op);}el.value=val||f.opts[0];}
  else if(f.kind==='bool'){el=document.createElement('select');['false','true'].forEach(o=>{const op=document.createElement('option');op.value=o;op.textContent=o;el.appendChild(op);});el.value=String(!!val);}
  else if(f.kind==='textarea'){el=document.createElement('textarea');el.rows=3;el.value=val||'';}
  else{el=document.createElement('input');el.value=val||'';if(f.src){el.setAttribute('list','dl_'+f.src);el.placeholder='from BRD — pick or type';}}
  el.addEventListener('input',()=>setProp(id,f.key,f.kind==='bool'?el.value==='true':el.value));wrap.appendChild(el);return wrap;}
function setProp(id,key,val){const n=editor.getNodeFromId(id);const d=n.data;d.props[key]=val;editor.updateNodeDataFromId(id,d);}
function setLabel(id,val){const n=editor.getNodeFromId(id);const d=n.data;d.label=val;editor.updateNodeDataFromId(id,d);const el=document.querySelector('#node-'+id+' .wfn-label');if(el)el.textContent=val||byType[d.type].name;}
function setNotes(id,val){const n=editor.getNodeFromId(id);const d=n.data;d.notes=val;editor.updateNodeDataFromId(id,d);}
function renderInspector(id){SEL=id;const n=editor.getNodeFromId(id);const d=n.data;const c=byType[d.type];
  document.getElementById('ititle').textContent=c.name;const b=document.getElementById('ibody');b.className='';b.replaceChildren();
  const lw=document.createElement('div');lw.className='fld';const ll=document.createElement('label');ll.textContent='Label';lw.appendChild(ll);const li=document.createElement('input');li.value=d.label||'';li.addEventListener('input',()=>setLabel(id,li.value));lw.appendChild(li);b.appendChild(lw);
  for(const f of c.fields)b.appendChild(inspField(id,f,d.props[f.key]));
  const nw=document.createElement('div');nw.className='fld';const nl=document.createElement('label');nl.textContent='Notes (free text for the assistant)';nw.appendChild(nl);const nt=document.createElement('textarea');nt.rows=4;nt.value=d.notes||'';nt.addEventListener('input',()=>setNotes(id,nt.value));nw.appendChild(nt);b.appendChild(nw);
  const del=document.createElement('button');del.className='btn';del.textContent='Delete node';del.style.marginTop='4px';del.onclick=()=>{editor.removeNodeId('node-'+id);document.getElementById('ititle').textContent='Select a node';b.className='hint';b.textContent='Click a node to edit.';};b.appendChild(del);}
editor.on('nodeSelected',id=>renderInspector(id));
function build(){const exp=editor.export();const home=(exp.drawflow.Home&&exp.drawflow.Home.data)||{};const nodes=[],links=[];
  for(const id in home){const n=home[id];const d=n.data||{};nodes.push({id:Number(id),type:d.type||n.name,label:d.label||'',props:d.props||{},notes:d.notes||''});
    for(const o in (n.outputs||{})){for(const cn of n.outputs[o].connections){links.push({from:Number(id),fromPort:o,to:Number(cn.node),toPort:cn.output});}}}
  const wf={workflow:{name:document.getElementById('wfname').value||'Untitled workflow',nodes:nodes,links:links}};
  document.getElementById('out').value=JSON.stringify(wf,null,2);}
function copyJson(){build();navigator.clipboard.writeText(document.getElementById('out').value);}
function clearAll(){if(confirm('Clear the whole canvas?'))editor.clear();document.getElementById('out').value='';}
function autoLayout(nodes,links){const level={};nodes.forEach(n=>level[n.id]=0);
  for(let k=0;k<nodes.length;k++){links.forEach(l=>{if(level[l.to]!=null&&level[l.from]!=null&&level[l.to]<level[l.from]+1)level[l.to]=level[l.from]+1;});}
  const rows={},pos={};nodes.forEach(n=>{const lv=level[n.id]||0;rows[lv]=rows[lv]||0;pos[n.id]={x:60+lv*250,y:50+rows[lv]*135};rows[lv]++;});return pos;}
function importJson(){const v=document.getElementById('out').value;let raw='';for(let i=0;i<v.length;i++){raw+=v.charCodeAt(i)<32?' ':v[i];}let data;try{data=JSON.parse(raw);}catch(e){alert('Invalid JSON: '+e.message+'\n\nTip: paste again — stray line-breaks inside a value can sneak in when copying.');return;}
  const wf=data.workflow||data;const nodes=wf.nodes||[];const links=wf.links||[];
  if(!nodes.length){alert('No nodes found in the JSON.');return;}
  editor.clear();if(wf.name)document.getElementById('wfname').value=wf.name;
  const pos=autoLayout(nodes,links);const idmap={};const skipped=[];
  for(const n of nodes){const c=byType[n.type];if(!c){skipped.push(n.type);continue;}
    const d={type:n.type,label:n.label||c.name,props:n.props||{},notes:n.notes||''};const p=pos[n.id]||{x:80,y:80};
    idmap[n.id]=editor.addNode(n.type,c.ins,c.outs,p.x,p.y,'node-'+n.type,d,nodeHtml(n.type,d.label));}
  for(const l of links){const a=idmap[l.from],b=idmap[l.to];if(a==null||b==null)continue;try{editor.addConnection(a,b,l.fromPort||'output_1',l.toPort||'input_1');}catch(e){}}
  document.getElementById('ititle').textContent='Imported '+nodes.length+' nodes — click any to edit';
  if(skipped.length)alert('Skipped unknown node types: '+[...new Set(skipped)].join(', '));}
function renderDatalists(){for(const k in SRC){const dl=document.createElement('datalist');dl.id='dl_'+k;for(const v of SRC[k]){const o=document.createElement('option');o.value=v;dl.appendChild(o);}document.body.appendChild(dl);}}
renderPalette();renderDatalists();
</script></body></html>"""

HTML = HTML.replace("__DFCSS__", DF_CSS).replace("__DFJS__", DF_JS).replace("__CATALOG__", json.dumps(catalog)).replace("__COLORS__", json.dumps(COLORS)).replace("__SRC__", json.dumps(SRC))
OUT.write_text(HTML, encoding="utf-8")
print(f"workflowbuilder: {len(catalog)} node types in {len(COLORS)} groups -> {OUT}")
