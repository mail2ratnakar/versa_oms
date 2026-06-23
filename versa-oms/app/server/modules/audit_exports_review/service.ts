import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "export_scope": z.any(),
    "requested_by": z.string().uuid(),
    "reason": z.string(),
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
  moduleId: "audit_exports_review",
  table: "audit_exports",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["operations_admin", "security_admin", "system_admin"], "write": ["security_admin", "system_admin"], "download": ["security_admin"]},
  transitions: {"approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "generate": {"target": "generated", "klass": "write", "reasonRequired": false, "dualApproval": false}, "reject": {"target": "rejected", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
