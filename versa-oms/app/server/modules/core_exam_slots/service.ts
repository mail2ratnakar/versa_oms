import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "exam_date": z.string(),
    "start_time": z.string(),
    "end_time": z.string(),
    "capacity_schools": z.coerce.number().int(),
    "capacity_students": z.coerce.number().int(),
  })
  .passthrough();

export const {
  listModuleRecords,
  createModuleRecord,
  getModuleRecord,
  updateModuleRecord,
  transitionModuleRecord,
  getTransition,
} = defineModuleService({
  moduleId: "core_exam_slots",
  table: "exam_slots",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["finance_staff", "operations_staff", "school_coordinator", "system_admin"], "write": ["operations_staff", "system_admin"], "export": ["operations_staff"]},
  transitions: {"close": {"target": "closed", "klass": "write", "reasonRequired": false, "dualApproval": false}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": false, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  listConfig: {"filterColumns": ["status", "mode"], "searchColumns": ["slot_code"], "sortColumns": ["status"], "facetColumn": "status"},
  createSchema,
});
