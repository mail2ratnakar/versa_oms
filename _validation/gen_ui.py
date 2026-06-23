#!/usr/bin/env python3
"""Generate Finverse-styled UI pages (ModuleTable) for staff + school portals."""
import json
from pathlib import Path

APP = Path("versa-oms/app")
SPEC = Path("versa-oms/spec/modules")
MODEL = json.loads(Path("versa-oms/implementation/CANONICAL_DATA_MODEL.json").read_text(encoding="utf-8"))["tables"]

# module_id -> (page route, title)
STAFF = {
 "company_dashboard": ("staff/dashboard", "Operations Dashboard"),
 "staff_users": ("staff/admin/users", "Staff Users"),
 "roles_permissions": ("staff/admin/roles", "Roles & Permissions"),
 "school_crm": ("staff/schools/crm", "School CRM"),
 "school_onboarding_ops": ("staff/schools/onboarding", "School Onboarding"),
 "student_roster_ops": ("staff/students/rosters", "Student Rosters"),
 "finance_ops": ("staff/finance", "Finance"),
 "exam_slot_ops": ("staff/exams/slots", "Exam Slots"),
 "exam_material_ops": ("staff/exams/materials", "Exam Materials"),
 "courier_ops": ("staff/courier", "Courier & Logistics"),
 "evaluation_ops": ("staff/evaluation", "Evaluation"),
 "results_ops": ("staff/results", "Results"),
 "certificate_ops": ("staff/certificates", "Certificates"),
 "notification_ops": ("staff/notifications", "Notifications"),
 "support_tickets": ("staff/support", "Support Tickets"),
 "task_work_queue": ("staff/tasks", "Task Queue"),
 "reports_exports": ("staff/reports", "Reports & Exports"),
 "admin_settings": ("staff/admin/settings", "Admin Settings"),
 "security_audit_console": ("staff/security-audit", "Security & Audit"),
}

# school: module_id -> (table, page route, title, create_fields)
SCHOOL = [
 ("school_students", "students", "school/students", "Students",
   [("student_name","Student name","text"),("grade","Grade","text"),("consent_obtained","Consent obtained","checkbox")]),
 ("school_payments", "payments", "school/payments", "Payments", []),
 ("school_results", "candidate_results", "school/results", "Results", []),
 ("school_certificates", "certificates", "school/certificates", "Certificates", []),
 ("school_materials", "exam_material_packages", "school/materials", "Exam Materials", []),
 ("school_slots", "school_exam_slot_assignments", "school/exam-slots", "Exam Slots", []),
]
SCHOOL_PLACEHOLDERS = [("school/support","Support"),("school/reports","Reports")]
# school-portal actions (explicit — a school only performs its own transitions, not staff ones)
SCHOOL_ACTIONS = {
 "school_slots": [{"action": "confirm", "label": "Confirm", "variant": "blue"}],
 "school_payments": [{"action": "create_link", "label": "Pay now", "variant": "blue"}],
}

def dashboard_tsx(title, eyebrow, endpoint):
    return ('import { DashboardView } from "@/components/DashboardView";\n\n'
            'export default function Page() {\n'
            f'  return <DashboardView title={json.dumps(title)} eyebrow={json.dumps(eyebrow)} endpoint={json.dumps(endpoint)} />;\n'
            '}\n')

WRITE_KEYS = {"create","update","archive","disable","reactivate","cancel","resend","revoke","lock","unlock","assign","reassign","import","upload","generate"}
STATUS_ACTION = {
 "approved":("approve","blue"),"published":("publish","blue"),"released":("release","blue"),
 "confirmed":("confirm","blue"),"locked":("lock","blue"),"revoked":("revoke","light"),
 "rejected":("reject","light"),"withheld":("withhold","light"),"reissued":("reissue","blue"),
 "approved_for_results":("approve_for_results","blue"),"paid":("mark_paid","blue"),
 "reversed":("reverse","light"),"refunded":("refund","light"),"cancelled":("cancel","light"),
 "archived":("archive","light"),"suspended":("suspend","light"),"blocked":("block","light"),
 "scheduled":("schedule","light"),"dispatched":("dispatch","light"),"delivered":("deliver","light"),
 "received":("receive","light"),"validated":("validate","light"),"generated":("generate","light"),
 "submitted":("submit","light"),"submitted_for_lock":("submit_for_lock","light"),"closed":("close","light"),
 "in_transit":("mark_in_transit","light"),"activated":("activate","blue"),
}
COMMON = {"id","created_at","updated_at","created_by","status","archived_at","version"}

def primary_table(mid):
    sc = json.loads((SPEC/mid/"schema.json").read_text(encoding="utf-8"))
    cs = sc.get("collections",[])
    return cs[0].get("collection") if cs else None

def entity_statuses(mid, table):
    p = SPEC/mid/"lifecycle_states.json"
    if not p.exists(): return []
    lc = json.loads(p.read_text(encoding="utf-8"))
    ents = {e.get("entity"): e for e in lc.get("entities",[])}
    for c in (table, table[:-1] if table.endswith("s") else table):
        if c in ents: return ents[c].get("statuses",[]) or []
    vals = list(ents.values())
    return vals[0].get("statuses",[]) if vals else []

def actions_for(mid, table):
    out = []
    for st in entity_statuses(mid, table):
        if st in STATUS_ACTION:
            verb, variant = STATUS_ACTION[st]
            out.append({"action": verb, "label": verb.replace("_"," ").capitalize(), "variant": variant})
    # de-dup by action
    seen=set(); uniq=[]
    for a in out:
        if a["action"] in seen: continue
        seen.add(a["action"]); uniq.append(a)
    return uniq[:10]  # ModuleTable gates actions per-row by status, so show all lifecycle actions

def ui_type(pg):
    if pg=="boolean": return "checkbox"
    if pg in ("integer","bigint","numeric","double precision"): return "number"
    if pg=="date": return "date"
    return "text"

def create_fields(table):
    t=MODEL.get(table,{}); out=[]
    for c in t.get("columns",[]):
        n=c["name"]
        if n in COMMON or c.get("nullable") or c.get("default") is not None: continue
        if n=="user_id" or n.endswith("_code") or n.endswith("_status") or n.endswith("_count"): continue
        if c.get("kind")=="fk": continue
        out.append((n, n.replace("_"," ").capitalize(), ui_type(c["pg_type"])))
    return out

def display_columns(table, status_col):
    t=MODEL.get(table,{}); cols=[]
    for c in t.get("columns",[]):
        n=c["name"]
        if n in COMMON or n==status_col: continue
        if c.get("kind")=="fk": continue
        if n.endswith("_count"): continue
        cols.append({"key":n,"label":n.replace("_"," ")})
        if len(cols)>=4: break
    if status_col: cols.append({"key":status_col,"label":"Status"})
    return cols

def page_tsx(title, eyebrow, endpoint, columns, status_col, fields, actions, mid=None):
    cf = "[" + ", ".join(
        '{ key: %s, label: %s%s }' % (json.dumps(k), json.dumps(l), ('' if t=='text' else ', type: %s' % json.dumps(t)))
        for k,l,t in fields) + "]"
    cols = json.dumps(columns)
    acts = json.dumps(actions)
    parts = ['import { ModuleTable } from "@/components/ModuleTable";', "",
             "export default function Page() {", "  return (", "    <ModuleTable",
             f"      title={json.dumps(title)}", f"      eyebrow={json.dumps(eyebrow)}",
             f"      endpoint={json.dumps(endpoint)}", f"      columns={{{cols}}}"]
    if status_col: parts.append(f"      statusKey={json.dumps(status_col)}")
    if mid: parts.append(f"      moduleId={json.dumps(mid)}")
    if fields: parts.append(f"      createFields={{{cf}}}")
    if actions: parts.append(f"      actions={{{acts}}}")
    parts += ["    />", "  );", "}", ""]
    return "\n".join(parts)

def placeholder_tsx(title, eyebrow):
    return ('export default function Page() {\n'
            '  return (\n'
            '    <section className="module-view">\n'
            f'      <span className="eyebrow"><span className="dot" />{eyebrow}</span>\n'
            f'      <h1 style={{{{ marginTop: 10 }}}}>{title}</h1>\n'
            '      <div className="card"><p>This view is part of the school portal and will surface its data once wired.</p></div>\n'
            '    </section>\n'
            '  );\n'
            '}\n')

def write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")

def gen_table_page(table, route, title, eyebrow, fields=None, with_actions=True, mid=None, actions_override=None):
    """Write a ModuleTable page for a table. Reusable by gen_core."""
    status_col = MODEL.get(table,{}).get("status_field") or "status"
    cols = display_columns(table, status_col)
    cf = fields if fields is not None else create_fields(table)
    actions = actions_override if actions_override is not None else (actions_for(mid or "", table) if with_actions and mid else [])
    tsx = page_tsx(title, eyebrow, f"/api/{route}", cols, status_col, cf, actions, mid=mid)
    write(APP/"app"/route/"page.tsx", tsx)

from pathlib import Path as _Path
SCREEN_MODULES = {p.name.replace(".screen.json", "") for p in _Path("versa-oms/spec/screens").glob("*.screen.json")}

if __name__ == "__main__":
    count=0
    write(APP/"app"/"staff"/"dashboard"/"page.tsx", dashboard_tsx("Operations Dashboard", "staff · overview", "/api/staff/overview")); count+=1
    write(APP/"app"/"school"/"dashboard"/"page.tsx", dashboard_tsx("School Dashboard", "school · overview", "/api/school/overview")); count+=1
    for mid,(route,title) in STAFF.items():
        if mid == "company_dashboard":
            continue  # company_dashboard=DashboardView
        if mid in SCREEN_MODULES:
            continue  # owned by gen_screens.py (richer screen spec) — never clobber
        gen_table_page(primary_table(mid), route, title, f"staff · {mid}", mid=mid); count+=1
    for mid, table, route, title, fields in SCHOOL:
        gen_table_page(table, route, title, f"school · {mid}", fields=fields, with_actions=False, mid=mid, actions_override=SCHOOL_ACTIONS.get(mid)); count+=1
    for route,title in SCHOOL_PLACEHOLDERS:
        write(APP/"app"/route/"page.tsx", placeholder_tsx(title, "school")); count+=1
    print("pages generated:", count)
