import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "olympiad_id": z.string().uuid(),
    "file": z.string().uuid(),
    "release_at": z.string(),
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
  moduleId: "core_exam_materials",
  table: "exam_materials",
  scope: "staff",
  statusColumn: "status",
  policy: {"read": ["finance_staff", "operations_staff", "school_coordinator", "system_admin"], "write": ["operations_staff", "system_admin"], "export": ["operations_staff"], "download": ["operations_staff", "school_coordinator", "system_admin"]},
  transitions: {"generate": {"target": "generated", "klass": "write", "reasonRequired": false, "dualApproval": false}, "approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "release": {"target": "released", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "revoke": {"target": "revoked", "klass": "approve", "reasonRequired": true, "dualApproval": false}, "archive": {"target": "archived", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  listConfig: {"filterColumns": ["status", "material_type"], "searchColumns": ["material_code"], "sortColumns": ["status"], "facetColumn": "status"},
  createSchema,
});
