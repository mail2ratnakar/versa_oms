import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "name": z.string(),
    "city": z.string(),
    "state": z.string(),
    "coordinator_name": z.string(),
    "coordinator_email": z.string(),
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
  moduleId: "core_schools",
  table: "schools",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["operations_staff", "sales_staff", "school_coordinator", "system_admin"], "write": ["operations_staff", "sales_staff", "system_admin"]},
  transitions: {"approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "block": {"target": "blocked", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  listConfig: {"filterColumns": ["status", "board"], "searchColumns": ["school_code", "name", "city", "principal_name", "coordinator_name", "coordinator_mobile"], "sortColumns": ["created_at", "status", "updated_at"], "defaultSort": {"column": "created_at", "ascending": false}, "facetColumn": "status"},
  createSchema,
});
