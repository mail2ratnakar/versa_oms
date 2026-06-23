import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "olympiad_id": z.string().uuid(),
    "scope_type": z.string(),
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
  moduleId: "results_publications",
  table: "result_publications",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["certificate_admin", "evaluation_admin", "operations_staff", "school_coordinator", "system_admin"], "write": ["evaluation_admin", "system_admin"], "export": ["evaluation_admin"]},
  transitions: {"approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "schedule": {"target": "scheduled", "klass": "write", "reasonRequired": false, "dualApproval": false}, "publish": {"target": "published", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "revoke": {"target": "revoked", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
