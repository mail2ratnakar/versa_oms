import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "school_id": z.string().uuid(),
    "olympiad_id": z.string().uuid(),
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
  moduleId: "core_participations",
  table: "participations",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["operations_staff", "sales_staff", "school_coordinator", "system_admin"], "write": ["operations_staff", "school_coordinator", "system_admin"]},
  transitions: {"approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "block": {"target": "blocked", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
