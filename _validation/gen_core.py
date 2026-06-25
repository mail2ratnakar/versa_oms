#!/usr/bin/env python3
"""Generate dedicated STAFF CRUD modules + UI for the olympiad-core entities
(canonical tables that previously had only school views). Reuses gen_modules +
gen_ui helpers; policies/transitions come from the underlying olympiad spec."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path("_validation")))
from gen_modules import generate_module, MODEL
from gen_ui import gen_table_page, CORE_DOWNLOADS

# (core_mid, spec_module, table, route, title)
CORE = [
 ("core_schools", "schools", "schools", "staff/core/schools", "Schools"),
 ("core_students", "students", "students", "staff/core/students", "Students"),
 ("core_participations", "schools", "participations", "staff/core/participations", "Participations"),
 ("core_payments", "payments", "payments", "staff/core/payments", "Payments (core)"),
 ("core_exam_slots", "exam_slots", "exam_slots", "staff/core/exam-slots", "Exam slots (core)"),
 ("core_exam_materials", "exam_materials", "exam_materials", "staff/core/exam-materials", "Exam materials (core)"),
 ("core_courier", "courier", "courier_batches", "staff/core/courier-batches", "Courier batches"),
 ("core_omr", "omr_imports", "omr_imports", "staff/core/omr", "OMR imports"),
 ("core_results", "results", "results", "staff/core/results", "Results (core)"),
 ("core_certificates", "certificates", "certificates", "staff/core/certificates", "Certificates (core)"),
]

made = 0
for core_mid, spec_module, table, route, title in CORE:
    if table not in MODEL:
        print("SKIP (no table):", core_mid, table); continue
    info = generate_module(core_mid, route, table, spec_module=spec_module)
    gen_table_page(table, route, title, f"staff · {core_mid}", mid=spec_module, download_action=CORE_DOWNLOADS.get(core_mid))
    made += 1
    print(core_mid, "->", table, info)
print("core modules generated:", made)
