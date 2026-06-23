import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "code": z.string(),
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
  moduleId: "courier_ops",
  table: "courier_vendors",
  scope: "staff",
  statusColumn: "vendor_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "courier_logistics_manager", "evaluation_center_intake_operator", "evaluation_manager", "operations_executive", "operations_head", "school_coordinator", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "courier_logistics_manager", "evaluation_center_intake_operator", "evaluation_manager", "operations_executive", "operations_head", "school_coordinator", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "courier_logistics_manager", "evaluation_center_intake_operator", "evaluation_manager", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "operations_head", "security_admin_reviewer", "super_admin"]},
  transitions: {"block": {"target": "blocked", "klass": "write", "reasonRequired": false, "dualApproval": false}},
  createSchema,
});
