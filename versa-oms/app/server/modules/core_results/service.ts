import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "student_id": z.string().uuid(),
    "participation_id": z.string().uuid(),
    "school_id": z.string().uuid(),
    "raw_score": z.coerce.number(),
    "max_marks": z.coerce.number(),
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
  moduleId: "core_results",
  table: "results",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["certificate_admin", "evaluation_admin", "operations_staff", "school_coordinator", "system_admin"], "write": ["evaluation_admin", "system_admin"], "export": ["evaluation_admin", "operations_staff", "school_coordinator"]},
  transitions: {"generate": {"target": "generated", "klass": "write", "reasonRequired": false, "dualApproval": false}, "approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "publish": {"target": "published", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "withhold": {"target": "withheld", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "revoke": {"target": "revoked", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
