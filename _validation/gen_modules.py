#!/usr/bin/env python3
"""Generate per-module service.ts + route.ts for the 19 company-portal modules,
driven by each module's schema.json (primary table) + permissions.json (policy)
and the canonical model (required columns -> zod)."""
import json
from pathlib import Path

APP = Path("versa-oms/app")
SPEC = Path("versa-oms/spec/modules")
MODEL = json.loads(Path("versa-oms/implementation/CANONICAL_DATA_MODEL.json").read_text(encoding="utf-8"))["tables"]
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
 "cancelled": ("cancel","write"), "archived": ("archive","write"),
 "suspended": ("suspend","write"), "blocked": ("block","write"),
 "scheduled": ("schedule","write"), "dispatched": ("dispatch","write"),
 "delivered": ("deliver","write"), "received": ("receive","write"),
 "validated": ("validate","write"), "generated": ("generate","write"),
 "submitted": ("submit","write"), "submitted_for_lock": ("submit_for_lock","write"),
 "closed": ("close","write"), "in_transit": ("mark_in_transit","write"),
}

def entity_statuses(mid, table):
    p = SPEC/mid/"lifecycle_states.json"
    if not p.exists(): return []
    lc = json.loads(p.read_text(encoding="utf-8"))
    ents = {e.get("entity"): e for e in lc.get("entities",[])}
    cands = [table, table[:-1] if table.endswith("s") else table]
    for c in cands:
        if c in ents: return ents[c].get("statuses",[]) or []
    vals = list(ents.values())
    return vals[0].get("statuses",[]) if vals else []

def build_transitions(mid, table):
    statuses = entity_statuses(mid, table)
    high = mid in HIGH_RISK_MODULES
    dual = mid in DUAL_MODULES
    out = {}
    for st in statuses:
        if st in STATUS_ACTION:
            verb, klass = STATUS_ACTION[st]
            out[verb] = {
                "target": st,
                "klass": klass,
                "reasonRequired": (klass == "approve") or high,
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
    fields=[]
    for c in t.get("columns",[]):
        n=c["name"]
        if n in COMMON: continue
        if c.get("nullable"): continue
        if c.get("default") is not None: continue
        if n=="user_id" or n.endswith("_code") or n.endswith("_status") or n.endswith("_count"): continue
        fields.append((n, zod_type(c["pg_type"])))
    return fields

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

def generate_module(mid, route, table, status_col=None, scope="staff", spec_module=None):
    """Generate service + collection/item/action routes for one module. Reusable by gen_core."""
    sm = spec_module or mid
    policy = build_policy(sm, table)
    fields = create_schema_fields(table)
    transitions = build_transitions(sm, table)
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
    return {"policy": {k: len(v) for k, v in policy.items()}, "fields": len(fields), "transitions": sorted(transitions), "status_col": status_col}

SKIP = {"school_crm", "school_onboarding_ops"}  # hand-maintained custom modules — generators must not clobber

if __name__ == "__main__":
    for mid, route in ROUTE.items():
        if mid in SKIP:
            print((mid, "SKIPPED (custom)")); continue
        table = primary_table(mid)
        if not table or table not in MODEL:
            print((mid, "NO_TABLE", table)); continue
        info = generate_module(mid, route, table)
        print((mid, table, info))
    print("modules generated:", len(ROUTE))
