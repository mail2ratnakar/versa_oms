#!/usr/bin/env python3
"""Generate Finverse-styled UI pages (ModuleTable) for staff + school portals."""
import json, re
from pathlib import Path

def titleize(n):
    """Human-readable column/field label: 'assignment_code' -> 'Assignment Code' (acronyms upper)."""
    s = n.replace("_", " ").title()
    return re.sub(r"\b(Id|Url|Omr|Crm|Pdf|Sla|Qr|Pii|Ip|Csv)\b", lambda m: m.group(1).upper(), s)

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
 ("school_roster", "student_roster_batches", "school/roster", "Student Roster",
   [("participation_id","Participation","text"),("source_type","Source type","text")]),
 ("school_roster_corrections", "student_roster_corrections", "school/roster-corrections", "Roster Corrections",
   [("roster_batch_id","Roster batch","text"),("correction_type","Correction type","text"),("requested_change","Requested change","text"),("reason","Reason","text")]),
 ("school_bookings", "exam_slot_bookings", "school/slot-bookings", "Slot Bookings",
   [("participation_id","Participation","text"),("exam_slot_id","Exam slot","text"),("confirmed_student_count","Students","number"),("payment_status_at_booking","Payment status","text")]),
]
SCHOOL_PLACEHOLDERS = [("school/support","Support"),("school/reports","Reports")]
# staff secondary entities (actionable non-primary collections): spec_module, table, route, service_key, title
STAFF_SECONDARY = [
 ("admin_settings", "setting_versions", "staff/admin/settings/versions", "admin_settings_versions", "Setting Versions"),
 ("admin_settings", "setting_change_requests", "staff/admin/settings/change-requests", "admin_settings_change_requests", "Setting Change Requests"),
 ("reports_exports", "export_requests", "staff/reports/export-requests", "reports_exports_requests", "Export Requests"),
 ("courier_ops", "courier_dispatch_batches", "staff/courier/dispatch-batches", "courier_ops_dispatch", "Dispatch Batches"),
 ("courier_ops", "courier_shipments", "staff/courier/shipments", "courier_ops_shipments", "Shipments"),
 ("courier_ops", "courier_receipts", "staff/courier/receipts", "courier_ops_receipts", "Receipts"),
 ("courier_ops", "courier_exceptions", "staff/courier/exceptions", "courier_ops_exceptions", "Courier Exceptions"),
 ("security_audit_console", "security_incidents", "staff/security-audit/incidents", "security_audit_incidents", "Security Incidents"),
 ("security_audit_console", "access_reviews", "staff/security-audit/access-reviews", "security_audit_access_reviews", "Access Reviews"),
 ("audit", "audit_cases", "staff/security-audit/cases", "audit_cases", "Audit Cases"),
 ("audit", "reconciliation_runs", "staff/security-audit/reconciliations", "audit_reconciliations", "Reconciliation Runs"),
 ("audit", "audit_exports", "staff/security-audit/exports", "audit_exports_review", "Audit Exports"),
 ("support_tickets", "support_ticket_escalations", "staff/support/escalations", "support_tickets_escalations", "Escalations"),
 ("task_work_queue", "work_tasks", "staff/tasks/work-tasks", "task_work_queue_tasks", "Work Tasks"),
 ("task_work_queue", "task_assignments", "staff/tasks/assignments", "task_work_queue_assignments", "Task Assignments"),
 ("exam_material_ops", "exam_material_files", "staff/exams/materials/files", "exam_material_ops_files", "Material Files"),
 ("exam_material_ops", "exam_material_approvals", "staff/exams/materials/approvals", "exam_material_ops_approvals", "Material Approvals"),
 ("finance_ops", "finance_payment_links", "staff/finance/payment-links", "finance_ops_payment_links", "Payment Links"),
 ("finance_ops", "finance_payments", "staff/finance/payments", "finance_ops_payments", "Payments"),
 ("finance_ops", "finance_adjustments", "staff/finance/adjustments", "finance_ops_adjustments", "Adjustments"),
 ("evaluation_ops", "evaluation_answer_keys", "staff/evaluation/answer-keys", "evaluation_ops_answer_keys", "Answer Keys"),
 ("evaluation_ops", "evaluation_import_batches", "staff/evaluation/import-batches", "evaluation_ops_import_batches", "Import Batches"),
 ("evaluation_ops", "evaluation_score_batches", "staff/evaluation/score-batches", "evaluation_ops_score_batches", "Score Batches"),
 ("results_ops", "candidate_results", "staff/results/candidates", "results_ops_candidates", "Candidate Results"),
 ("results_ops", "result_publication_windows", "staff/results/publication-windows", "results_ops_publication_windows", "Publication Windows"),
 ("results_ops", "result_corrections", "staff/results/corrections", "results_ops_corrections", "Result Corrections"),
 ("audit", "audit_events", "staff/security-audit/events", "audit_events_review", "Audit Events"),
 ("certificate_ops", "certificate_requests", "staff/certificates/requests", "certificate_ops_requests", "Certificate Requests"),
 ("evaluation_ops", "evaluation_exceptions", "staff/evaluation/exceptions", "evaluation_ops_exceptions", "Evaluation Exceptions"),
 ("exam_slots", "exam_slot_bookings", "staff/exams/slot-bookings", "exam_slots_bookings", "Slot Bookings"),
 ("exam_slot_ops", "exam_slot_reschedule_requests", "staff/exams/slots/reschedule-requests", "exam_slot_ops_reschedules", "Reschedule Requests"),
 ("finance_ops", "finance_reconciliation_batches", "staff/finance/reconciliations", "finance_ops_reconciliations", "Reconciliations"),
 ("notification_ops", "notification_batches", "staff/notifications/batches", "notification_ops_batches", "Notification Batches"),
 ("results", "result_publications", "staff/results/publications", "results_publications", "Result Publications"),
 ("roles_permissions", "role_change_requests", "staff/admin/roles/change-requests", "roles_permissions_change_requests", "Role Change Requests"),
 ("school_onboarding_ops", "school_onboarding_documents", "staff/schools/onboarding/documents", "school_onboarding_documents", "Onboarding Documents"),
 ("school_onboarding_ops", "school_status_controls", "staff/schools/onboarding/status-controls", "school_onboarding_status_controls", "Status Controls"),
 ("security_audit_console", "forensics_cases", "staff/security-audit/forensics", "security_audit_forensics", "Forensics Cases"),
 ("staff_users", "staff_invitations", "staff/admin/users/invitations", "staff_users_invitations", "Staff Invitations"),
 ("staff_users", "staff_assignment_scopes", "staff/admin/users/assignment-scopes", "staff_users_assignment_scopes", "Assignment Scopes"),
 ("student_roster_ops", "student_roster_corrections", "staff/students/rosters/corrections", "student_roster_ops_corrections", "Roster Corrections"),
 ("support_tickets", "support_tickets", "staff/support/tickets", "support_tickets_tickets", "Support Tickets"),
 ("task_work_queue", "task_dependencies", "staff/tasks/dependencies", "task_work_queue_dependencies", "Task Dependencies"),
]
# school-portal actions (explicit — a school only performs its own transitions, not staff ones)
SCHOOL_ACTIONS = {
 "school_slots": [{"action": "confirm", "label": "Confirm", "variant": "blue"}],
 "school_payments": [{"action": "create_link", "label": "Pay now", "variant": "blue"}],
 "school_roster": [{"action": "submit", "label": "Submit for lock", "variant": "blue"}],
 "school_roster_corrections": [{"action": "submit", "label": "Submit", "variant": "blue"}],
 "school_bookings": [{"action": "cancel", "label": "Cancel booking", "variant": "light"}],
}
# school-portal per-row downloads (GET endpoint/[id]/subPath -> opens download_url)
SCHOOL_DOWNLOADS = {"school_certificates": {"label": "Download", "subPath": "download"}}

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
# System/derived fields must never be user-facing columns or create inputs (P2.9 / P2.4 / P2.7).
SYS_RE = re.compile(r"^normalized_|_by$|idempotency|_hash$|prev_hash|event_hash")
def _is_sys(n): return bool(SYS_RE.search(n))
def status_enum(table, status_col):
    for c in MODEL.get(table, {}).get("columns", []):
        if c["name"] == status_col and c.get("enum_values"):
            return c["enum_values"]
    return []

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

# Irreversible/high-impact verbs: reason required (-> audit, P1.8) and a branded confirm warning (P1.6).
REASON_VERBS = {"approve","reject","revoke","withhold","cancel","block","suspend","deactivate","archive","merge","void","refund","disable"}
DANGER_VERBS = {"reject","revoke","cancel","block","suspend","deactivate","archive","withhold","void","refund","disable","delete"}
def actions_for(mid, table):
    out = []
    for st in entity_statuses(mid, table):
        if st in STATUS_ACTION:
            verb, variant = STATUS_ACTION[st]
            a = {"action": verb, "label": verb.replace("_"," ").capitalize(), "variant": variant}
            if verb in REASON_VERBS: a["reason"] = True
            if verb in DANGER_VERBS: a["danger"] = True
            out.append(a)
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
        if c.get("kind")=="fk" or _is_sys(n): continue
        out.append((n, titleize(n), ui_type(c["pg_type"])))
    return out

def display_columns(table, status_col):
    t=MODEL.get(table,{}); cols=[]
    for c in t.get("columns",[]):
        n=c["name"]
        if n in COMMON or n==status_col: continue
        if c.get("kind")=="fk" or _is_sys(n): continue
        if n.endswith("_count"): continue
        cols.append({"key":n,"label":titleize(n)})
        if len(cols)>=4: break
    if status_col: cols.append({"key":status_col,"label":"Status"})
    return cols

def page_tsx(title, eyebrow, endpoint, columns, status_col, fields, actions, mid=None, download_action=None, toolbar=None):
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
    if download_action: parts.append(f"      downloadAction={{{json.dumps(download_action)}}}")
    if toolbar: parts.append(f"      toolbar={{{json.dumps(toolbar)}}}")
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

def gen_table_page(table, route, title, eyebrow, fields=None, with_actions=True, mid=None, actions_override=None, download_action=None):
    """Write a ModuleTable page for a table. Reusable by gen_core."""
    status_col = MODEL.get(table,{}).get("status_field") or "status"
    cols = display_columns(table, status_col)
    cf = fields if fields is not None else create_fields(table)
    actions = actions_override if actions_override is not None else (actions_for(mid or "", table) if with_actions and mid else [])
    # Toolbar (status facet + search + sort) — staff routes only (their kernel services carry listConfig). P0.6.
    toolbar = None
    svals = status_enum(table, status_col)
    if route.startswith("staff/") and status_col and svals:
        toolbar = {
            "facet": {"key": status_col, "options": [{"value": s, "label": titleize(s)} for s in svals]},
            "search": True,
            "sort": [{"value": "created_at:desc", "label": "Newest"}],
        }
    tsx = page_tsx(title, eyebrow, f"/api/{route}", cols, status_col, cf, actions, mid=mid, download_action=download_action, toolbar=toolbar)
    write(APP/"app"/route/"page.tsx", tsx)

def _common_len(a, b):
    n = 0
    for x, y in zip(a.split("/"), b.split("/")):
        if x == y: n += 1
        else: break
    return n

def gen_nav():
    """Generate the sidebar nav (navLinks.ts) so every primary + secondary page is reachable."""
    from collections import defaultdict
    prim_routes = [r for _mid, (r, _t) in STAFF.items()]
    kids = defaultdict(list)
    for sm, table, route, key, title in STAFF_SECONDARY:
        parent = max(prim_routes, key=lambda p: _common_len(p, route))  # nest under nearest primary
        kids[f"/{parent}"].append((f"/{route}", title))
    staff = []
    for _mid, (r, t) in STAFF.items():
        href = f"/{r}"; staff.append((href, t, False))
        for ch, ct in kids.get(href, []): staff.append((ch, ct, True))
    school = [("/school/dashboard", "Dashboard", False)]
    for mid, table, route, title, fields in SCHOOL: school.append((f"/{route}", title, False))
    for route, title in SCHOOL_PLACEHOLDERS: school.append((f"/{route}", title, False))
    def item(h, l, ind): return "{ href: %s, label: %s%s }" % (json.dumps(h), json.dumps(l), ", indent: true" if ind else "")
    L = ["// GENERATED by gen_ui.gen_nav — DO NOT EDIT.",
         "export type NavItem = { href: string; label: string; indent?: boolean };", "",
         "export const staffNav: NavItem[] = ["]
    L += ["  " + item(h, l, ind) + "," for h, l, ind in staff]
    L += ["];", "", "export const schoolNav: NavItem[] = ["]
    L += ["  " + item(h, l, ind) + "," for h, l, ind in school]
    L += ["];", ""]
    write(APP / "components" / "navLinks.ts", "\n".join(L))

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
        gen_table_page(table, route, title, f"school · {mid}", fields=fields, with_actions=False, mid=mid, actions_override=SCHOOL_ACTIONS.get(mid), download_action=SCHOOL_DOWNLOADS.get(mid)); count+=1
    STAFF_SECONDARY_EXCLUDE = {"exam_slots_bookings": ["confirm"]}  # book is school-only; staff = ops mgmt
    for sm, table, route, key, title in STAFF_SECONDARY:
        acts = [a for a in actions_for(sm, table) if a["action"] not in STAFF_SECONDARY_EXCLUDE.get(key, [])]
        gen_table_page(table, route, title, f"staff · {key}", mid=key, actions_override=acts); count+=1
    for route,title in SCHOOL_PLACEHOLDERS:
        write(APP/"app"/route/"page.tsx", placeholder_tsx(title, "school")); count+=1
    gen_nav()
    print("pages generated:", count, "+ navLinks.ts")
