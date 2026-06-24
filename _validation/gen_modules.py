#!/usr/bin/env python3
"""Generate per-module service.ts + route.ts for the 19 company-portal modules,
driven by each module's schema.json (primary table) + permissions.json (policy)
and the canonical model (required columns -> zod)."""
import json
from pathlib import Path

APP = Path("versa-oms/app")
SPEC = Path("versa-oms/spec/modules")
MODEL = json.loads(Path("versa-oms/implementation/CANONICAL_DATA_MODEL.json").read_text(encoding="utf-8"))["tables"]
from _detail_panels import derive_panels
HRA = json.loads(Path("versa-oms/implementation/HIGH_RISK_ACTIONS.json").read_text(encoding="utf-8"))
HIGH_RISK_MODULES = {a.get("module") for a in HRA.get("actions",[])}
DUAL_MODULES = {a.get("module") for a in HRA.get("actions",[]) if a.get("requires_dual_approval")}

# status value -> (action verb, permission class)
STATUS_ACTION = {
 "approved": ("approve","approve"), "published": ("publish","approve"),
 "released": ("release","approve"), "confirmed": ("confirm","approve"),
 "locked": ("lock","approve"), "revoked": ("revoke","approve"),
 "rejected": ("reject","approve"), "withheld": ("withhold","approve"),
 "reissued": ("reissue","approve"), "approved_for_results": ("approve_for_results","approve"),
 "paid": ("mark_paid","approve"), "reversed": ("reverse","approve"), "refunded": ("refund","approve"),
 "issued": ("issue","write"), "partially_paid": ("mark_partially_paid","write"), "voided": ("void","approve"),
 "superseded": ("supersede","approve"),
 "cancelled": ("cancel","write"), "archived": ("archive","write"),
 "suspended": ("suspend","write"), "blocked": ("block","write"),
 "scheduled": ("schedule","write"), "dispatched": ("dispatch","write"),
 "delivered": ("deliver","write"), "received": ("receive","write"),
 "validated": ("validate","write"), "generated": ("generate","write"),
 "submitted": ("submit","write"), "submitted_for_lock": ("submit_for_lock","write"),
 "closed": ("close","write"), "in_transit": ("mark_in_transit","write"),
 # activate: approve-permission but no reason required (3rd element overrides reasonRequired)
 "activated": ("activate","approve",False),
}

# Server-calculated fields (never client input — computed in server/lib/createCompute.ts) and the
# trusted inputs that MUST be collected to compute them (override the generic exclusion rules).
SERVER_COMPUTED = {
    "finance_invoices": ["invoice_number", "gross_amount", "discount_amount", "tax_amount",
                          "school_commission_amount", "net_payable_amount", "amount_paid", "balance_due"],
}
COMPUTE_INPUTS = {
    "finance_invoices": ["confirmed_student_count", "price_per_student"],
}

def entity_statuses(mid, table):
    p = SPEC/mid/"lifecycle_states.json"
    if not p.exists(): return []
    lc = json.loads(p.read_text(encoding="utf-8"))
    ents = {e.get("entity"): e for e in lc.get("entities",[])}
    cands = [table]
    if table.endswith("ies"): cands.append(table[:-3] + "y")
    if table.endswith("es"): cands.append(table[:-2])
    if table.endswith("s"): cands.append(table[:-1])
    for c in cands:
        if c in ents: return ents[c].get("statuses",[]) or []
    vals = list(ents.values())
    return vals[0].get("statuses",[]) if len(vals) == 1 else []  # fallback only for single-entity modules

def build_transitions(mid, table):
    statuses = entity_statuses(mid, table)
    high = mid in HIGH_RISK_MODULES
    dual = mid in DUAL_MODULES
    out = {}
    for st in statuses:
        if st in STATUS_ACTION:
            entry = STATUS_ACTION[st]
            verb, klass = entry[0], entry[1]
            reason_override = entry[2] if len(entry) > 2 else None
            out[verb] = {
                "target": st,
                "klass": klass,
                "reasonRequired": reason_override if reason_override is not None else ((klass == "approve") or high),
                "dualApproval": dual and klass == "approve",
            }
    return out

# module_id -> staff API route file (relative to app/app/api)
ROUTE = {
 "company_dashboard": "staff/dashboard",
 "staff_users": "staff/admin/users",
 "roles_permissions": "staff/admin/roles",
 "school_crm": "staff/schools/crm",
 "school_onboarding_ops": "staff/schools/onboarding",
 "student_roster_ops": "staff/students/rosters",
 "finance_ops": "staff/finance",
 "exam_slot_ops": "staff/exams/slots",
 "exam_material_ops": "staff/exams/materials",
 "courier_ops": "staff/courier",
 "evaluation_ops": "staff/evaluation",
 "results_ops": "staff/results",
 "certificate_ops": "staff/certificates",
 "notification_ops": "staff/notifications",
 "support_tickets": "staff/support",
 "task_work_queue": "staff/tasks",
 "reports_exports": "staff/reports",
 "admin_settings": "staff/admin/settings",
 "security_audit_console": "staff/security-audit",
}

WRITE_KEYS = {"create","update","archive","disable","reactivate","cancel","resend","revoke","lock","unlock","assign","reassign","import","upload","generate"}
APPROVE_KEYS = {"approve","publish","confirm","release","reject","withhold","reissue"}

def primary_table(mid):
    schema = json.loads((SPEC/mid/"schema.json").read_text(encoding="utf-8"))
    cols = schema.get("collections",[])
    return cols[0].get("collection") if cols else None

WRITE_PREFIX = ("create","update","issue","generate","assign","manual","lock","unlock",
    "validate","resolve","reassign","escalate","sync","bulk","submit","override","accept",
    "close","import","upload","prepare","request","add","edit","void","cancel","retry",
    "send","schedule","apply","record","enter","intake","scan","map","recalc","disable",
    "reactivate","archive","resend","block","suspend","release")
APPROVE_PREFIX = ("approve","publish","confirm","revoke","reissue","withhold","review_high")

def caps_to_actions(caps):
    acts=set()
    for c in caps:
        cl=str(c).lower()
        if cl=="all_except_hard_delete":
            acts.update({"read","write","approve","export"}); continue
        if "read" in cl or cl=="masked_read_only": acts.add("read")
        if cl=="audit_review": acts.update({"read","approve"})
        if cl.startswith(WRITE_PREFIX): acts.add("write")
        if cl.startswith(APPROVE_PREFIX): acts.add("approve")
        if "export" in cl: acts.add("export")
        if "download" in cl: acts.add("download")
    return acts

def build_policy(mid, table):
    perms = json.loads((SPEC/mid/"permissions.json").read_text(encoding="utf-8"))
    read,write,approve,export,download = set(),set(),set(),set(),set()
    for role_entry in perms.get("roles",[]):
        role = role_entry.get("role")
        # 'public' is never a kernel actor — unauthenticated access is always via a dedicated,
        # field-whitelisted server route (e.g. certificate verification), not the staff/kernel policy.
        if role in ("public", "anonymous"):
            continue
        if "can" in role_entry:
            acts = caps_to_actions(role_entry.get("can",[]))
            if "read" in acts: read.add(role)
            if "write" in acts: write.add(role)
            if "approve" in acts: approve.add(role)
            if "export" in acts: export.add(role)
            if "download" in acts: download.add(role)
            continue
        tperms = (role_entry.get("permissions") or {}).get(table) or {}
        if not isinstance(tperms,dict): continue
        if tperms.get("read"): read.add(role)
        if any(tperms.get(k) for k in WRITE_KEYS): write.add(role)
        if any(tperms.get(k) for k in APPROVE_KEYS): approve.add(role)
        if tperms.get("export"): export.add(role)
        if tperms.get("download"): download.add(role)
    pol = {}
    if read: pol["read"]=sorted(read)
    if write: pol["write"]=sorted(write)
    if approve: pol["approve"]=sorted(approve)
    if export: pol["export"]=sorted(export)
    if download: pol["download"]=sorted(download)
    return pol

COMMON = {"id","created_at","updated_at","created_by","status","archived_at","version"}
def zod_type(pg):
    if pg=="uuid": return "z.string().uuid()"
    if pg in ("integer","bigint"): return "z.coerce.number().int()"
    if pg in ("numeric","double precision"): return "z.coerce.number()"
    if pg=="boolean": return "z.coerce.boolean()"
    if pg=="jsonb": return "z.any()"
    return "z.string()"  # text, date, time, timestamptz, citext

def create_schema_fields(table):
    t = MODEL.get(table,{})
    computed = set(SERVER_COMPUTED.get(table, []))
    forced = COMPUTE_INPUTS.get(table, [])
    fields=[]
    for c in t.get("columns",[]):
        n=c["name"]
        if n in computed: continue                       # server-calculated — never client input
        if n in forced:                                  # trusted input needed for computation
            fields.append((n, zod_type(c["pg_type"]))); continue
        if n in COMMON: continue
        if c.get("nullable"): continue
        if c.get("default") is not None: continue
        if n=="user_id" or n.endswith("_code") or n.endswith("_status") or n.endswith("_count"): continue
        fields.append((n, zod_type(c["pg_type"])))
    return fields

_SEARCHABLE = ("name", "code", "email", "title", "reference", "number", "city", "school", "coordinator")
def build_list_config(table, status_col):
    """Server-side toolbar config (filter/search/sort/facet) for the kernel list — so generated pages
    can ship a real toolbar (P0.6). Derived from the canonical table columns."""
    t = MODEL.get(table, {})
    cols = t.get("columns", [])
    names = [c["name"] for c in cols]
    search = [c["name"] for c in cols if c.get("pg_type") == "text" and "normalized" not in c["name"]
              and any(k in c["name"] for k in _SEARCHABLE)][:6]
    enums = [c["name"] for c in cols if c.get("kind") == "enum"]
    filters = ([status_col] if status_col in names else []) + [e for e in enums if e != status_col][:2]
    filters = list(dict.fromkeys(filters))
    sort = [c for c in ["created_at", status_col, "updated_at"] if c in names]
    cfg = {}
    if filters: cfg["filterColumns"] = filters
    if search: cfg["searchColumns"] = search
    if sort: cfg["sortColumns"] = sort
    if "created_at" in names: cfg["defaultSort"] = {"column": "created_at", "ascending": False}
    sc = next((c for c in cols if c["name"] == status_col), None)
    if sc:
        cfg["facetColumn"] = status_col
        if sc.get("enum_values"): cfg["facetValues"] = sc["enum_values"]
    owner = next((n for n in names if n.endswith("_owner_id") or n in ("assigned_to", "assigned_staff_id")), None)
    if owner: cfg["ownerColumn"] = owner
    return cfg

def gen_service(mid, table, policy, fields, transitions, status_col):
    lines = ['import { z } from "zod";',
             'import { defineModuleService } from "@/server/lib/defineModule";',
             "",
             "const createSchema = z",
             "  .object({"]
    for n,zt in fields:
        lines.append(f"    {json.dumps(n)}: {zt},")
    lines.append("  })")
    lines.append("  .passthrough();")
    lines.append("")
    lines.append("export const {")
    lines.append("  listModuleRecords,")
    lines.append("  createModuleRecord,")
    lines.append("  getModuleRecord,")
    lines.append("  updateModuleRecord,")
    lines.append("  transitionModuleRecord,")
    lines.append("  getTransition,")
    lines.append("} = defineModuleService({")
    lines.append(f"  moduleId: {json.dumps(mid)},")
    lines.append(f"  table: {json.dumps(table)},")
    lines.append('  scope: "staff",')
    lines.append(f"  statusColumn: {json.dumps(status_col)},")
    lines.append(f"  policy: {json.dumps(policy)},")
    lines.append(f"  transitions: {json.dumps(transitions)},")
    lc = build_list_config(table, status_col)
    if lc:
        lines.append(f"  listConfig: {json.dumps(lc)},")
    lines.append("  createSchema,")
    lines.append("});")
    return "\n".join(lines)+"\n"

def gen_item_route(mid):
    return ('import { makeStaffItemHandlers } from "@/server/lib/routeHandlers";\n'
            f'import * as service from "@/server/modules/{mid}/service";\n\n'
            f'export const {{ GET, PATCH }} = makeStaffItemHandlers({json.dumps(mid)}, service);\n')

def gen_action_route(mid):
    return ('import { makeStaffActionHandler } from "@/server/lib/routeHandlers";\n'
            f'import * as service from "@/server/modules/{mid}/service";\n\n'
            f'export const {{ POST }} = makeStaffActionHandler({json.dumps(mid)}, service);\n')

def gen_route(mid):
    return ('import { makeStaffRouteHandlers } from "@/server/lib/routeHandlers";\n'
            f'import * as service from "@/server/modules/{mid}/service";\n\n'
            f'export const {{ GET, POST }} = makeStaffRouteHandlers({json.dumps(mid)}, service);\n')

_CATCH = ('  } catch (e) {\n'
          '    if (e instanceof ValidationError) return NextResponse.json(err("VALIDATION_FAILED", "Validation failed.", meta(guard.requestId, M), { field_errors: e.fieldErrors }), { status: 422 });\n'
          '    return NextResponse.json(err("INTERNAL", "Unexpected error.", meta(guard.requestId, M)), { status: 500 });\n'
          '  }\n')

def gen_child_route(mid, child_table, fk, write=None):
    # Read-only child sub-collection (detail panel): GET <route>/[id]/<subPath>. POST (add) when write-enabled.
    M = json.dumps(mid); CT = json.dumps(child_table); FK = json.dumps(fk)
    s = ('// GENERATED by _validation/gen_modules.py — DO NOT EDIT.\n'
         'import { NextRequest, NextResponse } from "next/server";\n'
         'import { requireStaffScope } from "@/server/guards/requireStaffScope";\n'
         'import { ok, err, meta } from "@/server/http/envelope";\n'
         'import { ValidationError } from "@/server/lib/defineModule";\n'
         'import { listChildRecords } from "@/server/lib/listChild";\n')
    if write: s += 'import { addChildRecord } from "@/server/lib/childWrite";\n'
    s += ('\nexport async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {\n'
          f'  const guard = await requireStaffScope(request, {M}, "read");\n'
          '  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });\n'
          '  const { id } = await ctx.params;\n'
          f'  return NextResponse.json(ok(await listChildRecords({CT}, {FK}, id, guard.actor), meta(guard.requestId, {M})));\n'
          '}\n')
    if write:
        code = write.get("code") or {}
        opts = json.dumps({k: v for k, v in {"required": write.get("addRequired", []), "allowed": write.get("addAllowed", []),
                           "actorColumn": write.get("actorColumn"), "defaults": write.get("defaults", {}), "module": mid,
                           "codeColumn": code.get("column"), "codePrefix": code.get("prefix"),
                           "parentTable": write.get("parentTable"), "inherit": write.get("inherit"),
                           "nowColumns": write.get("nowColumns")}.items() if v is not None})
        s += ('\nexport async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {\n'
              f'  const guard = await requireStaffScope(request, {M}, "write");\n'
              '  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });\n'
              '  const { id } = await ctx.params;\n'
              '  let body: Record<string, unknown> = {};\n'
              '  try { body = (await request.json()) as Record<string, unknown>; } catch { body = {}; }\n'
              '  try {\n'
              f'    return NextResponse.json(ok(await addChildRecord({CT}, {FK}, id, body, guard.actor, {opts}), meta(guard.requestId, {M})), {{ status: 201 }});\n'.replace("{{", "{").replace("}}", "}")
              + _CATCH.replace("M", M) + '}\n')
    return s

def gen_child_item_route(mid, child_table, fk, review):
    # Review one child row: PATCH <route>/[id]/<subPath>/[cid].
    M = json.dumps(mid); CT = json.dumps(child_table); FK = json.dumps(fk)
    opts = json.dumps({k: v for k, v in {"editable": review.get("editable", []), "reviewerColumn": review.get("reviewerColumn"),
                       "reviewedAtColumn": review.get("reviewedAtColumn"), "module": mid}.items() if v is not None})
    return ('// GENERATED by _validation/gen_modules.py — DO NOT EDIT.\n'
            'import { NextRequest, NextResponse } from "next/server";\n'
            'import { requireStaffScope } from "@/server/guards/requireStaffScope";\n'
            'import { ok, err, meta } from "@/server/http/envelope";\n'
            'import { ValidationError } from "@/server/lib/defineModule";\n'
            'import { reviewChildRecord } from "@/server/lib/childWrite";\n\n'
            'export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string; cid: string }> }) {\n'
            f'  const guard = await requireStaffScope(request, {M}, "write");\n'
            '  if (!guard.ok) return NextResponse.json(guard.body, { status: guard.status });\n'
            '  const { id, cid } = await ctx.params;\n'
            '  let body: Record<string, unknown> = {};\n'
            '  try { body = (await request.json()) as Record<string, unknown>; } catch { body = {}; }\n'
            '  try {\n'
            f'    return NextResponse.json(ok(await reviewChildRecord({CT}, cid, {FK}, id, body, guard.actor, {opts}), meta(guard.requestId, {M})));\n'
            + _CATCH.replace("M", M) + '}\n')

def generate_module(mid, route, table, status_col=None, scope="staff", spec_module=None, exclude=None):
    """Generate service + collection/item/action routes for one module. Reusable by gen_core.
    exclude: action names to drop (e.g. an action whose actor belongs to the other portal)."""
    sm = spec_module or mid
    policy = build_policy(sm, table)
    fields = create_schema_fields(table)
    transitions = build_transitions(sm, table)
    if exclude:
        transitions = {k: v for k, v in transitions.items() if k not in exclude}
    status_col = status_col or MODEL[table].get("status_field") or "status"
    sdir = APP/"server"/"modules"/mid
    sdir.mkdir(parents=True, exist_ok=True)
    (sdir/"service.ts").write_text(gen_service(mid, table, policy, fields, transitions, status_col), encoding="utf-8")
    rdir = APP/"app"/"api"/route
    rdir.mkdir(parents=True, exist_ok=True)
    (rdir/"route.ts").write_text(gen_route(mid), encoding="utf-8")
    idir = rdir/"[id]"
    idir.mkdir(parents=True, exist_ok=True)
    (idir/"route.ts").write_text(gen_item_route(mid), encoding="utf-8")
    if transitions:
        adir = idir/"actions"/"[action]"
        adir.mkdir(parents=True, exist_ok=True)
        (adir/"route.ts").write_text(gen_action_route(mid), encoding="utf-8")
    # Read-only detail-panel sub-routes (one per child sub-collection), staff routes only.
    panels = derive_panels(MODEL, table) if route.startswith("staff/") else []
    for p in panels:
        cdir = idir/p["subPath"]
        cdir.mkdir(parents=True, exist_ok=True)
        (cdir/"route.ts").write_text(gen_child_route(mid, p["table"], p["fk"], p.get("write")), encoding="utf-8")
        review = (p.get("write") or {}).get("review")
        if review:
            iidir = cdir/"[cid]"
            iidir.mkdir(parents=True, exist_ok=True)
            (iidir/"route.ts").write_text(gen_child_item_route(mid, p["table"], p["fk"], review), encoding="utf-8")
    return {"policy": {k: len(v) for k, v in policy.items()}, "fields": len(fields), "transitions": sorted(transitions), "status_col": status_col, "panels": [p["subPath"] for p in panels]}

SKIP = {"school_crm"}  # hand-maintained custom modules — generators must not clobber

# Secondary entities: actionable workflows that live on a non-primary collection of a module
# (gen_modules generates only the primary table per module). service_key, spec_module, table, sub-route.
SECONDARY = [
 ("admin_settings_versions", "admin_settings", "setting_versions", "staff/admin/settings/versions"),
 ("admin_settings_change_requests", "admin_settings", "setting_change_requests", "staff/admin/settings/change-requests"),
 ("reports_exports_requests", "reports_exports", "export_requests", "staff/reports/export-requests"),
 ("courier_ops_dispatch", "courier_ops", "courier_dispatch_batches", "staff/courier/dispatch-batches"),
 ("courier_ops_shipments", "courier_ops", "courier_shipments", "staff/courier/shipments"),
 ("courier_ops_receipts", "courier_ops", "courier_receipts", "staff/courier/receipts"),
 ("courier_ops_exceptions", "courier_ops", "courier_exceptions", "staff/courier/exceptions"),
 ("security_audit_incidents", "security_audit_console", "security_incidents", "staff/security-audit/incidents"),
 ("security_audit_access_reviews", "security_audit_console", "access_reviews", "staff/security-audit/access-reviews"),
 ("audit_cases", "audit", "audit_cases", "staff/security-audit/cases"),
 ("audit_reconciliations", "audit", "reconciliation_runs", "staff/security-audit/reconciliations"),
 ("audit_exports_review", "audit", "audit_exports", "staff/security-audit/exports"),
 ("support_tickets_escalations", "support_tickets", "support_ticket_escalations", "staff/support/escalations"),
 ("task_work_queue_tasks", "task_work_queue", "work_tasks", "staff/tasks/work-tasks"),
 ("task_work_queue_assignments", "task_work_queue", "task_assignments", "staff/tasks/assignments"),
 # core exam-spine secondaries
 ("exam_material_ops_files", "exam_material_ops", "exam_material_files", "staff/exams/materials/files"),
 ("exam_material_ops_approvals", "exam_material_ops", "exam_material_approvals", "staff/exams/materials/approvals"),
 ("finance_ops_payment_links", "finance_ops", "finance_payment_links", "staff/finance/payment-links"),
 ("finance_ops_payments", "finance_ops", "finance_payments", "staff/finance/payments"),
 ("finance_ops_adjustments", "finance_ops", "finance_adjustments", "staff/finance/adjustments"),
 ("evaluation_ops_answer_keys", "evaluation_ops", "evaluation_answer_keys", "staff/evaluation/answer-keys"),
 ("evaluation_ops_import_batches", "evaluation_ops", "evaluation_import_batches", "staff/evaluation/import-batches"),
 ("evaluation_ops_score_batches", "evaluation_ops", "evaluation_score_batches", "staff/evaluation/score-batches"),
 ("results_ops_candidates", "results_ops", "candidate_results", "staff/results/candidates"),
 ("results_ops_publication_windows", "results_ops", "result_publication_windows", "staff/results/publication-windows"),
 ("results_ops_corrections", "results_ops", "result_corrections", "staff/results/corrections"),
 # remaining unbuilt actionable entities (spec_module = lifecycle owner)
 ("audit_events_review", "audit", "audit_events", "staff/security-audit/events"),
 ("certificate_ops_requests", "certificate_ops", "certificate_requests", "staff/certificates/requests"),
 ("evaluation_ops_exceptions", "evaluation_ops", "evaluation_exceptions", "staff/evaluation/exceptions"),
 ("exam_slots_bookings", "exam_slots", "exam_slot_bookings", "staff/exams/slot-bookings"),
 ("exam_slot_ops_reschedules", "exam_slot_ops", "exam_slot_reschedule_requests", "staff/exams/slots/reschedule-requests"),
 ("finance_ops_reconciliations", "finance_ops", "finance_reconciliation_batches", "staff/finance/reconciliations"),
 ("notification_ops_batches", "notification_ops", "notification_batches", "staff/notifications/batches"),
 ("results_publications", "results", "result_publications", "staff/results/publications"),
 ("roles_permissions_change_requests", "roles_permissions", "role_change_requests", "staff/admin/roles/change-requests"),
 ("school_onboarding_documents", "school_onboarding_ops", "school_onboarding_documents", "staff/schools/onboarding/documents"),
 ("school_onboarding_status_controls", "school_onboarding_ops", "school_status_controls", "staff/schools/onboarding/status-controls"),
 ("security_audit_forensics", "security_audit_console", "forensics_cases", "staff/security-audit/forensics"),
 ("staff_users_invitations", "staff_users", "staff_invitations", "staff/admin/users/invitations"),
 ("staff_users_assignment_scopes", "staff_users", "staff_assignment_scopes", "staff/admin/users/assignment-scopes"),
 ("student_roster_ops_corrections", "student_roster_ops", "student_roster_corrections", "staff/students/rosters/corrections"),
 ("support_tickets_tickets", "support_tickets", "support_tickets", "staff/support/tickets"),
 ("task_work_queue_dependencies", "task_work_queue", "task_dependencies", "staff/tasks/dependencies"),
]

# Actions to drop from a secondary service because their actor belongs to the other portal.
SECONDARY_EXCLUDE = {"exam_slots_bookings": ["confirm"]}  # book_slot (confirm) is school-only; staff = ops mgmt (cancel/lock)

if __name__ == "__main__":
    for mid, route in ROUTE.items():
        if mid in SKIP:
            print((mid, "SKIPPED (custom)")); continue
        table = primary_table(mid)
        if not table or table not in MODEL:
            print((mid, "NO_TABLE", table)); continue
        info = generate_module(mid, route, table)
        print((mid, table, info))
    for key, sm, table, route in SECONDARY:
        if table not in MODEL:
            print((key, "NO_TABLE", table)); continue
        info = generate_module(key, route, table, spec_module=sm, exclude=SECONDARY_EXCLUDE.get(key))
        print((key, table, sorted(info["transitions"])))
    print("modules generated:", len(ROUTE), "+ secondary:", len(SECONDARY))
