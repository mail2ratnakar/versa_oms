import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "participation_id": z.string().uuid(),
    "courier_batch_id": z.string().uuid(),
    "uploaded_file": z.string().uuid(),
    "uploaded_by": z.string().uuid(),
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
  moduleId: "core_omr",
  table: "omr_imports",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["evaluation_admin", "operations_staff", "system_admin"], "write": ["evaluation_admin", "operations_staff", "system_admin"]},
  transitions: {"approve_for_results": {"target": "approved_for_results", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
