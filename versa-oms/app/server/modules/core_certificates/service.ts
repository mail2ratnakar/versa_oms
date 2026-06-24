import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "certificate_number": z.string(),
    "student_id": z.string().uuid(),
    "result_id": z.string().uuid(),
    "school_id": z.string().uuid(),
    "revocation_reason": z.string(),
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
  moduleId: "core_certificates",
  table: "certificates",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["certificate_admin", "operations_staff", "school_coordinator", "system_admin"], "write": ["certificate_admin", "system_admin"], "export": ["certificate_admin"], "download": ["certificate_admin", "school_coordinator", "system_admin"]},
  transitions: {"generate": {"target": "generated", "klass": "write", "reasonRequired": false, "dualApproval": false}, "approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "publish": {"target": "published", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "revoke": {"target": "revoked", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  listConfig: {"filterColumns": ["status", "certificate_type"], "searchColumns": ["certificate_number", "verification_code"], "sortColumns": ["status"], "facetColumn": "status"},
  createSchema,
});
