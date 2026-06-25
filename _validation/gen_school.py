#!/usr/bin/env python3
"""Generate school-portal services + routes (school-scoped) for the school portal.

A school module may also expose ACTIONS (status transitions the school performs on its
own records, e.g. confirm a slot assignment). For those, the service gets transitions +
transitionModuleRecord, and a school action route is generated. School scope + the kernel
preconditions (workflows.json guards) are enforced automatically."""
import json
from pathlib import Path

APP = Path("versa-oms/app")

# mid, table, api route, allow_create, create-fields, status_column, school_actions{action:target}, opts
MODS = [
 ("school_students", "students", "school/students", True,
   {"student_name": "z.string().min(1)", "grade": "z.string().min(1)", "consent_obtained": "z.coerce.boolean()"}, None, {}, {}),
 ("school_payments", "payments", "school/payments", False, {}, "status",
   {"create_link": "payment_link_created"}, {}),  # school initiates its payment (workflow: create_payment_link)
 ("school_results", "candidate_results", "school/results", False, {}, None, {}, {}),
 ("school_certificates", "certificates", "school/certificates", False, {}, "status", {},
   {"download": {"codeColumn": "verification_code", "urlTemplate": "/api/verify/certificate/{code}", "gateColumn": "status", "gateValues": ["published", "downloaded", "verified"]}}),
 ("school_materials", "exam_material_packages", "school/materials", False, {}, None, {}, {}),
 ("school_slots", "school_exam_slot_assignments", "school/exam-slots", False, {}, "assignment_status",
   {"confirm": "confirmed"}, {}),  # school confirms its slot assignment (workflow: confirm_assignment -> confirmed)
 # school uploads its student roster (workflow: upload_roster none->uploaded; ingest file; then submit_for_lock)
 ("school_roster", "student_roster_batches", "school/roster", True,
   {"participation_id": "z.string().uuid()", "source_type": "z.string()"}, "batch_status",
   {"submit": "submitted_for_lock"}, {"codeColumn": "batch_code", "codePrefix": "ROST", "initialStatus": "uploaded", "ingest": True, "securedl": {"fileColumn": "source_file"}}),
 # school submits a roster correction (workflow: submit_correction draft->submitted)
 ("school_roster_corrections", "student_roster_corrections", "school/roster-corrections", True,
   {"roster_batch_id": "z.string().uuid()", "correction_type": "z.string()", "requested_change": "z.any()", "reason": "z.string()"},
   "correction_status", {"submit": "submitted"},
   {"codeColumn": "correction_code", "codePrefix": "CORR", "initialStatus": "draft", "reasonIsColumn": True}),
 # school books an exam slot (workflow: book_slot none->confirmed; cancel_booking confirmed->cancelled)
 ("school_bookings", "exam_slot_bookings", "school/slot-bookings", True,
   {"participation_id": "z.string().uuid()", "exam_slot_id": "z.string().uuid()", "confirmed_student_count": "z.coerce.number().int()", "payment_status_at_booking": "z.string()"},
   "status", {"cancel": "cancelled"},
   {"codeColumn": "booking_code", "codePrefix": "BOOK", "initialStatus": "confirmed"}),
]

def gen_service(mid, table, fields, status_col, actions, opts):
    L = ['import { z } from "zod";', 'import { defineModuleService } from "@/server/lib/defineModule";', "",
         "const createSchema = z", "  .object({"]
    for n, zt in fields.items():
        L.append(f"    {json.dumps(n)}: {zt},")
    L += ["  })", "  .passthrough();", ""]
    exports = "listModuleRecords, createModuleRecord"
    if actions:
        exports += ", transitionModuleRecord, getTransition"
    if opts.get("download") or opts.get("securedl"):
        exports += ", getModuleRecord"
    L.append(f"export const {{ {exports} }} = defineModuleService({{")
    L.append(f"  moduleId: {json.dumps(mid)},")
    L.append(f"  table: {json.dumps(table)},")
    L.append('  scope: "school",')
    if status_col:
        L.append(f"  statusColumn: {json.dumps(status_col)},")
    for k in ("codeColumn", "codePrefix", "initialStatus", "reasonIsColumn"):
        if opts.get(k):
            L.append(f"  {k}: {json.dumps(opts[k])},")
    L.append("  policy: {},")
    if actions:
        tdict = {a: {"target": t, "klass": "write", "reasonRequired": False, "dualApproval": False} for a, t in actions.items()}
        L.append(f"  transitions: {json.dumps(tdict)},")
    L += ["  createSchema,", "});"]
    return "\n".join(L) + "\n"

def gen_route(mid, allow_create):
    return ('import { makeSchoolRouteHandlers } from "@/server/lib/routeHandlers";\n'
            f'import * as service from "@/server/modules/{mid}/service";\n\n'
            f'export const {{ GET, POST }} = makeSchoolRouteHandlers({json.dumps(mid)}, service, '
            f'{{ allowCreate: {"true" if allow_create else "false"} }});\n')

def gen_action_route(mid):
    return ('import { makeSchoolActionHandler } from "@/server/lib/routeHandlers";\n'
            f'import * as service from "@/server/modules/{mid}/service";\n\n'
            f'export const {{ POST }} = makeSchoolActionHandler({json.dumps(mid)}, service);\n')

def gen_download_route(mid, dl):
    return ('import { makeSchoolDownloadHandler } from "@/server/lib/routeHandlers";\n'
            f'import * as service from "@/server/modules/{mid}/service";\n\n'
            f'export const {{ GET }} = makeSchoolDownloadHandler({json.dumps(mid)}, service, {json.dumps(dl)});\n')

def gen_ingest_route(mid):
    return ('import { makeRosterIngestHandler } from "@/server/roster/ingestHandlers";\n\n'
            f'export const {{ POST }} = makeRosterIngestHandler({json.dumps(mid)}, "school");\n')

def gen_securedl_route(mid, sd):
    cfg = {"fileColumn": sd["fileColumn"], "scope": "school"}
    return ('import { makeSecureDownloadHandler } from "@/server/lib/routeHandlers";\n'
            f'import * as service from "@/server/modules/{mid}/service";\n\n'
            f'export const {{ GET }} = makeSecureDownloadHandler({json.dumps(mid)}, service, {json.dumps(cfg)});\n')

for mid, table, route, allow_create, fields, status_col, actions, opts in MODS:
    sdir = APP / "server" / "modules" / mid
    sdir.mkdir(parents=True, exist_ok=True)
    (sdir / "service.ts").write_text(gen_service(mid, table, fields, status_col, actions, opts), encoding="utf-8")
    rdir = APP / "app" / "api" / route
    rdir.mkdir(parents=True, exist_ok=True)
    if mid == "school_materials":
        print("  (skipping route for school_materials: custom finance/release-gate route is hand-maintained)")
    else:
        (rdir / "route.ts").write_text(gen_route(mid, allow_create), encoding="utf-8")
    if actions:
        adir = rdir / "[id]" / "actions" / "[action]"
        adir.mkdir(parents=True, exist_ok=True)
        (adir / "route.ts").write_text(gen_action_route(mid), encoding="utf-8")
        print(f"  {mid}: + action route {list(actions)}")
    if opts.get("download"):
        ddir = rdir / "[id]" / "download"
        ddir.mkdir(parents=True, exist_ok=True)
        (ddir / "route.ts").write_text(gen_download_route(mid, opts["download"]), encoding="utf-8")
        print(f"  {mid}: + download route")
    if opts.get("ingest"):
        idir = rdir / "[id]" / "ingest"
        idir.mkdir(parents=True, exist_ok=True)
        (idir / "route.ts").write_text(gen_ingest_route(mid), encoding="utf-8")
        print(f"  {mid}: + ingest route")
    if opts.get("securedl"):
        fdir = rdir / "[id]" / "file"
        fdir.mkdir(parents=True, exist_ok=True)
        (fdir / "route.ts").write_text(gen_securedl_route(mid, opts["securedl"]), encoding="utf-8")
        print(f"  {mid}: + secure download route")
    print(f"{mid:22} -> {table:30} /api/{route}  create={allow_create}")
print("school modules generated:", len(MODS))
