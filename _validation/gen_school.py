#!/usr/bin/env python3
"""Generate school-portal services + routes (school-scoped) for the school portal."""
import json
from pathlib import Path

APP = Path("versa-oms/app")

# module_id, table, api route path, allow_create, create schema fields (name -> zod)
MODS = [
 ("school_students", "students", "school/students", True,
   {"student_name":"z.string().min(1)", "grade":"z.string().min(1)", "consent_obtained":"z.coerce.boolean()"}),
 ("school_payments", "payments", "school/payments", False, {}),
 ("school_results", "candidate_results", "school/results", False, {}),
 ("school_certificates", "certificates", "school/certificates", False, {}),
 ("school_materials", "exam_material_packages", "school/materials", False, {}),
 ("school_slots", "school_exam_slot_assignments", "school/exam-slots", False, {}),
]

def gen_service(mid, table, fields):
    lines = ['import { z } from "zod";',
             'import { defineModuleService } from "@/server/lib/defineModule";',
             "",
             "const createSchema = z",
             "  .object({"]
    for n, zt in fields.items():
        lines.append(f"    {json.dumps(n)}: {zt},")
    lines.append("  })")
    lines.append("  .passthrough();")
    lines.append("")
    lines.append("export const { listModuleRecords, createModuleRecord } = defineModuleService({")
    lines.append(f"  moduleId: {json.dumps(mid)},")
    lines.append(f"  table: {json.dumps(table)},")
    lines.append('  scope: "school",')
    lines.append("  policy: {},")
    lines.append("  createSchema,")
    lines.append("});")
    return "\n".join(lines) + "\n"

def gen_route(mid, allow_create):
    return ('import { makeSchoolRouteHandlers } from "@/server/lib/routeHandlers";\n'
            f'import * as service from "@/server/modules/{mid}/service";\n\n'
            f'export const {{ GET, POST }} = makeSchoolRouteHandlers({json.dumps(mid)}, service, '
            f'{{ allowCreate: {"true" if allow_create else "false"} }});\n')

for mid, table, route, allow_create, fields in MODS:
    sdir = APP/"server"/"modules"/mid
    sdir.mkdir(parents=True, exist_ok=True)
    (sdir/"service.ts").write_text(gen_service(mid, table, fields), encoding="utf-8")
    rdir = APP/"app"/"api"/route
    rdir.mkdir(parents=True, exist_ok=True)
    if mid == "school_materials":
        print("  (skipping route for school_materials: custom finance/release-gate route is hand-maintained)")
    else:
        (rdir/"route.ts").write_text(gen_route(mid, allow_create), encoding="utf-8")
    print(f"{mid:22} -> {table:30} /api/{route}  create={allow_create}")
print("school modules generated:", len(MODS))
