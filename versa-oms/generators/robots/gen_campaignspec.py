#!/usr/bin/env python3
"""DEV TOOL (not a gated robot) — generates spec/derived/campaignspec.html, served at /campaignspec.
A visual feature picker for the Email Campaigns page: every candidate feature from our BRD + Brevo / SendGrid /
Mailchimp / Listmonk + email best-practice, grouped by area. Click a feature -> its VISUAL mockup appears on the
right. Toggle Include (recommended pre-checked). Export the JSON = the scope decision -> we build OJ-O3 from it.
Reusable template for future feature discussions (swap the FEATURES catalog)."""
import json
from pathlib import Path

OUT = Path("versa-oms/spec/derived/campaignspec.html")

# cat, key, name, src[], rec, desc, preview(html mockup)
F = [
 # --- Editor & content ---
 ("Editor", "rich_editor", "Rich-text (WYSIWYG) editor", ["Brevo","Mailchimp","SendGrid"], True, "Format text/links/images visually — no code.",
  "<div class=mk><div class=tb><b>B</b><i>I</i><u>U</u> | A | &#128279; | &#128247;</div><div class=pg>Dear {{school_name}}, we invite <b>your school</b> to the 2026 Olympiad…</div></div>"),
 ("Editor", "drag_blocks", "Drag-and-drop blocks", ["Brevo","Mailchimp"], True, "Build the email from stackable blocks.",
  "<div class=mk><div class=blk>&#9776; Header</div><div class=blk>&#9776; Text</div><div class=blk>&#9776; Image</div><div class=blk>&#9776; Button</div><div class=blk dashed>+ add block</div></div>"),
 ("Editor", "html_paste", "Paste / edit raw HTML", ["Brevo","SendGrid","Mailchimp","Listmonk"], True, "Paste a designed HTML email or hand-edit.",
  "<div class=mk><pre class=code>&lt;table&gt;&lt;tr&gt;&lt;td&gt;\n  &lt;h1&gt;Olympiad 2026&lt;/h1&gt;\n&lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;</pre></div>"),
 ("Editor", "templates", "Saved templates", ["Brevo","Mailchimp","SendGrid","Listmonk"], True, "Reusable starting layouts.",
  "<div class=mk><div class=row><div class=thumb>Invite</div><div class=thumb>Reminder</div><div class=thumb>Results</div></div></div>"),
 ("Editor", "ai_draft", "AI-drafted content (paste in)", ["Brevo","Mailchimp"], False, "You generate copy/images elsewhere and attach here.",
  "<div class=mk><div class=ai>&#10024; Generate draft &rarr;</div><div class=pg>Draft inserted into the body…</div></div>"),

 # --- Attachments & media ---
 ("Attachments", "attach_files", "File attachments (PDF)", ["SendGrid","Listmonk"], False, "Attach a file. Brevo prefers a hosted link (deliverability).",
  "<div class=mk><span class=chip>&#128206; brochure.pdf 1.2MB &times;</span><span class=chip>&#128206; flyer.pdf &times;</span></div>"),
 ("Attachments", "image_host", "Hosted image library", ["Brevo","Mailchimp"], True, "Upload images; emails reference hosted URLs.",
  "<div class=mk><div class=row><div class=imgb>&#128247;</div><div class=imgb>&#128247;</div><div class=imgb dashed>+</div></div></div>"),
 ("Attachments", "video_thumb", "Video = thumbnail + link", ["best-practice"], True, "Email can't autoplay video — embed a play thumbnail linking to it.",
  "<div class=mk><div class=video>&#9654;<div class=play></div></div><div class=cap>Watch the 60s intro &rarr;</div></div>"),

 # --- Preview & test ---
 ("Preview & test", "preview_desktop", "Desktop preview", ["Brevo","Mailchimp","SendGrid","Listmonk"], True, "See the email as a desktop client renders it.",
  "<div class=mk><div class=mail><div class=mh>From: Versa · Subject: Olympiad 2026</div><div class=mb>Dear school, …</div></div></div>"),
 ("Preview & test", "preview_mobile", "Mobile preview", ["Brevo","Mailchimp"], True, "See the mobile rendering.",
  "<div class=mk><div class=phone><div class=notch></div><div class=mb small>Dear school,<br>…<br><span class=btnm>Register</span></div></div></div>"),
 ("Preview & test", "send_test", "Send a test email", ["Brevo","Mailchimp","SendGrid","Listmonk"], True, "Send a test to yourself before the real send.",
  "<div class=mk><input class=inp value='me@versa.example' readonly> <span class=btn>Send test</span></div>"),
 ("Preview & test", "inbox_preview", "Inbox rendering (Gmail/Outlook)", ["Litmus/premium"], False, "Cross-client rendering preview (paid integration).",
  "<div class=mk><div class=tabs><span class='tab on'>Gmail</span><span class=tab>Outlook</span><span class=tab>Apple</span></div><div class=mb>rendered…</div></div>"),
 ("Preview & test", "spam_score", "Spam-score check", ["Mailchimp","SendGrid"], False, "Score the email for spam triggers before sending.",
  "<div class=mk><div class=gauge>Spam score <b style='color:#16a34a'>1.2/10</b> &#9989; good</div></div>"),

 # --- Personalization ---
 ("Personalization", "merge_tags", "Merge tags ({{school_name}})", ["Brevo","Mailchimp","SendGrid","Listmonk"], True, "Per-recipient fields in subject/body.",
  "<div class=mk><div class=pg>Hi <span class=tag>{{school_name}}</span> in <span class=tag>{{city}}</span> —</div></div>"),
 ("Personalization", "conditional", "Conditional content", ["Brevo","SendGrid"], False, "Show/hide blocks by recipient attribute.",
  "<div class=mk><div class=cond>IF state = Karnataka &rarr; show <i>regional venue</i></div></div>"),

 # --- Recipients ---
 ("Recipients", "directory_select", "Target schools from the directory", ["Versa BRD"], True, "Select rows in the directory -> campaign targets (built).",
  "<div class=mk><div class=lr><input type=checkbox checked> Greenwood High</div><div class=lr><input type=checkbox checked> Sunrise Academy</div><div class=sel>2 selected &rarr; campaign</div></div>"),
 ("Recipients", "segments", "Segments / filters", ["Brevo","Mailchimp","SendGrid","Listmonk"], True, "Target by status/source/state instead of a manual pick.",
  "<div class=mk><span class=chip>status: prospect</span><span class=chip>state: MH</span><span class=chip>not unsubscribed</span></div>"),
 ("Recipients", "suppression", "Suppress unsubscribed / bounced", ["Brevo","Mailchimp","SendGrid","Listmonk"], True, "Never email opt-outs or hard-bounces (built).",
  "<div class=mk><div class=lr strike>blocked@x — unsubscribed</div><div class=lr strike>bad@x — bounced</div></div>"),
 ("Recipients", "dedup", "De-duplicate by email", ["best-practice"], True, "One email per address even across lists (built in import).",
  "<div class=mk><div class=lr>a@x</div><div class=lr dim>a@x (dup, skipped)</div></div>"),

 # --- Sending ---
 ("Sending", "send_now", "Send now", ["Brevo","Mailchimp","SendGrid","Listmonk"], True, "Send immediately to the targets (Mode A, built).",
  "<div class=mk><span class=btn pri>&#9993; Send now to 2</span></div>"),
 ("Sending", "schedule", "Schedule for later", ["Brevo","Mailchimp","SendGrid","Listmonk"], True, "Pick a date/time; sends automatically.",
  "<div class=mk><input class=inp value='2026-07-01  09:00' readonly> <span class=btn>Schedule</span></div>"),
 ("Sending", "send_time_opt", "Send-time optimization", ["Brevo","Mailchimp"], False, "Auto-pick the best send time per recipient.",
  "<div class=mk><div class=gauge>&#128336; Best time: <b>Tue 10:00</b></div></div>"),
 ("Sending", "throttle", "Throttle / rate limit", ["SendGrid","Listmonk"], True, "Spread a large send to protect deliverability (gateway 429-aware, built).",
  "<div class=mk><div class=gauge>Rate: <b>600/hour</b> &#9201;</div></div>"),
 ("Sending", "ab_test", "A/B test (subject/content)", ["Brevo","Mailchimp","SendGrid"], False, "Test variants; send the winner to the rest.",
  "<div class=mk><div class=row><div class=thumb>A: 'Invite'</div><div class=thumb>B: 'Last call'</div></div></div>"),
 ("Sending", "create_in_brevo", "Create in Brevo (design+send there)", ["Brevo","Versa gateway"], True, "Push targets + shell to Brevo's editor; finish/send there (Mode B, built).",
  "<div class=mk><span class=btn>&#129106; Create in Brevo</span><div class=cap>opens Brevo editor with your list</div></div>"),
 ("Sending", "channels", "Transactional vs marketing channels", ["Versa gateway BRD"], True, "Separate provider per channel; gateway abstracts it (built).",
  "<div class=mk><div class=lane>Transactional &rarr; provider X</div><div class=lane>Marketing &rarr; provider Y</div></div>"),

 # --- Tracking ---
 ("Tracking", "track_opens", "Open tracking", ["Brevo","Mailchimp","SendGrid","Listmonk"], True, "Who opened (built via webhook -> email_sends).",
  "<div class=mk><div class=stat>&#128065; Opens <b>64%</b></div></div>"),
 ("Tracking", "track_clicks", "Click tracking", ["Brevo","Mailchimp","SendGrid","Listmonk"], True, "Who clicked which link.",
  "<div class=mk><div class=stat>&#128279; Clicks <b>21%</b></div></div>"),
 ("Tracking", "track_bounce", "Bounce / unsubscribe tracking", ["Brevo","Mailchimp","SendGrid","Listmonk"], True, "Bounces + opt-outs feed suppression (built).",
  "<div class=mk><div class=stat>&#9888; Bounced <b>2%</b> · Unsub <b>0.4%</b></div></div>"),
 ("Tracking", "heatmap", "Click heatmap", ["Mailchimp","Brevo"], False, "Visual map of where recipients clicked.",
  "<div class=mk><div class=heat>&#128293; CTA hot · footer cold</div></div>"),
 ("Tracking", "per_recipient", "Per-recipient status feed", ["Versa BRD"], True, "Each school's queued/delivered/opened (OJ-O4, built).",
  "<div class=mk><div class=lr>Greenwood — delivered</div><div class=lr>Sunrise — opened</div></div>"),

 # --- Deliverability & compliance ---
 ("Deliverability", "sender_domain", "Verified sender domain (SPF/DKIM)", ["Brevo","Mailchimp","SendGrid","Listmonk"], True, "Authenticate the domain so you land in inbox.",
  "<div class=mk><div class=stat>&#9989; versa-olympiads.org — SPF/DKIM verified</div></div>"),
 ("Deliverability", "unsub_link", "Unsubscribe link + List-Unsubscribe", ["Brevo","Mailchimp","SendGrid","Listmonk"], True, "Legally required one-click opt-out in every send.",
  "<div class=mk><div class=foot>You receive this as a school contact. <u>Unsubscribe</u></div></div>"),
 ("Deliverability", "consent_gdpr", "Consent / data-protection note", ["best-practice/legal"], True, "Record consent basis; honor erasure.",
  "<div class=mk><div class=foot>Sent on legitimate-interest basis · privacy policy</div></div>"),

 # --- Providers ---
 ("Providers", "prov_brevo", "Brevo (our default)", ["Brevo"], True, "Contacts import, campaigns, transactional, webhooks (built).",
  "<div class=mk><div class=prov>Brevo &#9989; list+campaign+webhook</div></div>"),
 ("Providers", "prov_sendgrid", "SendGrid", ["SendGrid"], False, "Strong transactional + API; marketing campaigns too.",
  "<div class=mk><div class=prov>SendGrid — transactional-first</div></div>"),
 ("Providers", "prov_mailchimp", "Mailchimp", ["Mailchimp"], False, "Best editor/automation; pricier.",
  "<div class=mk><div class=prov>Mailchimp — editor/automation</div></div>"),
 ("Providers", "prov_listmonk", "Listmonk (self-hosted, open-source)", ["Listmonk"], False, "Free, self-hosted, high-volume; you run it.",
  "<div class=mk><div class=prov>Listmonk — self-hosted, free</div></div>"),
 ("Providers", "prov_gateway", "Provider-agnostic gateway (our design)", ["Versa"], True, "Swap providers via env; one interface (built).",
  "<div class=mk><div class=prov>Gateway &rarr; Brevo | SendGrid | Mailchimp | Listmonk</div></div>"),
]

cats = []
for cat, key, name, src, rec, desc, preview in F:
    if cat not in cats:
        cats.append(cat)
data = [{"cat": c, "key": k, "name": n, "src": s, "rec": r, "desc": d, "preview": p} for (c, k, n, s, r, d, p) in F]

HTML = r"""<!doctype html><html lang=en><head><meta charset=utf-8><title>Email Campaign — feature picker</title>
<style>
*{box-sizing:border-box}body{font-family:system-ui,Segoe UI,sans-serif;margin:0;background:#faf8ff;color:#2a2342}
.wrap{display:grid;grid-template-columns:1fr 420px;height:100vh}
.left{padding:22px;overflow:auto}.right{padding:22px;border-left:1px solid #e6e0f5;overflow:auto;background:#fff;position:sticky;top:0;height:100vh}
h1{font-size:18px;margin:0 0 4px}.sub{color:#8a82a8;font-size:12px;margin-bottom:14px}
#q{width:100%;padding:11px 13px;border:1px solid #e6e0f5;border-radius:11px;font-size:14px;margin-bottom:14px}
.cat{font-size:11px;text-transform:uppercase;letter-spacing:.09em;color:#9a92b5;font-weight:800;margin:18px 0 8px}
.card{border:1px solid #eee;border-radius:13px;padding:12px 14px;margin-bottom:9px;cursor:pointer;background:#fff;display:flex;gap:11px;align-items:flex-start}
.card:hover{border-color:#cdbcff}.card.on{border-color:#7c5cfc;background:#f6f2ff}.card.foc{box-shadow:0 0 0 3px #efeaff}
.card input{margin-top:3px;width:17px;height:17px;accent-color:#7c5cfc}
.card .nm{font-weight:700;font-size:14px}.card .ds{color:#6b6385;font-size:12px;margin-top:2px}
.badges{margin-top:6px}.bg{display:inline-block;font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px;background:#eef;color:#5b54a8;margin:0 4px 4px 0}
.rec{font-size:10px;font-weight:800;color:#16a34a;margin-left:6px}
.pv-h{font-size:11px;text-transform:uppercase;letter-spacing:.09em;color:#9a92b5;font-weight:800;margin:6px 0 8px}
.pvbox{border:1px solid #e6e0f5;border-radius:14px;padding:16px;min-height:150px;background:#fbfaff}
.pv-name{font-weight:800;font-size:15px;margin-bottom:4px}.pv-desc{color:#6b6385;font-size:12.5px;margin-bottom:12px}
textarea{width:100%;height:200px;border:1px solid #e6e0f5;border-radius:11px;font-family:monospace;font-size:11px;padding:11px;margin-top:8px}
.cpy{margin-top:8px;padding:9px 15px;border:0;border-radius:9px;background:#3a3357;color:#fff;font-weight:700;cursor:pointer}
.count{color:#7c5cfc;font-weight:800;font-size:12px;margin-top:6px}
/* mockups */
.mk{border:1px solid #e3ddf3;border-radius:10px;padding:10px;background:#fff;font-size:12px}
.tb{border-bottom:1px solid #eee;padding-bottom:6px;margin-bottom:6px;color:#7c5cfc;letter-spacing:2px}
.pg{line-height:1.5}.tag{background:#efeaff;color:#7c5cfc;border-radius:4px;padding:1px 4px;font-family:monospace}
.blk{border:1px solid #e3ddf3;border-radius:7px;padding:7px 9px;margin:4px 0;color:#6b6385}.blk.dashed{border-style:dashed;color:#aaa}
.code{background:#2a2342;color:#c9c2ff;border-radius:7px;padding:9px;font-size:11px;margin:0}
.row{display:flex;gap:8px;flex-wrap:wrap}.thumb{flex:1;min-width:70px;border:1px solid #e3ddf3;border-radius:7px;padding:14px 8px;text-align:center;color:#6b6385;background:#fbfaff}
.ai{display:inline-block;background:#7c5cfc;color:#fff;border-radius:8px;padding:6px 11px;font-weight:700;margin-bottom:8px}
.chip{display:inline-block;background:#eef;color:#5b54a8;border-radius:999px;padding:4px 10px;font-size:11px;margin:0 5px 5px 0}
.imgb{width:48px;height:48px;border-radius:8px;border:1px solid #e3ddf3;display:grid;place-items:center;font-size:20px;background:#fbfaff}.imgb.dashed{border-style:dashed;color:#aaa}
.video{position:relative;width:120px;height:70px;border-radius:8px;background:#2a2342;color:#fff;display:grid;place-items:center;font-size:22px}.cap{font-size:11px;color:#7c5cfc;margin-top:5px}
.mail{border:1px solid #e3ddf3;border-radius:8px;overflow:hidden}.mh{background:#f3f0fb;padding:7px 9px;font-size:11px;color:#6b6385;border-bottom:1px solid #eee}.mb{padding:11px}.mb.small{font-size:11px}
.phone{width:120px;margin:auto;border:6px solid #2a2342;border-radius:18px;padding:8px 6px;position:relative}.notch{width:36px;height:5px;background:#2a2342;border-radius:3px;margin:0 auto 6px}
.btnm{display:inline-block;background:#7c5cfc;color:#fff;border-radius:6px;padding:4px 10px;font-size:10px;margin-top:6px}
.inp{border:1px solid #e3ddf3;border-radius:7px;padding:6px 9px;font-size:12px}.btn{display:inline-block;border:1px solid #d9d2ee;border-radius:7px;padding:6px 11px;font-size:12px;background:#fff;font-weight:700;color:#3a3357}.btn.pri{background:#7c5cfc;color:#fff;border:0}
.lr{padding:5px 0;border-bottom:1px solid #f2eefb;font-size:12px}.lr.strike{text-decoration:line-through;color:#aaa}.lr.dim{color:#bbb}.sel{margin-top:6px;color:#7c5cfc;font-weight:700;font-size:12px}
.cond{background:#fff7ed;border:1px solid #fed7aa;border-radius:7px;padding:8px;color:#9a3412;font-size:12px}
.gauge,.stat{background:#fbfaff;border:1px solid #e3ddf3;border-radius:8px;padding:9px 11px;font-size:12px}
.lane{border:1px solid #e3ddf3;border-radius:7px;padding:7px 9px;margin:4px 0;font-size:12px;color:#6b6385}
.heat{background:linear-gradient(90deg,#fee2e2,#fff);border-radius:7px;padding:9px;font-size:12px}
.foot{border-top:1px solid #eee;padding-top:7px;color:#8a82a8;font-size:11px}
.prov{font-weight:700;font-size:13px}.play{position:absolute}
.tabs .tab{display:inline-block;font-size:11px;padding:3px 9px;border:1px solid #e3ddf3;border-radius:6px;margin-right:4px;color:#6b6385}.tabs .tab.on{background:#7c5cfc;color:#fff;border:0}
</style></head><body>
<div class=wrap>
 <div class=left><h1>Email Campaign — feature picker</h1>
  <div class=sub>Click a feature to preview it &rarr;. Tick <b>Include</b> for what the page should have. Recommended are pre-ticked. Copy the JSON back to me and I build OJ-O3 from exactly that scope.</div>
  <input id=q placeholder="Search features (e.g. preview, attach, schedule, brevo)…" oninput=render()>
  <div id=list></div>
 </div>
 <div class=right>
  <div class=pv-h>Preview</div>
  <div class=pvbox id=pv><div class=pv-desc>Click a feature on the left to see how it looks.</div></div>
  <div class=pv-h style="margin-top:18px">Your scope (JSON)</div>
  <textarea id=out readonly></textarea>
  <div class=count id=count></div>
  <button class=cpy onclick="navigator.clipboard.writeText(document.getElementById('out').value)">Copy JSON</button>
 </div>
</div>
<script>
const DATA=__DATA__;const SEL={};DATA.forEach(f=>SEL[f.key]=f.rec);let FOC=null;
function render(){const q=document.getElementById('q').value.toLowerCase();const L=document.getElementById('list');L.replaceChildren();
 const cats=[...new Set(DATA.map(f=>f.cat))];
 for(const c of cats){const items=DATA.filter(f=>f.cat===c&&(!q||(f.name+' '+f.desc+' '+f.src.join(' ')).toLowerCase().includes(q)));if(!items.length)continue;
  const h=document.createElement('div');h.className='cat';h.textContent=c;L.appendChild(h);
  for(const f of items){const card=document.createElement('div');card.className='card'+(SEL[f.key]?' on':'')+(FOC===f.key?' foc':'');
   const cb=document.createElement('input');cb.type='checkbox';cb.checked=!!SEL[f.key];cb.addEventListener('click',e=>e.stopPropagation());cb.addEventListener('change',()=>{SEL[f.key]=cb.checked;render();out();});
   const body=document.createElement('div');body.style.flex='1';
   const nm=document.createElement('div');nm.className='nm';nm.innerHTML=f.name+(f.rec?' <span class=rec>RECOMMENDED</span>':'');
   const ds=document.createElement('div');ds.className='ds';ds.textContent=f.desc;
   const bd=document.createElement('div');bd.className='badges';f.src.forEach(s=>{const b=document.createElement('span');b.className='bg';b.textContent=s;bd.appendChild(b);});
   body.append(nm,ds,bd);card.append(cb,body);
   card.addEventListener('click',()=>{FOC=f.key;preview(f);render();});
   L.appendChild(card);}}
}
function preview(f){const p=document.getElementById('pv');p.innerHTML='<div class=pv-name>'+f.name+'</div><div class=pv-desc>'+f.desc+'</div>'+f.preview;}
function out(){const o={};DATA.forEach(f=>{if(SEL[f.key]){(o[f.cat]=o[f.cat]||[]).push(f.key);}});
 const providers=(o['Providers']||[]).map(k=>k.replace('prov_',''));
 const json={include:o,providers,excluded:DATA.filter(f=>!SEL[f.key]).map(f=>f.key),notes:""};
 document.getElementById('out').value=JSON.stringify(json,null,2);
 document.getElementById('count').textContent=Object.values(SEL).filter(Boolean).length+' of '+DATA.length+' features included';}
render();out();
</script></body></html>"""

HTML = HTML.replace("__DATA__", json.dumps(data))
OUT.write_text(HTML, encoding="utf-8")
print(f"campaignspec: {len(F)} features in {len(cats)} categories -> {OUT}")
