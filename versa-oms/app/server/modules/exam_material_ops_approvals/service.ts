import { z } from "zod";
import { defineModuleService } from "@/server/lib/defineModule";

const createSchema = z
  .object({
    "material_package_id": z.string().uuid(),
    "approval_type": z.string(),
    "approval_level": z.string(),
    "requested_by": z.string().uuid(),
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
  moduleId: "exam_material_ops_approvals",
  table: "exam_material_approvals",
  scope: "staff",
  statusColumn: "approval_status",
  policy: {"read": ["auditor_read_only_reviewer", "company_admin", "courier_logistics_manager", "evaluation_manager", "exam_operations_manager", "material_release_manager", "operations_head", "school_coordinator", "security_admin_reviewer", "super_admin", "support_executive"], "write": ["company_admin", "exam_operations_manager", "material_release_manager", "operations_head", "question_paper_content_manager", "super_admin"], "approve": ["auditor_read_only_reviewer", "company_admin", "operations_head", "security_admin_reviewer", "super_admin"], "export": ["company_admin", "operations_head", "security_admin_reviewer", "super_admin"], "download": ["material_release_manager", "school_coordinator", "security_admin_reviewer"]},
  transitions: {"approve": {"target": "approved", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "reject": {"target": "rejected", "klass": "approve", "reasonRequired": true, "dualApproval": true}, "cancel": {"target": "cancelled", "klass": "write", "reasonRequired": true, "dualApproval": false}},
  createSchema,
});
